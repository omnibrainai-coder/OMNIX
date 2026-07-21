package com.omnix.admin.tablet

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            beginAuthorizationFlow()
        } else {
            statusText = "Location permission is required to read hotspot SSID."
        }
    }

    private var pollJob: Job? = null
    private var statusHeader by mutableStateOf("Status: Checking secure connection...")
    private var statusText by mutableStateOf("Preparing tablet authorization flow...")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LaunchScreen(statusHeader, statusText)
        }

        val permissionState = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        if (permissionState == PackageManager.PERMISSION_GRANTED) {
            beginAuthorizationFlow()
        } else {
            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        pollJob?.cancel()
    }

    private fun beginAuthorizationFlow() {
        val probe = NetworkProbe(this)
        val androidId = probe.androidId()
        val ssid = probe.currentSsid()
        val gateway = probe.currentGatewayIp()

        if (!probe.isHotspotExpected(BuildConfig.EXPECTED_HOTSPOT_SSID, BuildConfig.EXPECTED_GATEWAY_IP)) {
            updateStatus(
                header = "Status: Connection mismatch",
                message = "Tablet must stay on Affan's hotspot before opening Admin Dashboard."
            )
            return
        }

        updateStatus(
            header = "Status: Connected to Affan's Hotspot",
            message = "Please wait for authorizing on Affan's Phone..."
        )

        pollJob?.cancel()
        pollJob = CoroutineScope(Dispatchers.IO).launch {
            try {
                val api = AdminAuthApi(BuildConfig.BACKEND_BASE_URL)
                val bootstrap = api.bootstrap(androidId, ssid, gateway)

                while (isActive) {
                    val status = api.pollStatus(bootstrap.challengeId)
                    if (status.status == "approved") {
                        runOnUiThread {
                            statusHeader = "Status: Authorized"
                            statusText = "Authorized! Opening Admin Dashboard..."
                            startActivity(Intent(this@MainActivity, AdminDashboardActivity::class.java))
                            finish()
                        }
                        return@launch
                    }
                    if (status.status == "denied" || status.status == "expired") {
                        updateStatus(
                            header = "Status: Authorization blocked",
                            message = "Phone rejected request or approval expired."
                        )
                        return@launch
                    }
                    delay(1500)
                }
            } catch (error: Exception) {
                updateStatus(
                    header = "Status: Authorization error",
                    message = error.message ?: "Unable to verify tablet authorization"
                )
            }
        }
    }

    private fun updateStatus(header: String, message: String) {
        runOnUiThread {
            statusHeader = header
            statusText = message
        }
    }
}

@androidx.compose.runtime.Composable
private fun LaunchScreen(statusHeader: String, statusText: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF081C15), Color(0xFF1B4332), Color(0xFF2D6A4F))
                )
            )
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = statusHeader,
            style = MaterialTheme.typography.headlineSmall,
            color = Color(0xFFD8F3DC)
        )
        Text(
            text = statusText,
            modifier = Modifier.padding(top = 18.dp),
            style = MaterialTheme.typography.bodyLarge,
            color = Color.White
        )
        CircularProgressIndicator(
            modifier = Modifier.padding(top = 22.dp),
            color = Color(0xFF95D5B2)
        )
    }
}
