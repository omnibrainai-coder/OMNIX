# Standalone Admin Suite (Tablet + Phone + Backend OOB Auth)

This folder contains an isolated implementation for a Samsung Tab A8 admin workflow with out-of-band phone authorization.

## 1) Repository Isolation Plan

Move this folder into a dedicated repository:

```bash
git init
git add .
git commit -m "Initial standalone admin suite"
```

Recommended split:

- `tablet-app/` -> dedicated Admin Dashboard Tablet APK project.
- `phone-auth-app/` -> dedicated Phone Authorization app.
- Backend endpoints live in OMNIX backend under:
  - `backend/routes/admin_oob_auth.py`
  - `backend/services/admin_oob_auth.py`

## 2) Knox / Play Protect Safeguard (Signed Release)

Use a custom keystore for release signing:

```bash
keytool -genkeypair \
  -v \
  -keystore keystore/omnix-admin-tablet.jks \
  -alias omnix_admin_tablet \
  -keyalg RSA \
  -keysize 4096 \
  -validity 3650
```

Copy `tablet-app/key.properties.example` to `tablet-app/key.properties`, then set real passwords.

Build signed release:

```bash
cd tablet-app
./gradlew assembleRelease
```

Verify signature:

```bash
apksigner verify --verbose app/build/outputs/apk/release/app-release.apk
```

Notes:

- Keep package name stable (`com.omnix.admin.tablet`) between releases.
- Keep signing key stable forever; key rotation can trigger trust issues on managed devices.
- Distribute via managed channel (Knox Manage / EMM / internal app sharing) for best allow-list behavior.

## 3) Tablet Pre-Auth Flow

On app launch, tablet checks:

- `ANDROID_ID`
- Current Wi-Fi SSID
- Current gateway IP

If matching expected values:

- Header: `Status: Connected to Affan's Hotspot`
- Body: `Please wait for authorizing on Affan's Phone...`
- Calls backend `POST /api/admin-auth/tablet/bootstrap`

Then polls:

- `GET /api/admin-auth/tablet/status/{challenge_id}`

On approval:

- Shows `Authorized! Opening Admin Dashboard...`
- Opens admin dashboard activity.

## 4) Backend Push + Decision

Backend sends FCM prompt to phone:

- Title: `Hey Affan!`
- Body: `Are you trying to open Admin Dashboard?`
- Actions handled client-side: `YES` / `NO`

Endpoints:

- `POST /api/admin-auth/tablet/bootstrap`
- `POST /api/admin-auth/phone/respond`
- `POST /api/admin-auth/phone/biometric-approve`
- `GET /api/admin-auth/tablet/status/{challenge_id}`
- `GET /api/admin-auth/tablet/stream/{challenge_id}`

## 5) Strict Biometric Requirement

Phone authorization activity uses Android `BiometricPrompt` with:

- `setAllowedAuthenticators(BIOMETRIC_STRONG)`
- `setNegativeButtonText("Cancel")`
- No device credential fallback configured.

Result:

- Only strong biometric (fingerprint/face) can approve.
- PIN/password/pattern fallback is disabled.

## 6) Required Backend Environment Variables

Set on backend host:

- `ADMIN_ALLOWED_TABLET_ANDROID_IDS=<comma-separated ANDROID_ID values>`
- `ADMIN_ALLOWED_HOTSPOT_SSIDS=Affan-Hotspot`
- `ADMIN_ALLOWED_GATEWAY_IPS=192.168.43.1`
- `ADMIN_AUTH_PHONE_USER_ID=affan-phone`
- Firebase credentials (`FIREBASE_SERVICE_ACCOUNT_FILE` or `FIREBASE_SERVICE_ACCOUNT_JSON`)

## 7) Firebase App Setup

For `phone-auth-app`, add `google-services.json` to:

- `phone-auth-app/app/google-services.json`

For `tablet-app`, FCM is optional in this baseline because it polls status; add Firebase config only if you also want native push wakeups.
