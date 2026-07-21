# OMNIX Settings Module Architecture

## Scope

This module covers:

- Account management and personal information
- Account export, deactivation, deletion, and restoration flows
- Password, OTP reset, 2FA, session management, and login alerts
- Blocked and muted account managers
- Content, mention, and tag preferences
- Archive, story, storage, and media controls
- Pause-all and per-channel notification preferences

## Database Schema

Implemented and extended in [PROFILE_SETTINGS_MIGRATIONS.sql](/workspaces/OMNIX/PROFILE_SETTINGS_MIGRATIONS.sql).

### User columns

- `users.gender`
- `users.date_of_birth`
- `users.first_username`
- `users.account_status` with `active | restricted | deactivated | pending_deletion`
- `users.deactivated_at`
- `users.deletion_requested_at`
- `users.deletion_scheduled_for`
- `users.deleted_by_user`

### Existing tables extended

- `user_sessions`
  - `is_current`, `is_recognized`, `device_fingerprint`, `logged_out_at`, `login_alert_sent`
- `notification_settings`
  - `pause_all_until`, `push_calls`, `push_app_updates`
- `privacy_settings`
  - `sensitive_content_control`, `hide_like_view_counts`, `mention_policy`, `tag_policy`
- `security_settings`
  - `sms_2fa_phone`, `totp_secret_encrypted`, `backup_codes`

### New tables

- `data_export_requests`
- `otp_verifications`
- `archived_posts`
- `archived_stories`
- `story_settings`
- `storage_settings`

## API Surface

Routes are implemented in [backend/routes/settings_management.py](/workspaces/OMNIX/backend/routes/settings_management.py).

### Account

`GET /api/settings/overview`

Response shape:

```json
{
  "success": true,
  "account": {},
  "security": {},
  "content_preferences": {},
  "story_settings": {},
  "storage_settings": {},
  "notification_settings": {},
  "sessions": [],
  "archives": { "posts": [], "stories": [] },
  "blocked_accounts": [],
  "muted_accounts": { "posts": [], "stories": [], "chats": [] },
  "latest_export": null
}
```

`PATCH /api/settings/account/personal-information`

Request:

```json
{
  "phone_number": "+1-202-555-0112",
  "email": "operator@omnix.app",
  "gender": "non_binary",
  "date_of_birth": "1997-09-14"
}
```

Response: `{ "success": true, "account": { ... } }`

`POST /api/settings/account/export`

Request:

```json
{
  "include_messages": true,
  "include_posts": true,
  "include_profile": true
}
```

Response: `{ "success": true, "export": { "id", "status", "download_url", "expires_at" } }`

`GET /api/settings/exports/{export_id}/download`

Response: ZIP archive containing `account-export.json`.

`POST /api/settings/account/deactivate`

Request: `{ "reason": "user_requested_pause" }`

Response: `{ "success": true, "account": { ... }, "message": "..." }`

`POST /api/settings/account/delete`

Request: `{ "reason": "user_requested_deletion" }`

Response: `{ "success": true, "account": { ...deletion_scheduled_for... } }`

`POST /api/settings/account/restore`

Response: `{ "success": true, "account": { ... } }`

### Security

`POST /api/settings/security/change-password`

Request:

```json
{
  "current_password": "old-password",
  "new_password": "new-strong-password"
}
```

Response: `{ "success": true, "security": { ...password_changed_at... } }`

`POST /api/settings/security/password-reset/request`

Request:

```json
{
  "channel": "email",
  "destination": "operator@omnix.app"
}
```

Response: `{ "success": true, "challenge": { "challenge_id", "channel", "destination_hint", "expires_at" } }`

`POST /api/settings/security/password-reset/verify`

Request:

```json
{
  "challenge_id": "otp-...",
  "otp_code": "472901",
  "new_password": "replacement-password"
}
```

Response: `{ "success": true, "user_id": "local-user" }`

`POST /api/settings/security/2fa/setup`

Request: `{ "method": "totp" }` or `{ "method": "sms" }`

Response: `{ "success": true, "setup": { "setup_id", "method", "qr_code_url" | "phone_number" } }`

`POST /api/settings/security/2fa/verify`

Request: `{ "setup_id": "2fa-...", "code": "123456" }`

Response: `{ "success": true, "security": { ...two_factor_enabled... } }`

`POST /api/settings/security/2fa/disable`

Response: `{ "success": true, "security": { ... } }`

`PATCH /api/settings/security/alerts`

Request:

```json
{
  "login_alerts_enabled": true,
  "unrecognized_device_alerts": true
}
```

Response: `{ "success": true, "security": { ... } }`

`GET /api/settings/security/sessions`

Response: `{ "success": true, "sessions": [ { "device_name", "os", "location", "ip_address", "last_active_at", "current", "recognized" } ] }`

`DELETE /api/settings/security/sessions/{session_id}`

Response: `{ "success": true, "message": "Session ended" }`

`POST /api/settings/security/sessions/logout-all-other-devices`

Response: `{ "success": true, "revoked_sessions": 2 }`

### Privacy

`GET /api/settings/privacy/blocked`

Response: `{ "success": true, "blocked_accounts": [ ... ] }`

`GET /api/settings/privacy/muted`

Response: `{ "success": true, "muted_accounts": { "posts": [], "stories": [], "chats": [] } }`

`PATCH /api/settings/privacy/content-preferences`

Request:

```json
{
  "sensitive_content_control": "standard",
  "hide_like_view_counts": false,
  "mention_policy": "people_you_follow",
  "tag_policy": "people_you_follow"
}
```

Response: `{ "success": true, "content_preferences": { ... } }`

### Archive and storage

`GET /api/settings/archive`

Response: `{ "success": true, "archives": { "posts": [], "stories": [] } }`

`PATCH /api/settings/archive/story-settings`

Request:

```json
{
  "auto_save_to_archive": true,
  "save_to_phone_gallery": false
}
```

Response: `{ "success": true, "story_settings": { ... } }`

`GET /api/settings/storage`

Response: `{ "success": true, "storage_settings": { ... } }`

`POST /api/settings/storage/clear-cache`

Response: `{ "success": true, "cleared_mb": 286, "cache_size_mb": 0 }`

`PATCH /api/settings/storage/preferences`

Request:

```json
{
  "cellular_data_saver": true,
  "photo_auto_download": "wifi_only",
  "video_auto_download": "wifi_only"
}
```

Response: `{ "success": true, "storage_settings": { ... } }`

### Notifications

`GET /api/settings/notifications`

Response: `{ "success": true, "notification_settings": { ... } }`

`PATCH /api/settings/notifications`

Request:

```json
{
  "push_likes": true,
  "push_comments": true,
  "push_new_followers": true,
  "push_direct_messages": true,
  "push_calls": true,
  "push_app_updates": true
}
```

Response: `{ "success": true, "notification_settings": { ... } }`

`POST /api/settings/notifications/pause-all`

Request: `{ "duration": "1h" }`

Response: `{ "success": true, "notification_settings": { "pause_all_until": "..." } }`

## Secure session destruction guarantees

- `POST /api/settings/security/sessions/logout-all-other-devices` revokes all non-current active sessions.
- `POST /api/settings/account/deactivate` revokes all active sessions.
- `POST /api/settings/account/delete` revokes all active sessions and marks the account for 30-day restoration.

## Frontend UI Architecture

Implemented in [src/components/settings/SettingsHub.tsx](/workspaces/OMNIX/src/components/settings/SettingsHub.tsx).

### Component tree

- `AuthContainer`
  - routes profile gear to settings
- `SettingsHub`
  - `Account` section
  - `Security` section
  - `Privacy` section
  - `Archive & Storage` section
  - `Notifications` section

### State flow

- Initial load uses `GET /api/settings/overview`
- Each section performs narrow updates against its own endpoint
- UI state updates in place after successful responses instead of forcing full-screen reloads
- Risky actions like deactivate, delete, and session revocation clear local settings state immediately from the active view

### Integration notes

- Shared request helper: [src/utils/socialApi.ts](/workspaces/OMNIX/src/utils/socialApi.ts)
- Shared types: [src/types/settings.ts](/workspaces/OMNIX/src/types/settings.ts)
- Navigation entrypoint: [src/pages/AuthContainer.tsx](/workspaces/OMNIX/src/pages/AuthContainer.tsx)