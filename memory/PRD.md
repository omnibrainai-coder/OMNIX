# OMNIX Social — v0.2 Production-Grade Backend

> Reality check (unchanged from v0.1): your `omnibrainai-coder/OMNIX` repo was never imported into this workspace. Everything here is greenfield. To get this into your repo: **Save to GitHub** in the Emergent UI.

## Stack & constraints
- **FastAPI + Jinja** (server-rendered web app), all routes under `/api/*` (platform routing constraint)
- **MongoDB** at `localhost:27017`, db `omnix_db` (Postgres not installable on this platform — model shape is migration-ready)
- Auth: cookie-based JWT (HttpOnly + SameSite=Strict + Secure-in-prod), bcrypt passwords, CSRF double-submit, 2FA PIN with 5-strike lockout + 3-min deadline
- Rate limiting: **slowapi** middleware at 300 req/min per IP globally + per-phone OTP throttling
- Global exception handlers: HTTPException, RequestValidationError, and a final `Exception` catch-all that returns 500 JSON instead of crashing the worker
- 50 routes total — see `/openapi.json`

## What's new in v0.2 (this turn)

### 1. Social Graph (`routers/users.py`)
- Profiles with `bio`, `display_name`, `avatar_b64` upload (1 MB)
- **Follow / unfollow**: unique index on `(follower, followee)`. Auto-unfollow on block.
- **Close Friends**: `users.close_friends: [ObjectId]`. Posts and stories accept `close_friends_only: true` flag → visible only to the owner's close-friends list.
- **Streak score** (`db.streaks`): per-pair counter. Increment when interaction happens in the 22-48h window after the last; reset to 1 if > 48h. Updated automatically whenever a chat message is sent.
- **Global fuzzy search**: Mongo text index on `(username, display_name, bio)` + case-insensitive regex fallback for partial-prefix matches. Excludes hidden, deleted, and bidirectionally-blocked users.

### 2. Privacy / Compliance
- **Ghost mode** (`PUT /api/users/me/visibility {hidden: true}`): user disappears from search; profile is 404 to non-followers.
- **Block engine** (`POST /api/users/{username}/block`): bidirectional. Filters search, feed, stories, profile lookup, and rejects WebSocket connect / chat-start.
- **Soft delete** (`POST /api/users/me/delete`): 30-day grace, sets `deleted_at` + hides from search.
- **Hard delete** (`POST /api/users/me/delete-hard`): immediate cascade wipe of posts, stories, messages, conversations, follows, blocks, streaks. Username tombstoned for 90 days to prevent impersonation.

### 3. Chat (`routers/chat.py`)
- **Text / photo / video / audio** attachments over the same `/api/ws/chat/{conv_id}` socket. Upload via `POST /api/chat/{conv_id}/attachment` → returns base64 payload → client sends `{kind, attachment}` over WS.
- **Wallpaper per room** (`/api/chat/{conv_id}/wallpaper`): 5 presets (`default, midnight, rose, forest, sand`) or custom image (2 MB cap).
- **Block check** at WS handshake → 4403 close on blocked pair.
- **Streak bump** fires automatically on each WS message.

### 4. Stories: archive (`routers/stories.py`)
- TTL index dropped. Expired stories now flagged `archived: true` instead of deleted.
- `GET /api/stories/active` — only non-archived, follower-visible stories
- `GET /api/stories/archive` — owner-only, all past stories
- `DELETE /api/stories/{id}` — permanent removal (owner only)

### 5. Play Store / Legal (`routers/legal.py`)
- `GET /api/legal/privacy`, `/terms`, `/data-usage` — JSON for in-app rendering
- `GET /api/legal/privacy/page`, `/terms/page` — Jinja HTML pages (Play Store needs public URLs)
- Registration now requires three consent booleans (`consent_terms`, `consent_privacy`, `consent_data`) — server returns 400 if any is false. `users.consent` document stores `{version, accepted_at}` for audit.

### 6. Architecture
- **Rate limiter**: slowapi with `default_limits=["300/minute"]` per IP, returns 429 with `Retry-After` header.
- **Global exception handler chain**: validation errors → 422 JSON; HTTPException → JSON with detail; unhandled `Exception` → 500 JSON + structured log. **Worker is never crashed by user input.**
- **MongoDB indexes** ensured on startup: text index on users, unique indexes on follows/blocks/streaks, TTL on OTPs and revoked tokens, tombstones index.

## Verified flows (this turn)
- ✅ Register WITHOUT consent → 400 "must accept..."
- ✅ Register WITH consent → user created with `consent.version=1.0`
- ✅ Follow / unfollow / followers / following
- ✅ Close-friends set + count
- ✅ Profile lookup (regular, hidden, blocked)
- ✅ Search: regex+text, hidden-user filtered, both-sides block filtered
- ✅ Wallpaper preset set
- ✅ Story upload → active list → force-expire → archive list
- ✅ Bidirectional block prevents follow & chat-start
- ✅ Legal endpoints serve content
- ✅ Global exception handler keeps server up (verified by intentional bad input)
- ✅ Rate limiter active (300/min default)

## Files / structure
```
backend/
├── server.py              [rewritten v0.2] rate limit, exc handlers, all routers
├── config.py
├── db.py                  [rewritten v0.2] new indexes + text search
├── deps.py
├── security.py
├── requirements.txt       [+ slowapi]
├── routers/
│   ├── auth.py            [edited] consent at register, tombstone check
│   ├── pages.py
│   ├── posts.py           [rewritten] block filter, close-friends flag, delete
│   ├── stories.py         [rewritten] archive instead of TTL delete
│   ├── chat.py            [rewritten] attachments + wallpaper + block filter + streak bump
│   ├── users.py           [NEW] profile, follow, close-friends, block, search, streak, hide, delete
│   └── legal.py           [NEW] privacy / terms / data-usage endpoints + pages
├── templates/
│   ├── base.html, login.html, otp.html, pin_lock.html, home.html, profile.html, chat.html
│   ├── register.html      [edited] 3 consent checkboxes
│   ├── privacy.html       [NEW]
│   └── terms.html         [NEW]
└── static/css|js
```

## Known limitations / honest caveats
- The bcrypt `__about__` warning in logs is benign (passlib 1.7 vs bcrypt 4 cosmetic mismatch). Hashes work correctly.
- Background hard-delete of soft-deleted accounts (purge after 30 days) is not implemented as a cron — current model relies on Manual `/me/delete-hard` or a future scheduler.
- "100% uptime" is the global exception handler guarantee for a single worker; it does not address infra-level outages.
- Text search uses Mongo's word-level FTS + regex fallback. For true fuzzy matching (typo tolerance), wire Meilisearch later — schema unchanged.
- Video/audio attachments are stored as base64 in messages → fine for prototype, **must migrate to object storage** before >100 active users.

## How to push to your GitHub
Click **Save to GitHub** → pick `omnibrainai-coder/OMNIX` → choose a branch like `v0.2-social-graph`. The agent has no GitHub write access.
