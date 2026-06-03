# OMNIX: Comprehensive Development Roadmap

## Executive Summary

OMNIX is a **unified social platform** combining Instagram (posts/stories), Facebook (feed/groups), Snapchat (streaks/temporary content), WhatsApp (real-time chat), and AI assistance. Current status:

- **UI/Frontend:** 95% complete (all 7 pages fully designed with animations)
- **Backend:** 5% complete (only file serving routes exist)
- **Database:** Schema partially defined but unmigrated and unintegrated
- **APIs:** 0% complete (no endpoints for core features)

---

## PART 1: CURRENT STATE ANALYSIS

### 1.1 What Already Exists

#### ✅ Frontend (Fully Built)
```
- 7 responsive pages with cyberpunk design system
- Fixed bottom navigation (Home, Search, Create, Chat, Profile)
- CSS animations (glitch, pulse, fade, ripple, scan-line)
- Client-side interactions (like/bookmark toggles, tabs, filters)
- Lazy image loading with Intersection Observer
- Toast notification system
- Form input styling and character counters
- Mobile-first responsive design (380px+)
```

#### ✅ Backend (Minimal)
```
- FastAPI server with 7 file-serving routes
- Static file mounting (/static for CSS/JS)
- Basic project structure (models.py, database.py)
```

#### ✅ Database Schema (Defined but Unmigrated)
```
Table: users
- id (PK)
- fullname, username (UNIQUE), email (UNIQUE), mobile
- password
- bio, profile_pic
- followers (INT), following (INT), streak (INT), omni_score (FLOAT)
```

### 1.2 What's Missing

#### ❌ Authentication
- No login/signup API endpoints
- No JWT token generation
- No password hashing
- No OTP verification logic (service file exists but empty)

#### ❌ Core Social Features
- No post creation API
- No follow/unfollow logic
- No like/comment system backend
- No save/bookmark persistence
- No story system
- No streak calculation

#### ❌ Communication
- No real-time chat (no WebSocket)
- No message persistence
- No online status tracking
- No read receipts

#### ❌ Content Discovery
- No search algorithm
- No explore page
- No trending calculation
- No hashtag indexing

#### ❌ Privacy & Security
- No block user functionality
- No private account mode
- No 2FA implementation
- No report user system

#### ❌ AI Features
- No AI assistant
- No AI chat
- No recommendations engine

#### ❌ Database
- No migration files
- No RLS policies for Supabase
- Two conflicting DB implementations need consolidation

---

## PART 2: FEATURE BREAKDOWN & DATABASE DESIGN

### 2.1 Required Database Tables

```sql
-- Core User Management
users
├── id (UUID, PK)
├── email (UNIQUE)
├── username (UNIQUE)
├── mobile (UNIQUE)
├── password_hash
├── full_name
├── bio
├── profile_pic_url
├── is_private (BOOLEAN)
├── is_blocked_from_search (BOOLEAN)
├── two_fa_enabled (BOOLEAN)
├── created_at
└── updated_at

user_relationships
├── id (PK)
├── follower_id (FK → users.id)
├── following_id (FK → users.id)
├── followed_at
└── UNIQUE(follower_id, following_id)

-- Posts & Content
posts
├── id (UUID, PK)
├── user_id (FK → users.id)
├── caption (TEXT)
├── image_url (or video_url)
├── visibility (public/followers/private)
├── created_at
├── updated_at
└── deleted_at

post_likes
├── id (PK)
├── post_id (FK → posts.id)
├── user_id (FK → users.id)
├── created_at
└── UNIQUE(post_id, user_id)

post_saves
├── id (PK)
├── post_id (FK → posts.id)
├── user_id (FK → users.id)
├── saved_at
└── UNIQUE(post_id, user_id)

comments
├── id (UUID, PK)
├── post_id (FK → posts.id)
├── user_id (FK → users.id)
├── text (TEXT)
├── created_at
├── updated_at
└── deleted_at

comment_likes
├── id (PK)
├── comment_id (FK → comments.id)
├── user_id (FK → users.id)
└── UNIQUE(comment_id, user_id)

-- Stories System
stories
├── id (UUID, PK)
├── user_id (FK → users.id)
├── image_url (or video_url)
├── text_content (optional)
├── created_at
├── expires_at (24 hours)
└── deleted_at

story_views
├── id (PK)
├── story_id (FK → stories.id)
├── user_id (FK → users.id)
├── viewed_at
└── UNIQUE(story_id, user_id)

-- Streaks
streaks
├── id (PK)
├── user_id (FK → users.id)
├── current_streak (INT)
├── best_streak (INT)
├── last_activity_date (DATE)
└── updated_at

-- Messaging System
conversations
├── id (UUID, PK)
├── is_group (BOOLEAN)
├── name (for groups)
├── created_at
└── updated_at

conversation_members
├── id (PK)
├── conversation_id (FK → conversations.id)
├── user_id (FK → users.id)
├── added_at

messages
├── id (UUID, PK)
├── conversation_id (FK → conversations.id)
├── sender_id (FK → users.id)
├── text_content (optional)
├── media_url (optional)
├── is_voice_note (BOOLEAN)
├── created_at
├── deleted_at

message_reads
├── id (PK)
├── message_id (FK → messages.id)
├── user_id (FK → users.id)
├── read_at

-- Hashtags
hashtags
├── id (UUID, PK)
├── tag (TEXT, UNIQUE)
├── usage_count (INT)
└── updated_at

post_hashtags
├── id (PK)
├── post_id (FK → posts.id)
├── hashtag_id (FK → hashtags.id)
└── UNIQUE(post_id, hashtag_id)

-- Reels (Short Videos)
reels
├── id (UUID, PK)
├── user_id (FK → users.id)
├── video_url
├── caption (TEXT)
├── duration (FLOAT, seconds)
├── view_count (INT)
├── created_at
└── deleted_at

reel_interactions
├── id (PK)
├── reel_id (FK → reels.id)
├── user_id (FK → users.id)
├── interaction_type (like/comment/share/save)
└── created_at

-- Privacy & Safety
blocked_users
├── id (PK)
├── blocker_id (FK → users.id)
├── blocked_id (FK → users.id)
├── blocked_at
└── UNIQUE(blocker_id, blocked_id)

reported_content
├── id (PK)
├── reporter_id (FK → users.id)
├── post_id (FK → posts.id, nullable)
├── user_id (FK → users.id, nullable)
├── reason (TEXT)
├── status (pending/reviewed/removed)
├── created_at

-- OTP Verification
otp_sessions
├── id (UUID, PK)
├── email (TEXT)
├── otp_code (INT)
├── is_verified (BOOLEAN)
├── created_at
├── expires_at

-- AI Features
ai_conversations
├── id (UUID, PK)
├── user_id (FK → users.id)
├── title (TEXT)
├── created_at
├── updated_at

ai_messages
├── id (UUID, PK)
├── conversation_id (FK → ai_conversations.id)
├── role (user/assistant)
├── content (TEXT)
├── created_at

ai_memory
├── id (UUID, PK)
├── user_id (FK → users.id)
├── key (TEXT)
├── value (JSON)
└── updated_at

-- Analytics & Activity
user_activity
├── id (PK)
├── user_id (FK → users.id)
├── action (login/post_created/comment/like/etc)
├── metadata (JSON)
├── created_at

omni_score_log
├── id (PK)
├── user_id (FK → users.id)
├── previous_score (FLOAT)
├── new_score (FLOAT)
├── reason (TEXT)
└── created_at
```

### 2.2 Feature-to-Table Mapping

| Feature | Tables Required | Priority |
|---------|-----------------|----------|
| User Registration & Auth | users, otp_sessions | P0 |
| Follow/Unfollow | user_relationships, users | P0 |
| Posts | posts, users | P0 |
| Like System | post_likes, posts | P0 |
| Comments | comments, comment_likes, posts | P1 |
| Stories | stories, story_views, users | P1 |
| Streaks | streaks, user_activity | P1 |
| Save/Bookmark | post_saves, posts | P0 |
| Search | posts, users, hashtags | P1 |
| Chat | conversations, messages, conversation_members, message_reads | P2 |
| Online Status | user_activity (real-time) | P2 |
| Reels | reels, reel_interactions | P2 |
| Hashtags | hashtags, post_hashtags | P1 |
| Block User | blocked_users | P3 |
| Report Content | reported_content | P3 |
| Private Accounts | users (is_private) | P3 |
| 2FA | users (2fa_enabled), otp_sessions | P3 |
| AI Assistant | ai_conversations, ai_messages, ai_memory | P4 |
| OMNI Score | omni_score_log, users | P2 |

---

## PART 3: IMPLEMENTATION ROADMAP

### PHASE 1: AUTHENTICATION & CORE SOCIAL (Week 1-2)

#### Phase 1.1: User Management
**Goal:** Enable user registration, login, authentication

**Backend APIs:**
```
POST /auth/register
  - Validate input
  - Hash password (bcrypt)
  - Create user in DB
  - Send OTP via email/SMS
  - Return: {user_id, otp_sent: true}

POST /auth/verify-otp
  - Verify OTP code
  - Mark email as verified
  - Return: {access_token, refresh_token}

POST /auth/login
  - Validate credentials
  - Compare password hash
  - Check 2FA if enabled
  - Return: {access_token, refresh_token, user}

POST /auth/logout
  - Invalidate tokens
  - Clear sessions

POST /auth/refresh-token
  - Validate refresh token
  - Issue new access token

GET /auth/me
  - Return current authenticated user data
```

**Database Migrations:**
```
- Create users table
- Create otp_sessions table
- Add RLS policies for auth
```

**Frontend Updates:**
```
- Connect login.html form to /auth/login
- Connect signup.html form to /auth/register
- Handle JWT tokens in localStorage
- Redirect unauthenticated users to /
- Add auth context/state management
```

**Dependencies:**
```
- python-jose (JWT tokens)
- passlib (password hashing)
- bcrypt
- python-dotenv
- fastapi-cors
```

#### Phase 1.2: Follow System
**Goal:** Enable users to follow/unfollow each other

**Backend APIs:**
```
POST /users/{user_id}/follow
  - Add follower relationship
  - Increment following count for current user
  - Increment followers count for target user
  - Return: {success, follower_count}

POST /users/{user_id}/unfollow
  - Remove follower relationship
  - Decrement counts
  - Return: {success, follower_count}

GET /users/{user_id}/followers
  - List all followers
  - Return: [user, user, ...]

GET /users/{user_id}/following
  - List all following
  - Return: [user, user, ...]

GET /users/{user_id}/followers/count
  - Return: {followers_count, following_count}
```

**Database Migrations:**
```
- Create user_relationships table
- Add followers/following counts to users
- Add indexes on user_id fields
```

**Frontend Updates:**
```
- Wire follow button on search.html
- Update profile.html with real follow counts
- Show followers/following lists
- Update profile mini-card on home.html
```

#### Phase 1.3: Post System
**Goal:** Enable users to create and view posts

**Backend APIs:**
```
POST /posts
  - Create new post
  - Handle image upload to storage
  - Extract hashtags
  - Return: {post_id, post}

GET /posts/{post_id}
  - Return post with: author, likes_count, comments_count, saved_status
  - Include author profile info

GET /feed
  - Return posts from followed users (chronological)
  - Pagination (limit, offset)
  - Include full post data

GET /posts/user/{user_id}
  - Return all posts from user (paginated)

DELETE /posts/{post_id}
  - Soft delete (set deleted_at)

GET /posts/explore
  - Return algorithmic feed (not chronological)
  - Mix of popular posts, trending, recommendations
```

**Database Migrations:**
```
- Create posts table
- Create post_hashtags table
- Create hashtags table
- Add indexes for user_id, created_at
```

**Frontend Updates:**
```
- Connect create.html form to /posts POST
- Create post preview/upload progress
- Show posts on home.html feed from /feed API
- Add infinite scroll/pagination
- Handle image uploads to Supabase storage
```

#### Phase 1.4: Like System
**Goal:** Users can like/unlike posts

**Backend APIs:**
```
POST /posts/{post_id}/like
  - Add like record
  - Increment post.likes_count
  - Return: {liked: true, like_count}

DELETE /posts/{post_id}/like
  - Remove like record
  - Decrement post.likes_count
  - Return: {liked: false, like_count}

GET /posts/{post_id}/likes
  - Return list of users who liked this post
```

**Database Migrations:**
```
- Create post_likes table
- Add unique constraint (post_id, user_id)
- Add trigger to update posts.likes_count
```

**Frontend Updates:**
```
- Like button now sends POST to /posts/{id}/like
- Unlike sends DELETE
- Real-time count update
- User can see who liked their post
```

#### Phase 1.5: Save/Bookmark System
**Goal:** Users can save posts for later

**Backend APIs:**
```
POST /posts/{post_id}/save
  - Add to post_saves
  - Return: {saved: true}

DELETE /posts/{post_id}/save
  - Remove from post_saves
  - Return: {saved: false}

GET /users/saved-posts
  - Return all saved posts for current user
  - Return: [post, post, ...]
```

**Database Migrations:**
```
- Create post_saves table
- Add index on (post_id, user_id)
```

**Frontend Updates:**
```
- Bookmark button now persists to DB
- Show saved posts on profile (SAVED tab)
- Real-time save/unsave
```

### PHASE 1 DELIVERABLES
- ✅ User authentication system
- ✅ Follow/unfollow with counts
- ✅ Post creation and feed
- ✅ Like system with counts
- ✅ Save/bookmark system
- **Estimated:** 2 weeks
- **Tech Stack:** FastAPI, Supabase, JWT, bcrypt, image storage

---

### PHASE 2: STORIES & COMMENTS (Week 3-4)

#### Phase 2.1: Story System
**Backend APIs:**
```
POST /stories
  - Upload story image/video
  - Set 24-hour expiration
  - Return: {story_id, story}

GET /stories/feed
  - Return active stories (not expired) from followed users
  - Include view count, viewed_at status
  - Sort by created_at descending

GET /stories/{story_id}
  - Return story with views list
  - Mark as viewed

DELETE /stories/{story_id}
  - Delete story (before 24h expiration)

GET /users/{user_id}/stories/active
  - Return active stories for user
```

**Database Migrations:**
```
- Create stories table with expires_at
- Create story_views table
- Add indexes on user_id, expires_at
- Add trigger to auto-delete expired stories
```

#### Phase 2.2: Story View Tracking
**Backend APIs:**
```
POST /stories/{story_id}/view
  - Record view
  - Return: {viewed: true}

GET /stories/{story_id}/views
  - Return list of users who viewed this story
  - Include view timestamps
```

**Database:** story_views table (already planned)

#### Phase 2.3: Comment System
**Backend APIs:**
```
POST /posts/{post_id}/comments
  - Create comment
  - Return: {comment_id, comment}

GET /posts/{post_id}/comments
  - Return all comments (paginated)
  - Include author info, like count

DELETE /comments/{comment_id}
  - Soft delete comment
  - Return: {success}

PATCH /comments/{comment_id}
  - Edit comment text
  - Return: {comment}

POST /comments/{comment_id}/like
  - Like a comment
  - Return: {liked: true, like_count}

DELETE /comments/{comment_id}/like
  - Unlike a comment
```

**Database Migrations:**
```
- Create comments table
- Create comment_likes table
- Add constraints and indexes
```

#### Phase 2.4: Streak System
**Backend APIs:**
```
GET /users/{user_id}/streak
  - Return: {current_streak, best_streak, last_activity_date}

POST /activity
  - Log user activity (auto-called on any action)
  - Update streak if day has passed
  - Calculate OMNI score
```

**Database Migrations:**
```
- Create streaks table
- Create user_activity table
- Create omni_score_log table (for audit trail)
- Add triggers for streak calculation
```

**Streak Logic:**
```
- Activity detected: post_created, comment_made, like, message_sent
- If no activity for 24+ hours: streak resets, best_streak captured
- If activity within 24h: +1 streak
```

### PHASE 2 DELIVERABLES
- ✅ Full story system (24h expiration)
- ✅ Story view tracking
- ✅ Comment system with nested replies capability
- ✅ Comment likes
- ✅ Streak tracking and calculation
- ✅ OMNI Score calculation
- **Estimated:** 2 weeks

---

### PHASE 3: REAL-TIME CHAT (Week 5-6)

#### Phase 3.1: Basic Messaging
**Backend APIs:**
```
POST /conversations
  - Create 1-on-1 or group conversation
  - Add members
  - Return: {conversation_id, conversation}

GET /conversations
  - Return all conversations for user
  - Include last message, member list

POST /conversations/{conv_id}/messages
  - Send message (text or media)
  - Return: {message_id, message}

GET /conversations/{conv_id}/messages
  - Get message history (paginated, newest first)
  - Include read status

DELETE /messages/{message_id}
  - Delete message
```

**Database Migrations:**
```
- Create conversations table
- Create conversation_members table
- Create messages table
- Create message_reads table
```

#### Phase 3.2: Real-Time Features (WebSocket)
**Backend APIs:**
```
WebSocket /ws/conversations/{conv_id}
  - Connect to message stream
  - Receive new messages in real-time
  - Broadcast typing indicators
  - Broadcast online status

Socket Events:
- message_new: {message}
- message_deleted: {message_id}
- user_typing: {user_id}
- user_online: {user_id}
- user_offline: {user_id}
```

**Dependencies:**
```
- websockets (FastAPI)
- redis (session management, broadcast)
- python-socketio (optional alternative)
```

#### Phase 3.3: Message Features
**Backend APIs:**
```
POST /messages/{message_id}/read
  - Mark message as read
  - Broadcast read receipt to sender

GET /conversations/{conv_id}/online-status
  - Return who's online in this conversation

POST /conversations/{conv_id}/typing
  - Broadcast typing indicator
```

**Frontend Updates:**
```
- WebSocket connection manager
- Real-time message display
- Online/offline indicators
- Typing indicators
- Read receipts
- Message input with emoji picker
```

### PHASE 3 DELIVERABLES
- ✅ Messaging system (text + media)
- ✅ WebSocket real-time updates
- ✅ Online status tracking
- ✅ Read receipts
- ✅ Typing indicators
- ✅ Group chat support
- **Estimated:** 2 weeks
- **Tech Stack:** WebSockets, Redis

---

### PHASE 4: SEARCH & DISCOVERY (Week 7)

#### Phase 4.1: Search
**Backend APIs:**
```
GET /search?q={query}&type={users|posts|hashtags}
  - Full-text search on posts (caption)
  - User search by username/full_name
  - Hashtag search
  - Return: [results]

GET /search/trending
  - Return trending hashtags
  - Return trending posts
  - Return trending users
```

**Database:**
```
- Add search indexes on posts.caption, users.username
- Consider PostgreSQL full-text search (if using Supabase)
- OR implement Elasticsearch for large scale
```

#### Phase 4.2: Explore Page
**Backend APIs:**
```
GET /explore
  - Algorithmic feed (not chronological)
  - Mix of trending + personalized recommendations
  - Don't show own posts
  - Don't show from followed users (they're on home)

Algorithm Logic:
  - Popular posts (highest likes in last 7 days)
  - Posts with hashtags user recently engaged with
  - Posts from users similar to followed users
  - Diversify content type (reels, stories, posts)
```

#### Phase 4.3: Hashtag System
**Backend APIs:**
```
GET /hashtags/{tag}
  - Return hashtag info (usage count, recent posts)
  - Return: {tag, usage_count, posts: []}

GET /hashtags/trending
  - Return top 20 trending hashtags (by usage)

POST /hashtags/{tag}/follow
  - Follow hashtag (curate custom feed)

GET /feed/custom
  - Feed based on followed hashtags
```

**Frontend Updates:**
```
- Clickable hashtags (link to /hashtags/{tag})
- Trending hashtags section on explore
- Follow/unfollow hashtags
- Search integration
```

### PHASE 4 DELIVERABLES
- ✅ Full-text search (users, posts, hashtags)
- ✅ Trending hashtags
- ✅ Explore page with algorithm
- ✅ Hashtag pages
- ✅ Custom feed from followed hashtags
- **Estimated:** 1 week

---

### PHASE 5: REELS (Week 8)

#### Phase 5.1: Video Upload
**Backend APIs:**
```
POST /reels
  - Upload video (handle large files)
  - Process video (thumbnail generation, transcoding)
  - Extract duration
  - Store metadata
  - Return: {reel_id, reel}

GET /reels/feed
  - Return chronological feed of reels (paginated)
  - Include view count, interaction metrics

GET /reels/{reel_id}
  - Return reel with interactions breakdown

DELETE /reels/{reel_id}
  - Delete reel and associated media
```

**Infrastructure:**
```
- Video storage (Supabase Storage or S3)
- Video transcoding (FFmpeg via worker)
- Thumbnail generation
- CDN for video delivery
```

#### Phase 5.2: Reel Interactions
**Backend APIs:**
```
POST /reels/{reel_id}/like
POST /reels/{reel_id}/unlike
POST /reels/{reel_id}/save
POST /reels/{reel_id}/share

GET /reels/{reel_id}/interactions
  - Return like count, save count, etc.

POST /reels/{reel_id}/view
  - Track reel view
  - Update view count
```

**Frontend:**
```
- Video player component
- Auto-play on scroll
- Gesture controls (tap to like, swipe to next)
- Comment overlay on video
- Share/save buttons
```

### PHASE 5 DELIVERABLES
- ✅ Video upload with processing
- ✅ Reel feed (swipeable, vertical scroll)
- ✅ Reel interactions (like, save, comment)
- ✅ View tracking
- **Estimated:** 1 week

---

### PHASE 6: PRIVACY & SAFETY (Week 9)

#### Phase 6.1: Block User
**Backend APIs:**
```
POST /users/{user_id}/block
  - Add to blocked_users
  - Remove from followers/following
  - Hide blocked user's posts
  - Return: {blocked: true}

DELETE /users/{user_id}/block
  - Unblock user
  - Return: {blocked: false}

GET /users/blocked
  - Return list of blocked users

GET /users/{user_id}/is-blocked-by-me
  - Return: {blocked: true/false}
```

#### Phase 6.2: Report Content
**Backend APIs:**
```
POST /posts/{post_id}/report
  - Submit report with reason
  - Store in reported_content table
  - Status: pending → reviewed → removed
  - Return: {report_id}

POST /users/{user_id}/report
  - Report user for abuse
```

#### Phase 6.3: Private Account
**Backend APIs:**
```
PATCH /users/me
  - Set is_private: true/false
  - If private: all follow requests need approval
  - Posts only visible to followers

POST /follow-requests
  - Send follow request to private account
  - Return: {request_id}

GET /follow-requests/pending
  - Return pending requests

POST /follow-requests/{request_id}/approve
POST /follow-requests/{request_id}/deny
```

#### Phase 6.4: Two-Factor Authentication
**Backend APIs:**
```
POST /auth/2fa/enable
  - Generate TOTP secret (QR code)
  - Return: {secret, qr_code_url}

POST /auth/2fa/verify
  - Verify TOTP code
  - Enable 2FA
  - Return: backup codes

POST /auth/login/verify-2fa
  - Second step during login
  - Verify TOTP code
```

**Dependencies:**
```
- pyotp (TOTP generation)
- qrcode (QR generation)
```

#### Phase 6.5: Hide From Search
**Backend APIs:**
```
PATCH /users/me
  - Set is_blocked_from_search: true/false
  - User won't appear in search results
  - User won't appear in recommendations
```

**Frontend:**
```
- Settings page with privacy options
- Checkbox: "Hide my account from search"
- Toggle: "Private account"
- List of blocked users with unblock buttons
- 2FA setup section
```

### PHASE 6 DELIVERABLES
- ✅ Block user system
- ✅ Report content/user (moderation)
- ✅ Private account mode with follow requests
- ✅ Two-factor authentication (TOTP)
- ✅ Hide from search feature
- **Estimated:** 1.5 weeks

---

### PHASE 7: OMNI AI (Week 11-12)

#### Phase 7.1: Personal AI Assistant
**Backend APIs:**
```
POST /ai/chat
  - Send message to AI
  - Process with OpenAI/Claude API
  - Store in ai_conversations
  - Return: {response, conversation_id}

GET /ai/conversations
  - List all AI conversations

GET /ai/conversations/{conv_id}
  - Get conversation history
  - Return: [message, message, ...]

DELETE /ai/conversations/{conv_id}
  - Delete conversation

POST /ai/memory/set
  - Store user preferences/info
  - Key-value store in ai_memory
  - Examples: "favorite_topics", "career", "interests"

GET /ai/memory
  - Retrieve stored memories
```

#### Phase 7.2: AI Context & Personalization
**Logic:**
```
- AI reads user's ai_memory to personalize responses
- AI analyzes user's posts/interests to understand them better
- AI can make recommendations based on user history
- AI can write post captions, suggest hashtags, etc.
```

#### Phase 7.3: Voice AI (Optional)
**Backend APIs:**
```
POST /ai/voice
  - Accept audio file
  - Convert to text (Whisper API)
  - Send to AI chat
  - Convert response to audio (text-to-speech)
  - Return: {text_response, audio_url}
```

**Dependencies:**
```
- openai (GPT API + Whisper)
- pyttsx3 or Google TTS (text-to-speech)
```

#### Phase 7.4: AI Recommendations
**Backend APIs:**
```
GET /ai/recommendations/content
  - Personalized post recommendations
  - Returns: [post, post, ...]

GET /ai/recommendations/users
  - Suggested users to follow
  - Returns: [user, user, ...]

GET /ai/recommendations/hashtags
  - Suggested hashtags for user's niche

POST /posts/ai-generate-caption
  - Generate caption from image (vision API)
  - Suggest hashtags
  - Return: {caption, hashtags}
```

**Frontend:**
```
- AI Assistant chat window (floating button on all pages)
- Voice input/output support
- Suggestion cards in feed/explore
- Caption generator on create.html
```

### PHASE 7 DELIVERABLES
- ✅ AI chat conversation system
- ✅ Memory management (personalization)
- ✅ Voice input (optional)
- ✅ Recommendation engine
- ✅ Content generation helper
- **Estimated:** 2 weeks
- **Tech Stack:** OpenAI API, Whisper, Vector embeddings

---

## PART 4: BUILD PRIORITY & FEATURE ORDER

### Critical Path (Start Here)

```
Week 1-2:  Auth + Follow + Posts + Likes
  └─ Most critical for MVP
  └─ Enables: posting, engagement, feeds
  
Week 3-4:  Stories + Comments + Streaks
  └─ Complete core social features
  └─ Adds engagement loops
  
Week 5-6:  Chat (Real-time)
  └─ Communication layer
  └─ Differentiator from Instagram
  
Week 7:    Search + Discover
  └─ Content discovery
  └─ Algorithm foundation
  
Week 8:    Reels
  └─ Long-form video content
  └─ Growth driver
  
Week 9:    Privacy + Safety
  └─ Trust building
  └─ Compliance
  
Week 10-12: AI Features
  └─ Unique differentiation
  └─ Value-add layer
```

### What to Build First

**Priority 1 (Week 1):**
1. ✅ User registration + OTP verification
2. ✅ Login/logout + JWT tokens
3. ✅ User profile creation
4. ✅ Follow/unfollow system
5. ✅ Basic post creation (text only)

**Priority 2 (Week 2):**
1. ✅ Post images
2. ✅ Post feed (chronological)
3. ✅ Like system
4. ✅ Save/bookmark
5. ✅ User profile pages

**Priority 3 (Week 3):**
1. ✅ Story upload
2. ✅ Comment system
3. ✅ Streak tracking
4. ✅ OMNI score calculation

---

## PART 5: DATABASE MIGRATIONS STRATEGY

### Supabase Setup
```bash
1. Create Supabase project
2. Create all tables via SQL migrations
3. Enable RLS (Row Level Security) for each table
4. Set up policies for authentication
5. Configure storage buckets (images, videos)
```

### RLS Policy Examples

**Users table:**
```sql
-- Users can view public profiles
CREATE POLICY "Users can view profiles" ON users
  FOR SELECT USING (true);

-- Users can only edit their own profile
CREATE POLICY "Users can edit own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

**Posts table:**
```sql
-- Users can see posts from non-private accounts
-- Users can see all posts if following the author
CREATE POLICY "View public posts" ON posts
  FOR SELECT USING (
    NOT EXISTS (
      SELECT 1 FROM users WHERE users.id = posts.user_id AND users.is_private = true
    )
    OR posts.user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_relationships 
      WHERE follower_id = auth.uid() AND following_id = posts.user_id
    )
  );
```

**Messages table:**
```sql
-- Users can only see messages they're part of
CREATE POLICY "View own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );
```

---

## PART 6: TECHNOLOGY STACK

### Backend
```
Framework:      FastAPI (Python)
Database:       Supabase (PostgreSQL)
Auth:           JWT + bcrypt + TOTP
Real-time:      WebSockets + Redis
Storage:        Supabase Storage (images/videos)
Async:          asyncio + aioredis
API Docs:       Swagger/OpenAPI
```

### Frontend
```
HTML/CSS/JS:    Already built (no framework)
State Mgmt:     Vanilla JS + LocalStorage
Real-time:      WebSocket client
Async:          Fetch API + async/await
Storage:        IndexedDB (offline support)
```

### External APIs
```
Auth/OTP:       Twilio (SMS) or SendGrid (Email)
AI:             OpenAI API (GPT-4, Whisper)
Video:          FFmpeg (transcoding)
CDN:            Cloudflare or AWS CloudFront
Analytics:      Mixpanel or Amplitude
Monitoring:     Sentry (errors)
```

### Infrastructure
```
Server:         Vercel/Railway/Render (FastAPI)
Database:       Supabase (Postgres)
Storage:        Supabase Storage or S3
Cache:          Redis (Upstash)
Queue:          Celery + Redis (async tasks)
Monitoring:     New Relic or DataDog
```

---

## PART 7: DEPENDENCIES SUMMARY

### Python Packages
```
# Core
fastapi==0.104.0
uvicorn==0.24.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.23
alembic==1.13.0
supabase-py==2.0.0
asyncpg==0.29.0

# Auth
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.1.1
pyotp==2.9.0
qrcode==7.4.2

# Real-time
websockets==12.0
aioredis==2.0.1
redis==5.0.1

# External APIs
openai==1.3.0
twilio==8.10.0
sendgrid==6.11.0
requests==2.31.0

# Utilities
python-dotenv==1.0.0
pydantic==2.5.0
email-validator==2.1.0
python-slugify==8.0.1

# Async
httpx==0.25.2
aiofiles==23.2.1

# Monitoring
sentry-sdk==1.39.1

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
```

### Frontend Libraries (External)
```
# Fonts (via Google Fonts) - Already included in CSS
- Share Tech Mono
- Rajdhani
- Inter

# No additional JS libraries needed (vanilla implementation)
```

---

## PART 8: PHASE-BY-PHASE DEPENDENCY REQUIREMENTS

| Phase | Dependencies Needed | Installation |
|-------|-------------------|--------------|
| Phase 1 | FastAPI, Supabase, JWT, bcrypt, email, OTP | `pip install -r requirements-p1.txt` |
| Phase 2 | + Trigger management, scheduled tasks | `pip install -r requirements-p2.txt` |
| Phase 3 | + WebSockets, Redis | `pip install -r requirements-p3.txt` |
| Phase 4 | + Full-text search indexing | `pip install -r requirements-p4.txt` |
| Phase 5 | + Video processing, FFmpeg | `pip install -r requirements-p5.txt` |
| Phase 6 | + TOTP, QR codes | `pip install -r requirements-p6.txt` |
| Phase 7 | + OpenAI, Whisper, embeddings | `pip install -r requirements-p7.txt` |

---

## PART 9: BACKEND API STRUCTURE

```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /verify-otp
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh-token
│   ├── GET /me
│   └── POST /2fa/*
├── /users
│   ├── GET /{user_id}
│   ├── PATCH /me
│   ├── GET /{user_id}/followers
│   ├── GET /{user_id}/following
│   ├── POST /{user_id}/follow
│   ├── DELETE /{user_id}/unfollow
│   ├── POST /{user_id}/block
│   ├── GET /blocked
│   └── GET /search
├── /posts
│   ├── POST /
│   ├── GET /feed
│   ├── GET /explore
│   ├── GET /{post_id}
│   ├── DELETE /{post_id}
│   ├── POST /{post_id}/like
│   ├── DELETE /{post_id}/like
│   ├── POST /{post_id}/save
│   ├── DELETE /{post_id}/save
│   ├── GET /{post_id}/comments
│   ├── POST /{post_id}/comments
│   └── POST /{post_id}/report
├── /stories
│   ├── POST /
│   ├── GET /feed
│   ├── GET /{story_id}
│   ├── DELETE /{story_id}
│   ├── POST /{story_id}/view
│   └── GET /{story_id}/views
├── /comments
│   ├── POST /{comment_id}/like
│   ├── DELETE /{comment_id}/like
│   ├── PATCH /{comment_id}
│   └── DELETE /{comment_id}
├── /chat
│   ├── GET /conversations
│   ├── POST /conversations
│   ├── GET /conversations/{conv_id}
│   ├── POST /conversations/{conv_id}/messages
│   ├── GET /conversations/{conv_id}/messages
│   ├── POST /messages/{msg_id}/read
│   └── WS /conversations/{conv_id}
├── /reels
│   ├── POST /
│   ├── GET /feed
│   ├── GET /{reel_id}
│   ├── DELETE /{reel_id}
│   ├── POST /{reel_id}/like
│   ├── DELETE /{reel_id}/like
│   └── POST /{reel_id}/view
├── /hashtags
│   ├── GET /{tag}
│   ├── GET /trending
│   ├── POST /{tag}/follow
│   └── DELETE /{tag}/unfollow
├── /search
│   ├── GET /?q=&type=
│   └── GET /trending
├── /activity
│   ├── POST / (log activity, update streak)
│   └── GET /streak
└── /ai
    ├── POST /chat
    ├── GET /conversations
    ├── POST /memory/set
    ├── GET /memory
    ├── POST /recommendations/content
    └── POST /posts/caption-generate
```

---

## PART 10: FRONTEND UPDATES BY PHASE

| Phase | Pages to Update | New Components |
|-------|-----------------|-----------------|
| P1 | login, signup, home, profile | Auth forms, Follow btn, Post card |
| P2 | home, search | Story card, Comment thread, Streak badge |
| P3 | chat, home | Message list, Chat input, Online indicator |
| P4 | search, explore | Search filters, Trending tags, Explore grid |
| P5 | create, home | Video player, Reel card, Gesture handler |
| P6 | settings (new) | Privacy toggles, Block list, 2FA setup |
| P7 | All pages | AI chat widget, Recommendation cards |

---

## PART 11: IMPLEMENTATION CHECKLIST

### Phase 1
- [ ] Supabase project created
- [ ] Tables: users, otp_sessions migrated
- [ ] RLS policies enabled
- [ ] JWT implementation in FastAPI
- [ ] Password hashing with bcrypt
- [ ] OTP service integrated
- [ ] Email/SMS sending configured
- [ ] Auth routes implemented
- [ ] Frontend auth flows connected
- [ ] Follow system endpoints
- [ ] Follow UI wired up
- [ ] Post creation API
- [ ] Post feed API
- [ ] Like system backend
- [ ] Like UI persistence

### Phase 2
- [ ] Story table migrated
- [ ] Story upload + 24h expiration logic
- [ ] Story view tracking
- [ ] Comment table migrated
- [ ] Comment endpoints
- [ ] Streak calculation logic
- [ ] OMNI score algorithm
- [ ] Activity logging

### Phase 3
- [ ] Conversation/message tables migrated
- [ ] WebSocket server setup
- [ ] Redis cache configured
- [ ] Real-time message delivery
- [ ] Online status tracking
- [ ] Read receipts implementation
- [ ] Chat frontend components

### And so on...

---

## PART 12: FIRST FEATURE TO BUILD (Recommendation)

### Build Authentication First (Phase 1.1)

**Why:**
1. Foundation for all other features
2. Enables user identification
3. Needed for OTP → personalized features
4. Fastest to implement (1-2 days)
5. High impact (unlocks everything else)

**Implementation Order:**
1. Create users table + RLS
2. Add bcrypt password hashing
3. Implement /auth/register endpoint
4. Implement /auth/login endpoint
5. Add JWT token generation/validation
6. Connect login.html form to API
7. Connect signup.html form to API
8. Test full auth flow

**Estimated Time:** 3-4 days

---

## CONCLUSION

**OMNIX is a 12-week project** to build a unified social platform combining Instagram, Facebook, Snapchat, WhatsApp, and AI:

- **Weeks 1-4:** Social core (posts, stories, comments, streaks)
- **Weeks 5-6:** Real-time communication (chat)
- **Weeks 7-8:** Discovery (search, explore, reels)
- **Weeks 9:** Privacy & safety
- **Weeks 10-12:** AI features

**Start with Phase 1.1 (Authentication)** → unlocks all other features.

**Total Database Tables:** 22 tables (fully designed above)

**Total Backend APIs:** 80+ endpoints (fully mapped above)

**Frontend Status:** 95% complete (only needs API integration)

**Tech Stack:** FastAPI, Supabase, WebSockets, Redis, OpenAI

All architectural decisions prioritize scalability, security, and real-time capabilities.
