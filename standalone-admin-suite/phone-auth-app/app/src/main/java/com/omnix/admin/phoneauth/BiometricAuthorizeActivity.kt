package com.omnix.admin.phoneauth

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class BiometricAuthorizeActivity : ComponentActivity() {
    private var message by mutableStateOf("Please authorize your fingerprint to scan.")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            Column(
                modifier = Modifier.fillMaxSize().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text("Hey Affan", style = MaterialTheme.typography.headlineMedium)
                Text(message, modifier = Modifier.padding(top = 12.dp))
            }
        }

        val challengeId = intent.getStringExtra(AuthConstants.EXTRA_CHALLENGE_ID).orEmpty()
        val nonce = intent.getStringExtra(AuthConstants.EXTRA_NONCE).orEmpty()

        if (challengeId.isBlank() || nonce.isBlank()) {
            message = "Authorization payload missing."
            return
        }

        val biometricManager = BiometricManager.from(this)
        val available = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)
        if (available != BiometricManager.BIOMETRIC_SUCCESS) {
            message = "BIOMETRIC_STRONG is required. PIN/password fallback is disabled."
            return
        }

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Hey Affan")
            .setSubtitle("Please authorize your fingerprint to scan.")
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
            .setNegativeButtonText("Cancel")
            .build()

        val prompt = BiometricPrompt(
            this,
            ContextCompat.getMainExecutor(this),
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    message = "Biometric verified. Approving tablet..."
                    CoroutineScope(Dispatchers.IO).launch {
                        runCatching {
                            AdminAuthApi(BuildConfig.BACKEND_BASE_URL).submitBiometricApproval(challengeId, nonce)
                        }.onSuccess {
                            runOnUiThread {
                                message = "Approved. Tablet will unlock now."
                                finish()
                            }
                        }.onFailure {
                            runOnUiThread {
                                message = "Approval failed: ${it.message}"
                            }
                        }
                    }
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    message = "Biometric error: $errString"
                }
            }
        )

        prompt.authenticate(promptInfo)
    }
}
