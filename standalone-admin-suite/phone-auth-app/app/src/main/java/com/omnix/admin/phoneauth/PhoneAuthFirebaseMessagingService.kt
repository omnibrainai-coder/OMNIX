package com.omnix.admin.phoneauth

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class PhoneAuthFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val data = remoteMessage.data
        if (data["notificationType"] != "admin_auth_prompt") {
            return
        }

        val challengeId = data["challengeId"] ?: return
        val ssid = data["hotspotSsid"].orEmpty()
        val gateway = data["gatewayIp"].orEmpty()

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(
                NotificationChannel(
                    AuthConstants.CHANNEL_ID,
                    "Admin Authorization",
                    NotificationManager.IMPORTANCE_HIGH
                )
            )
        }

        val yesIntent = Intent(this, AdminAuthActionReceiver::class.java).apply {
            action = AuthConstants.ACTION_YES
            putExtra(AuthConstants.EXTRA_CHALLENGE_ID, challengeId)
            putExtra(AuthConstants.EXTRA_SSID, ssid)
            putExtra(AuthConstants.EXTRA_GATEWAY, gateway)
        }

        val noIntent = Intent(this, AdminAuthActionReceiver::class.java).apply {
            action = AuthConstants.ACTION_NO
            putExtra(AuthConstants.EXTRA_CHALLENGE_ID, challengeId)
        }

        val yesPending = PendingIntent.getBroadcast(
            this,
            challengeId.hashCode(),
            yesIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val noPending = PendingIntent.getBroadcast(
            this,
            challengeId.hashCode() + 1,
            noIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(this, AuthConstants.CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentTitle("Hey Affan!")
            .setContentText("Are you trying to open Admin Dashboard?")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .addAction(0, "YES", yesPending)
            .addAction(0, "NO", noPending)
            .build()

        manager.notify(challengeId.hashCode(), notification)
    }
}
