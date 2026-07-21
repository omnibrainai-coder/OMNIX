package com.omnix.billing

import android.app.Activity
import android.webkit.JavascriptInterface
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.google.gson.Gson
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class PlayBillingBridge(private val activity: Activity) : PurchasesUpdatedListener {
    private val gson = Gson()
    private val billingClient: BillingClient = BillingClient.newBuilder(activity)
        .setListener(this)
        .enablePendingPurchases(
            PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .build()
        )
        .build()

    private var latestProductDetails: ProductDetails? = null
    private var pendingLatch: CountDownLatch? = null
    private var pendingPurchaseResponse: String = gson.toJson(
        mapOf(
            "status" to "failed",
            "productId" to "bytechat_monthly_40",
            "message" to "Billing flow has not been started.",
        )
    )

    init {
        connectIfNeeded()
    }

    private fun connectIfNeeded() {
        if (billingClient.isReady) {
            return
        }
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryProductDetailsInternal("bytechat_monthly_40")
                }
            }

            override fun onBillingServiceDisconnected() {
                // The host app should retry on foreground resume.
            }
        })
    }

    @JavascriptInterface
    fun getProductDetails(payload: String): String {
        connectIfNeeded()
        queryProductDetailsInternal("bytechat_monthly_40")
        val details = latestProductDetails
        return gson.toJson(
            listOf(
                mapOf(
                    "productId" to (details?.productId ?: "bytechat_monthly_40"),
                    "title" to (details?.title ?: "ByteChat Premium"),
                    "description" to (details?.description ?: "Ad-free messaging, custom badges, and HQ calls."),
                    "price" to (details?.subscriptionOfferDetails?.firstOrNull()?.pricingPhases?.pricingPhaseList?.firstOrNull()?.formattedPrice ?: "$0.40/month"),
                    "billingPeriod" to (details?.subscriptionOfferDetails?.firstOrNull()?.pricingPhases?.pricingPhaseList?.firstOrNull()?.billingPeriod ?: "P1M"),
                )
            )
        )
    }

    @JavascriptInterface
    fun startSubscriptionPurchase(payload: String): String {
        connectIfNeeded()
        val details = latestProductDetails ?: return gson.toJson(
            mapOf(
                "status" to "failed",
                "productId" to "bytechat_monthly_40",
                "message" to "Product details unavailable.",
            )
        )

        val offerToken = details.subscriptionOfferDetails?.firstOrNull()?.offerToken
        if (offerToken.isNullOrEmpty()) {
            return gson.toJson(
                mapOf(
                    "status" to "failed",
                    "productId" to details.productId,
                    "message" to "No subscription offer token returned by Google Play.",
                )
            )
        }

        val latch = CountDownLatch(1)
        pendingLatch = latch
        val params = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(details)
            .setOfferToken(offerToken)
            .build()
        val flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(params))
            .build()

        activity.runOnUiThread {
            pendingPurchaseResponse = gson.toJson(
                mapOf(
                    "status" to "pending",
                    "productId" to details.productId,
                    "message" to "Waiting for Google Play purchase result.",
                )
            )
            billingClient.launchBillingFlow(activity, flowParams)
        }

        latch.await(90, TimeUnit.SECONDS)
        pendingLatch = null
        return pendingPurchaseResponse
    }

    @JavascriptInterface
    fun openManageSubscriptions(url: String) {
        activity.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url)))
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        val response = when (billingResult.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                val purchase = purchases?.firstOrNull()
                if (purchase == null) {
                    mapOf(
                        "status" to "failed",
                        "productId" to "bytechat_monthly_40",
                        "message" to "No purchase payload returned.",
                    )
                } else {
                    if (!purchase.isAcknowledged) {
                        billingClient.acknowledgePurchase(
                            AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build(),
                        ) { }
                    }
                    mapOf(
                        "status" to when (purchase.purchaseState) {
                            Purchase.PurchaseState.PENDING -> "pending"
                            Purchase.PurchaseState.PURCHASED -> "success"
                            else -> "failed"
                        },
                        "productId" to purchase.products.firstOrNull().orEmpty(),
                        "purchaseToken" to purchase.purchaseToken,
                        "orderId" to (purchase.orderId ?: ""),
                        "message" to if (purchase.purchaseState == Purchase.PurchaseState.PENDING) "Transaction is pending." else "Purchase completed.",
                    )
                }
            }
            BillingClient.BillingResponseCode.USER_CANCELED -> mapOf(
                "status" to "cancelled",
                "productId" to "bytechat_monthly_40",
                "message" to "User cancelled the billing flow.",
            )
            else -> mapOf(
                "status" to "failed",
                "productId" to "bytechat_monthly_40",
                "message" to (billingResult.debugMessage.ifBlank { "Google Play billing failed." }),
            )
        }
        pendingPurchaseResponse = gson.toJson(response)
        pendingLatch?.countDown()
    }

    private fun queryProductDetailsInternal(productId: String) {
        val params = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(productId)
            .setProductType(BillingClient.ProductType.SUBS)
            .build()
        billingClient.queryProductDetailsAsync(
            QueryProductDetailsParams.newBuilder().setProductList(listOf(params)).build(),
        ) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                latestProductDetails = productDetailsList.firstOrNull()
            }
        }
    }
}