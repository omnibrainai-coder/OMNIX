# Android Native Wrapper & Push Setup

## Project layout

- Android Gradle project: [android/settings.gradle](/workspaces/OMNIX/android/settings.gradle)
- App module: [android/app/build.gradle](/workspaces/OMNIX/android/app/build.gradle)
- Manifest: [android/app/src/main/AndroidManifest.xml](/workspaces/OMNIX/android/app/src/main/AndroidManifest.xml)
- Main activity: [android/app/src/main/java/com/omnix/app/MainActivity.kt](/workspaces/OMNIX/android/app/src/main/java/com/omnix/app/MainActivity.kt)
- App bridge: [android/app/src/main/java/com/omnix/app/AndroidAppBridge.kt](/workspaces/OMNIX/android/app/src/main/java/com/omnix/app/AndroidAppBridge.kt)
- FCM service: [android/app/src/main/java/com/omnix/app/OmnixFirebaseMessagingService.kt](/workspaces/OMNIX/android/app/src/main/java/com/omnix/app/OmnixFirebaseMessagingService.kt)
- Billing bridge source: [android_native/PlayBillingBridge.kt](/workspaces/OMNIX/android_native/PlayBillingBridge.kt)

## Required setup

1. Copy [android/local.properties.example](/workspaces/OMNIX/android/local.properties.example) to `android/local.properties` and set `sdk.dir` to your Android SDK path.
2. Copy [android/app/google-services.template.json](/workspaces/OMNIX/android/app/google-services.template.json) to `android/app/google-services.json` and replace it with your real Firebase Android config.
3. Build the web bundle before packaging Android assets:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com npm run build
```

## Native build commands

Debug APK:

```bash
cd /workspaces/OMNIX/android
./gradlew assembleDebug
```

Release APK:

```bash
cd /workspaces/OMNIX/android
./gradlew assembleRelease
```

Android App Bundle for Play Store:

```bash
cd /workspaces/OMNIX/android
./gradlew bundleRelease
```

## Firebase backend environment

Set one of:

- `FIREBASE_SERVICE_ACCOUNT_FILE=/absolute/path/to/service-account.json`
- `FIREBASE_SERVICE_ACCOUNT_JSON='{...}'`

And set:

- `FIREBASE_PROJECT_ID=your-firebase-project-id`

## Google Play verification environment

Set:

- `GOOGLE_PLAY_PACKAGE_NAME=com.omnix.app`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_FILE=/absolute/path/to/google-play-service-account.json`

Or:

- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON='{...}'`

## Backend push endpoints

- `POST /api/v1/push/register-device`
- `POST /api/v1/push/send/direct-message`
- `POST /api/v1/push/send/incoming-call`
- `POST /api/v1/push/send/social-event`

## Android behavior

- Foreground FCM messages dispatch `omnix-open-screen` events into the WebView.
- Notification taps reopen the app and route to the exact target screen via `targetScreen`, `conversationId`, and `profileId` extras.
- Splash boot happens natively and then continues in the web layer with the animated launch screen.