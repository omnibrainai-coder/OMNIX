package com.omnix.admin.tablet

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class AdminAuthApi(private val baseUrl: String) {
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()
    private val client = OkHttpClient.Builder().build()

    fun bootstrap(tabletAndroidId: String, ssid: String, gatewayIp: String): BootstrapResult {
        val payload = JSONObject()
            .put("tablet_android_id", tabletAndroidId)
            .put("wifi_ssid", ssid)
            .put("gateway_ip", gatewayIp)

        val request = Request.Builder()
            .url("$baseUrl/api/admin-auth/tablet/bootstrap")
            .post(payload.toString().toRequestBody(jsonMediaType))
            .build()

        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("Bootstrap failed: ${response.code} $body")
            }

            val json = JSONObject(body)
            return BootstrapResult(
                challengeId = json.getString("challenge_id"),
                message = json.optString("message", "Please wait...")
            )
        }
    }

    fun pollStatus(challengeId: String): StatusResult {
        val request = Request.Builder()
            .url("$baseUrl/api/admin-auth/tablet/status/$challengeId")
            .get()
            .build()

        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("Status failed: ${response.code} $body")
            }

            val json = JSONObject(body)
            return StatusResult(
                status = json.optString("status", "pending"),
                message = json.optString("message", ""),
                approvalToken = json.optString("approval_token", "")
            )
        }
    }
}

data class BootstrapResult(val challengeId: String, val message: String)

data class StatusResult(val status: String, val message: String, val approvalToken: String)
