package com.omnix.app

import android.webkit.JavascriptInterface
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class BiometricBridge(private val activity: MainActivity) {
    @JavascriptInterface
    fun canAuthenticateBiometrics(): Boolean {
        val biometricManager = BiometricManager.from(activity)
        return biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG) == BiometricManager.BIOMETRIC_SUCCESS
    }

    @JavascriptInterface
    fun authenticateBiometric(promptTitle: String, promptSubtitle: String): String {
        if (!canAuthenticateBiometrics()) {
            return "unsupported"
        }

        val latch = CountDownLatch(1)
        var result = "failed"
        val executor = ContextCompat.getMainExecutor(activity)
        val prompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(authResult: BiometricPrompt.AuthenticationResult) {
                result = "success"
                latch.countDown()
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                result = if (errorCode == BiometricPrompt.ERROR_USER_CANCELED || errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON) "cancelled" else "failed"
                latch.countDown()
            }

            override fun onAuthenticationFailed() {
                result = "failed"
            }
        })

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(promptTitle)
            .setSubtitle(promptSubtitle)
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
            .setNegativeButtonText("Use PIN")
            .build()

        activity.runOnUiThread {
            prompt.authenticate(promptInfo)
        }

        latch.await(45, TimeUnit.SECONDS)
        return result
    }
}