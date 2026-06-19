# OMNIX Social — Prototype PRD

## What was built (this session, from scratch in `/app`)

A lightweight, security-first **server-rendered FastAPI + Jinja** social prototype with MongoDB backing store. Targeted at 2–3 test users. Designed to be pushed by the user to `omnibrainai-coder/OMNIX` via the **Save to GitHub** button.

> Important honest note: the user's prior OMNIX repository was **never imported into this workspace** despite multiple instructions to do so. This build is greenfield — not a refactor of any existing code. The user should overwrite their repo with this build, or merge selectively.

## Architecture

```
/app/backend/
├── server.py              FastAPI entrypoint, mounts /api/static, includes routers
├── config.py              Settings loader (.env)
├── db.py                  Motor client, TTL & unique index ensure on startup
├── security.py            bcrypt, JWT, HMAC-OTP, cookie + CSRF helpers
├── deps.py                get_current_user, get_user_pin_pending
├── routers/
│   ├── auth.py            /api/auth/* (register, login, OTP, PIN, refresh, logout, me)
│   ├── pages.py           /api/pages/* (Jinja-rendered HTML)
│   ├── posts.py           /api/posts (create, feed, like)
│   ├── stories.py         /api/stories (create, list active)
│   └── chat.py            /api/chat/* + WS /api/ws/chat/{conv_id}
├── templates/             base, login, register, otp, pin_lock, home, profile, chat
└── static/css|js          glassmorphism dark theme, vanilla JS helpers
```

All routes are prefixed with `/api/*` because the platform's ingress routes only `/api/*` → backend port 8001.

## Security features delivered

| Feature | Implementation |
|---|---|
| Cookie-based JWT | `HttpOnly`, `SameSite=Strict`, `Secure` (auto-enabled in prod via `ENV=prod`). Tokens **never** exposed to JS. |
| Access token | 15 min, HS256, claims `{sub, iat, exp, type, pin_pending, pin_deadline}` |
| Refresh token | 7 days, rotated on use, server-side revocation list in `revoked_tokens` (TTL 8d) |
| CSRF | Double-submit cookie. `/api/auth/csrf` issues non-HttpOnly token. Every state-changing endpoint validates `X-CSRF-Token` against cookie via `hmac.compare_digest`. |
| Password hashing | bcrypt via passlib (rounds=12 default) |
| OTP | 6-digit, stored as HMAC-SHA256 in Mongo with 300s TTL index; rate-limited 1/min, 5/hour per phone; 5 wrong attempts burn the code |
| 2FA PIN | bcrypt-hashed on `users.pin_hash`; **5-strike lockout**, **3-minute deadline** enforced by JWT claim + endpoint re-check; on lockout: refresh token revoked, cookies cleared, account locked 15 min |
| Constant-time compare | `hmac.compare_digest` for OTP & CSRF |
| Input validation | Regex on phone (E.164), username, PIN, OTP code |

## Feature surface

### Auth pages
- `/api/pages/register` — username + phone + password → OTP screen
- `/api/pages/login` — username + password → OTP screen
- `/api/pages/otp` — 6-digit code (`123456` in dev)
- `/api/pages/pin-lock` — modal with 3-minute countdown timer
- `/api/pages/profile` — set/change 2FA PIN

### Social
- `/api/pages/home` — story strip, post composer, chronological feed
  - Stories: 4MB image upload, base64 stored, **24h TTL via Mongo index**
  - Posts: image + caption, like/unlike
- `/api/pages/chat` — conversations list + 1:1 real-time messaging over WebSocket
  - Conversation IDs are deterministic from sorted user pair
  - Messages persisted, server broadcasts to all sockets in the room

## What is mocked / deferred

- **Fast2SMS**: MOCKED. The single point to swap is `routers/auth.py::_send_otp()`. Add the API key to `.env` (`FAST2SMS_API_KEY`) and implement the HTTP call — the spec note in the playbook is to inspect Fast2SMS's JSON body, not just `response.status_code`. Until then, **OTP code is hard-wired to `123456`** for every phone.
- **Video/audio calls**, **camera filters**, **Ghost mode**, **account deletion (GDPR)**, **block/report**, **search**, **push notifications**, **OAuth (Google/Apple)** — explicitly dropped per the user's "lightweight prototype" pivot.
- **PostgreSQL**: not installed in the workspace; we used MongoDB instead. The data model maps cleanly to either; migration would touch `db.py` and the per-collection access in routers.
- **Frontend (Expo)** in `/app/frontend` is still the default Expo starter — untouched. The user's social app is pure Jinja under `/api/pages/*`. The Expo service can be stopped if not needed.

## Operating details

- Backend: uvicorn on `0.0.0.0:8001` via supervisor (auto-restart on file change in dev)
- Database: MongoDB at `mongodb://localhost:27017`, db `omnix_db`
- Env file: `/app/backend/.env` (rotate `JWT_SECRET`, `OTP_HMAC_SECRET`, `COOKIE_SECRET` before any non-dev use)
- Static: `/api/static/*`
- WebSocket: `/api/ws/chat/{conv_id}` (cookie-authenticated, rejects pin_pending sessions)

## Verified end-to-end (smoke tests this session)

- ✅ register → OTP → verify-otp → cookies set → `/me` 200
- ✅ set-pin enables 2FA
- ✅ login while PIN enabled → OTP → `pin_required:true`
- ✅ `/me` while `pin_pending` → 403
- ✅ wrong PIN ×4 → countdown errors
- ✅ wrong PIN ×5 → 423, session terminated, refresh revoked, account locked 15 min
- ✅ correct PIN → re-mints JWT without `pin_pending`
- ✅ post upload (image base64) + feed lists it
- ✅ story upload + 24h TTL index present
- ✅ chat start + WebSocket message + persistence + history retrieval
- ✅ HTML pages render with correct testIDs

## How the user pushes this to their GitHub

This agent **cannot** push to the user's GitHub. To get this code into `omnibrainai-coder/OMNIX`:
1. Click **Save to GitHub** at the top-right of the Emergent UI
2. Choose the OMNIX repo
3. Choose a branch name (e.g. `prototype/secure-auth-v1`)
4. Confirm; Emergent commits all of `/app` to that branch.

## Files NOT to overwrite when merging into the real OMNIX repo

Everything under `/app/frontend/` (Expo starter — keep your own frontend if it differs). Only the `/app/backend/` tree, `/app/memory/`, and root config files are part of this build.
