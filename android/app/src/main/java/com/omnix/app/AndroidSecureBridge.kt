package com.omnix.app

import android.webkit.JavascriptInterface
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class AndroidSecureBridge(activity: MainActivity) {
    private val masterKey = MasterKey.Builder(activity)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val preferences = EncryptedSharedPreferences.create(
        activity,
        "omnix_secure_store",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    @JavascriptInterface
    fun getSecret(key: String): String {
        return preferences.getString(key, "") ?: ""
    }

    @JavascriptInterface
    fun setSecret(key: String, value: String) {
        preferences.edit().putString(key, value).apply()
    }

    @JavascriptInterface
    fun removeSecret(key: String) {
        preferences.edit().remove(key).apply()
    }
}