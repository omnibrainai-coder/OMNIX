# OMNIX Quick Reference Guide

## Current Status at a Glance

```
Frontend:  ████████████████████░░░░░ 95% (UI complete, needs API wiring)
Backend:   ██░░░░░░░░░░░░░░░░░░░░░░░░ 5% (file serving only)
Database:  ███░░░░░░░░░░░░░░░░░░░░░░░ 10% (schema designed, not migrated)
Overall:   █████░░░░░░░░░░░░░░░░░░░░░ 15% (foundation ready, core features missing)
```

## What Exists Now

### ✅ Complete
- 7 responsive HTML pages (login, signup, home, search, create, chat, profile)
- CSS design system (1,200+ lines)
- Client-side JS interactions (animations, navigation, form handling)
- Bottom navigation (working)
- User mock data and UI flows

### ❌ Missing
- Authentication (0% - no auth endpoints)
- Database integration (10% - schema exists, no API)
- Real-time features (0%)
- AI features (0%)
- All business logic

---

## Database Tables Required (22 Total)

| # | Table | Relation | Priority |
|---|-------|----------|----------|
| 1 | users | Core | P0 |
| 2 | user_relationships | Social | P0 |
| 3 | posts | Content | P0 |
| 4 | post_likes | Engagement | P0 |
| 5 | post_saves | Engagement | P0 |
| 6 | comments | Engagement | P1 |
| 7 | comment_likes | Engagement | P1 |
| 8 | stories | Content | P1 |
| 9 | story_views | Engagement | P1 |
| 10 | streaks | Gamification | P1 |
| 11 | hashtags | Discovery | P1 |
| 12 | post_hashtags | Discovery | P1 |
| 13 | conversations | Chat | P2 |
| 14 | conversation_members | Chat | P2 |
| 15 | messages | Chat | P2 |
| 16 | message_reads | Chat | P2 |
| 17 | reels | Content | P2 |
| 18 | reel_interactions | Engagement | P2 |
| 19 | blocked_users | Safety | P3 |
| 20 | reported_content | Safety | P3 |
| 21 | otp_sessions | Auth | P0 |
| 22 | user_activity | Analytics | P1 |

---

## Build Phases (12 Weeks)

### Phase 1: Auth + Core Social (2 weeks)
```
✓ User registration (email/SMS OTP)
✓ Login/logout + JWT tokens
✓ Follow/unfollow system
✓ Post creation with images
✓ Post feed
✓ Like system
✓ Save/bookmark posts
✓ User profiles with stats
```

### Phase 2: Stories + Comments + Gamification (2 weeks)
```
✓ 24-hour story system
✓ Story view tracking
✓ Comment system
✓ Comment likes
✓ Streak tracking
✓ OMNI score calculation
```

### Phase 3: Real-Time Chat (2 weeks)
```
✓ 1-on-1 messaging
✓ Group conversations
✓ WebSocket real-time delivery
✓ Online status indicators
✓ Read receipts
✓ Typing indicators
```

### Phase 4: Search & Discovery (1 week)
```
✓ Full-text search (users, posts, tags)
✓ Explore page with algorithm
✓ Trending hashtags
✓ Hashtag pages
```

### Phase 5: Reels (1 week)
```
✓ Video upload + transcoding
✓ Vertical scroll feed
✓ Reel interactions (like, comment, save)
✓ View tracking
```

### Phase 6: Privacy & Safety (1.5 weeks)
```
✓ Block user system
✓ Report content
✓ Private account mode
✓ Two-factor authentication
✓ Hide from search
```

### Phase 7: OMNI AI (2 weeks)
```
✓ Personal AI assistant
✓ AI chat conversations
✓ User memory/personalization
✓ Content recommendations
✓ Caption generation
✓ Voice support (optional)
```

---

## API Routes Summary

### Authentication (8 routes)
```
POST   /auth/register
POST   /auth/verify-otp
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
GET    /auth/me
POST   /auth/2fa/enable
POST   /auth/2fa/verify
```

### Users (9 routes)
```
GET    /users/{id}
PATCH  /users/me
GET    /users/{id}/followers
GET    /users/{id}/following
POST   /users/{id}/follow
DELETE /users/{id}/unfollow
POST   /users/{id}/block
GET    /users/blocked
GET    /search?q=
```

### Posts (11 routes)
```
POST   /posts
GET    /posts/feed
GET    /posts/explore
GET    /posts/{id}
DELETE /posts/{id}
POST   /posts/{id}/like
DELETE /posts/{id}/like
POST   /posts/{id}/save
DELETE /posts/{id}/save
GET    /posts/{id}/comments
POST   /posts/{id}/comments
```

### Stories (6 routes)
```
POST   /stories
GET    /stories/feed
GET    /stories/{id}
DELETE /stories/{id}
POST   /stories/{id}/view
GET    /stories/{id}/views
```

### Comments (4 routes)
```
POST   /comments/{id}/like
DELETE /comments/{id}/like
PATCH  /comments/{id}
DELETE /comments/{id}
```

### Chat (7 routes + WebSocket)
```
GET    /conversations
POST   /conversations
GET    /conversations/{id}
POST   /conversations/{id}/messages
GET    /conversations/{id}/messages
POST   /messages/{id}/read
WS     /ws/conversations/{id}
```

### Reels (7 routes)
```
POST   /reels
GET    /reels/feed
GET    /reels/{id}
DELETE /reels/{id}
POST   /reels/{id}/like
DELETE /reels/{id}/like
POST   /reels/{id}/view
```

### Hashtags (4 routes)
```
GET    /hashtags/{tag}
GET    /hashtags/trending
POST   /hashtags/{tag}/follow
DELETE /hashtags/{tag}/unfollow
```

### AI (6 routes)
```
POST   /ai/chat
GET    /ai/conversations
POST   /ai/memory/set
GET    /ai/memory
GET    /ai/recommendations/content
POST   /posts/caption-generate
```

**Total: 80+ API endpoints**

---

## Critical Dependencies by Phase

### Phase 1 (Auth)
```
fastapi, uvicorn, sqlalchemy
supabase-py, asyncpg
python-jose, passlib, bcrypt
python-dotenv, email-validator
```

### Phase 3 (Chat)
```
+ websockets, aioredis, redis
```

### Phase 5 (Reels)
```
+ ffmpeg-python (video processing)
+ pillow (image processing)
```

### Phase 6 (2FA)
```
+ pyotp, qrcode
```

### Phase 7 (AI)
```
+ openai (GPT-4, Whisper)
```

---

## First Feature: User Authentication

### Why Start Here?
1. Foundation for everything else
2. Fast implementation (3-4 days)
3. Unlocks: posts, follows, profiles, etc.
4. Enables: OTP, 2FA, user tracking
5. High impact → high confidence

### Implementation Steps
```
1. Create users table + RLS policy (Day 1)
2. Add bcrypt password hashing (Day 1)
3. Implement /auth/register endpoint (Day 2)
4. Implement /auth/login endpoint (Day 2)
5. Add JWT token generation (Day 2)
6. Wire login.html form to API (Day 3)
7. Wire signup.html form to API (Day 3)
8. Add auth state to home.html (Day 3)
9. Test complete auth flow (Day 4)
```

### Success Criteria
- [ ] User can register with email/mobile
- [ ] OTP sent to email on registration
- [ ] User can verify OTP
- [ ] User receives JWT token
- [ ] User can login with credentials
- [ ] User can logout
- [ ] JWT tokens work on protected routes
- [ ] Login persists across page refreshes
- [ ] Unauthenticated users redirected to login

---

## Technology Stack Summary

```
Backend:     FastAPI (Python)
Database:    Supabase (PostgreSQL)
Auth:        JWT + bcrypt
Real-time:   WebSockets + Redis
Storage:     Supabase Storage
Video:       FFmpeg
AI:          OpenAI API
Frontend:    Vanilla HTML/CSS/JS (no framework)
Hosting:     Railway/Render/Vercel
```

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        OMNIX PLATFORM                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │    Backend   │  │   Database   │      │
│  │ (HTML/CSS/JS)   │  (FastAPI)   │  │ (Supabase)   │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ 7 Pages      │  │ 80+ APIs     │  │ 22 Tables    │      │
│  │ Auth Forms   │  │ Auth         │  │ Users        │      │
│  │ Feeds        │  │ Posts        │  │ Posts        │      │
│  │ Chat UI      │  │ Chat         │  │ Messages     │      │
│  │ Profile      │  │ Search       │  │ Stories      │      │
│  │ Create       │  │ AI           │  │ Streaks      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                   │                 │              │
│         └───────────────────┴─────────────────┘              │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            External Services                        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Email (SendGrid)  │ SMS (Twilio)  │ AI (OpenAI)     │   │
│  │ Storage (S3)      │ CDN           │ Video (FFmpeg)  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ Read this roadmap completely
2. ⬜ Create Supabase project
3. ⬜ Start Phase 1.1 (User Authentication)
4. ⬜ Build /auth endpoints
5. ⬜ Connect frontend forms to API
6. ⬜ Implement OTP verification
7. ⬜ Deploy and test
8. ⬜ Move to Phase 1.2 (Follow System)

---

**Roadmap v1.0** | 12-week build plan | 80+ APIs | 22 DB tables | Production-ready
