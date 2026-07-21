package com.omnix.admin.tablet

import android.content.Context
import android.net.ConnectivityManager
import android.net.wifi.WifiManager
import java.net.Inet4Address

class NetworkProbe(private val context: Context) {
    @Suppress("DEPRECATION")
    fun currentSsid(): String {
        val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val raw = wifiManager.connectionInfo?.ssid ?: ""
        return raw.removePrefix("\"").removeSuffix("\"")
    }

    fun currentGatewayIp(): String {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return ""
        val linkProperties = cm.getLinkProperties(network) ?: return ""
        val route = linkProperties.routes.firstOrNull { it.gateway is Inet4Address } ?: return ""
        return route.gateway?.hostAddress ?: ""
    }

    fun androidId(): String {
        return android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ) ?: ""
    }

    fun isHotspotExpected(expectedSsid: String, expectedGateway: String): Boolean {
        val ssid = currentSsid()
        val gateway = currentGatewayIp()
        return ssid == expectedSsid && gateway == expectedGateway
    }
}
