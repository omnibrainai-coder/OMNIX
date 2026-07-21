import type { ProductListing, PurchaseResult } from '../types/billing';

declare global {
  interface Window {
    AndroidBilling?: {
      startSubscriptionPurchase: (payload: string) => Promise<string> | string;
      getProductDetails?: (payload: string) => Promise<string> | string;
      openManageSubscriptions?: (url: string) => void;
    };
    __OMNIX_BILLING_DEV_MODE__?: boolean;
  }
}

const DEFAULT_PRODUCT: ProductListing = {
  productId: 'bytechat_monthly_40',
  title: 'ByteChat Premium',
  description: 'Ad-free messaging, premium identity flair, and high quality calling.',
  price: '$0.40/month',
  billingPeriod: 'P1M',
};

function parseNativeResponse(raw: string | Promise<string>): Promise<PurchaseResult | ProductListing[]> {
  return Promise.resolve(raw).then((resolved) => JSON.parse(resolved) as PurchaseResult | ProductListing[]);
}

export async function getPlayProductDetails(): Promise<ProductListing[]> {
  if (window.AndroidBilling?.getProductDetails) {
    return parseNativeResponse(window.AndroidBilling.getProductDetails(JSON.stringify({ productIds: [DEFAULT_PRODUCT.productId] }))) as Promise<ProductListing[]>;
  }
  return [DEFAULT_PRODUCT];
}

export async function launchPlaySubscriptionPurchase(productId: string, userId: string): Promise<PurchaseResult> {
  if (window.AndroidBilling?.startSubscriptionPurchase) {
    return parseNativeResponse(
      window.AndroidBilling.startSubscriptionPurchase(
        JSON.stringify({
          productId,
          obfuscatedAccountId: userId,
        }),
      ),
    ) as Promise<PurchaseResult>;
  }

  if (window.__OMNIX_BILLING_DEV_MODE__) {
    return {
      status: 'success',
      productId,
      purchaseToken: `test_${Date.now()}`,
      orderId: `GPA.${Date.now()}`,
      message: 'Development billing fallback completed.',
    };
  }

  return {
    status: 'failed',
    productId,
    message: 'Google Play Billing is only available in the Android app runtime.',
  };
}

export function openManageSubscription(url: string): void {
  if (window.AndroidBilling?.openManageSubscriptions) {
    window.AndroidBilling.openManageSubscriptions(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}