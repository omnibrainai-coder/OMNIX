package com.omnix.app

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.webkit.JavascriptInterface
import androidx.core.app.ActivityCompat

class AndroidAppBridge(private val activity: MainActivity) {
    @JavascriptInterface
    fun getLaunchPayload(): String {
        return activity.peekLaunchPayload().orEmpty()
    }

    @JavascriptInterface
    fun clearLaunchPayload() {
        activity.clearLaunchPayload()
    }

    @JavascriptInterface
    fun getDevicePushToken(): String {
        return activity.peekPendingPushToken().orEmpty()
    }

    @JavascriptInterface
    fun clearDevicePushToken() {
        activity.clearPendingPushToken()
    }

    @JavascriptInterface
    fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(activity, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 4200)
        }
    }

    @JavascriptInterface
    fun openExternalUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        activity.startActivity(intent)
    }
}