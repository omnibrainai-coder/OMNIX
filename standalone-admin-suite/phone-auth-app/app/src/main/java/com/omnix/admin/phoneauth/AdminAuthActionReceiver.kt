package com.omnix.admin.phoneauth

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AdminAuthActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val challengeId = intent.getStringExtra(AuthConstants.EXTRA_CHALLENGE_ID) ?: return
        val api = AdminAuthApi(BuildConfig.BACKEND_BASE_URL)

        when (intent.action) {
            AuthConstants.ACTION_NO -> {
                CoroutineScope(Dispatchers.IO).launch {
                    runCatching { api.sendPhoneDecision(challengeId, "no") }
                }
            }

            AuthConstants.ACTION_YES -> {
                CoroutineScope(Dispatchers.IO).launch {
                    val nonce = runCatching { api.sendPhoneDecision(challengeId, "yes") }.getOrNull().orEmpty()
                    if (nonce.isBlank()) {
                        return@launch
                    }
                    val launch = Intent(context, BiometricAuthorizeActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                        putExtra(AuthConstants.EXTRA_CHALLENGE_ID, challengeId)
                        putExtra(AuthConstants.EXTRA_NONCE, nonce)
                        putExtra(AuthConstants.EXTRA_SSID, intent.getStringExtra(AuthConstants.EXTRA_SSID).orEmpty())
                        putExtra(AuthConstants.EXTRA_GATEWAY, intent.getStringExtra(AuthConstants.EXTRA_GATEWAY).orEmpty())
                    }
                    context.startActivity(launch)
                }
            }
        }
    }
}
