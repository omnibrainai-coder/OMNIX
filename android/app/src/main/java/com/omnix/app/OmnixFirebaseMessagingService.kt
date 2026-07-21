package com.omnix.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class OmnixFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        MainActivity.cachePushToken(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        val data = remoteMessage.data
        val payloadJson = org.json.JSONObject()
            .put("targetScreen", data["targetScreen"])
            .put("conversationId", data["conversationId"])
            .put("profileId", data["profileId"])
            .put("notificationType", data["notificationType"])
            .toString()

        MainActivity.dispatchToWeb(payloadJson)
        createChannels()

        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("targetScreen", data["targetScreen"])
            putExtra("conversationId", data["conversationId"])
            putExtra("profileId", data["profileId"])
            putExtra("notificationType", data["notificationType"])
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            data.hashCode(),
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val channelId = when (data["notificationType"]) {
            "incoming_call" -> "calls"
            "direct_message" -> "messages"
            else -> "social"
        }

        val builder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.sym_action_chat)
            .setContentTitle(remoteMessage.notification?.title ?: getString(R.string.app_name))
            .setContentText(remoteMessage.notification?.body ?: "New activity in ByteChat")
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(
                if (data["notificationType"] == "incoming_call") NotificationCompat.PRIORITY_MAX
                else NotificationCompat.PRIORITY_HIGH,
            )
            .setCategory(
                if (data["notificationType"] == "incoming_call") NotificationCompat.CATEGORY_CALL
                else NotificationCompat.CATEGORY_MESSAGE,
            )
            .setVibrate(longArrayOf(0, 250, 200, 250))

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(data.hashCode(), builder.build())
    }

    private fun createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channels = listOf(
            NotificationChannel("messages", "Messages", NotificationManager.IMPORTANCE_HIGH),
            NotificationChannel("calls", "Calls", NotificationManager.IMPORTANCE_HIGH),
            NotificationChannel("social", "Social Activity", NotificationManager.IMPORTANCE_DEFAULT),
        )
        notificationManager.createNotificationChannels(channels)
    }
}