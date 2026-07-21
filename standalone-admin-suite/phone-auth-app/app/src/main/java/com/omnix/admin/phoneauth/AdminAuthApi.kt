package com.omnix.admin.phoneauth

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class AdminAuthApi(private val baseUrl: String) {
    private val jsonType = "application/json; charset=utf-8".toMediaType()
    private val client = OkHttpClient.Builder().build()

    fun sendPhoneDecision(challengeId: String, decision: String): String {
        val payload = JSONObject()
            .put("challenge_id", challengeId)
            .put("decision", decision)

        val request = Request.Builder()
            .url("$baseUrl/api/admin-auth/phone/respond")
            .post(payload.toString().toRequestBody(jsonType))
            .build()

        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("Decision failed: ${response.code} $body")
            }
            val json = JSONObject(body)
            return json.optString("phone_nonce", "")
        }
    }

    fun submitBiometricApproval(challengeId: String, nonce: String) {
        val payload = JSONObject()
            .put("challenge_id", challengeId)
            .put("phone_nonce", nonce)
            .put("approver_id", "affan-phone")

        val request = Request.Builder()
            .url("$baseUrl/api/admin-auth/phone/biometric-approve")
            .post(payload.toString().toRequestBody(jsonType))
            .build()

        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("Biometric approval failed: ${response.code} $body")
            }
        }
    }
}
