# OMNIX Frontend — v0.3 (full backend↔UI wiring)

> Still greenfield in this workspace; push via **Save to GitHub** when ready.

## Pages now in the UI (13 total)

| Page | Template | Backend endpoints used |
|---|---|---|
| `/api/pages/login` | `login.html` | `/api/auth/login` + legal footer links |
| `/api/pages/register` | `register.html` | `/api/auth/register` + 3 consent checkboxes linking to `/api/legal/{terms,privacy}/page` |
| `/api/pages/otp` | `otp.html` | `/api/auth/verify-otp` |
| `/api/pages/pin-lock` | `pin_lock.html` | `/api/auth/verify-pin` with 3-min countdown |
| `/api/pages/home` | `home.html` | feed + stories + post upload + story upload + PIN-pending overlay |
| `/api/pages/profile` (NEW UI) | `profile.html` | edit bio/display_name, avatar upload, ghost-mode toggle, PIN set, soft-delete, links to lists |
| `/api/pages/search` (NEW) | `search.html` | `/api/users/search/q` + inline follow buttons |
| `/api/pages/user/{username}` (NEW) | `user_profile.html` | profile fetch + follow/unfollow + block + message + streak display |
| `/api/pages/close-friends` (NEW) | `close_friends.html` | `/api/users/me/close-friends` GET + PUT (add/remove) |
| `/api/pages/blocks` (NEW) | `blocks.html` | `/api/users/me/blocks` + unblock |
| `/api/pages/archive` (NEW) | `archive.html` | `/api/stories/archive` + permanent delete |
| `/api/pages/chat` (UPDATED) | `chat.html` | WebSocket + attachment upload + wallpaper picker (5 presets + custom upload) |
| `/api/legal/{privacy,terms}/page` | `privacy.html` / `terms.html` | public-readable for Play Store |

## What was wired this turn

### 1. Topbar with global search (every page)
- Added `<form action="/api/pages/search">` with input named `q` in `base.html`
- Lives on every authed page; submits to the search page
- Testid `topbar-search-input` / `topbar-search-button`

### 2. Profile editing (`profile.html`)
- Avatar circle with letter fallback; upload form posts to `/api/users/me/avatar`
- Edit form (display_name + bio) → `PATCH /api/users/me`
- Ghost toggle (live) → `PUT /api/users/me/visibility`
- 2FA PIN set/change → `/api/auth/set-pin`
- Tile links to Close Friends / Blocks / Archive
- Soft-delete button → `/api/users/me/delete` with confirm

### 3. Public user profile (`user_profile.html`)
- Reads `/api/users/{username}` for bio/avatar/follower counts
- Follow/Unfollow toggle (single button switches verb based on `am_following`)
- Block button (confirm) → redirects home on success
- Message → routes to `/api/pages/chat?peer={username}` (auto-opens conversation)
- Streak display: reads `/api/users/streak/{username}`, shows "🔥 N-day streak (active|at risk)"

### 4. Search (`search.html`)
- Reads `?q=` from URL, fires `/api/users/search/q`
- Each result has avatar + display_name + bio snippet + inline Follow button
- Click username → `/api/pages/user/{username}`
- Empty state with testid `search-empty`

### 5. Close Friends (`close_friends.html`)
- Add by typing `@username` → `PUT /api/users/me/close-friends` with merged list
- Each row has Remove button (re-puts list without that user)
- Used by the existing `close_friends_only` flag on posts/stories

### 6. Blocks (`blocks.html`)
- Lists `/api/users/me/blocks`
- Unblock per-row → `DELETE /api/users/{username}/block`

### 7. Story Archive (`archive.html`)
- Grid of expired stories from `/api/stories/archive`
- Per-tile Delete (permanent) → `DELETE /api/stories/{id}`

### 8. Chat overhaul (`chat.html`)
- New 📎 attach button: file picker → uploads via `POST /api/chat/{id}/attachment` → sends `{kind, attachment}` over WS
- Renders photo/video/audio inline in message bubbles
- 🎨 Wallpaper button opens modal with 5 preset tiles + custom image upload
- Applied wallpaper persists per room (server-side) and is loaded on conversation open

### 9. Legal compliance on login/register
- Login: footer "By signing in you agree to Terms / Privacy / Data Usage"
- Register: 3 required checkboxes linking to `/api/legal/terms/page` and `/api/legal/privacy/page`

## Verified this turn (all green)
- All 13 pages return HTTP 200
- Each page contains the expected testid marker
- Profile page receives full context (avatar, bio, followers/following counts)
- `/api/users/me/close-friends` returns the seeded list correctly
- Legal HTML page renders Privacy Policy text
- Backend restarted cleanly after each file change

## Honest caveats
- **WS auto-reconnect** is not implemented; if the socket drops, user must reopen the conversation
- **Streak display** appears on user_profile but not yet on the conversation header — small follow-up
- **Wallpaper isn't applied to message bubbles** styling, only to chat container background. Looks fine on the 5 dark presets; custom light images may reduce text contrast
- **Account recover** (during the 30-day grace) endpoint isn't built — only delete + hard-delete exist
- **The Expo frontend at `/app/frontend/`** is still untouched starter code — this entire app is server-rendered Jinja

## Files this turn
```
NEW templates: search.html, user_profile.html, close_friends.html, blocks.html, archive.html
REWRITTEN:     base.html (topbar search), login.html (legal footer), profile.html (full editor),
               chat.html (attach + wallpaper picker)
REWRITTEN:     routers/pages.py (5 new routes, profile context expanded)
EDITED:        static/js/app.js (window.ensureCsrf exposed)
EDITED:        static/css/styles.css (avatar, modal, wallpaper grid, archive grid, user-row, topbar)
```
