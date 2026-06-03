# OMNIX Profile & Settings System - Complete Architecture

## Executive Summary

This document defines the complete architecture for OMNIX Profile, Settings, and Privacy systems. Includes:
- Database schema (13 new tables)
- API endpoints (40+ routes)
- Frontend wireframes & components
- Implementation roadmap
- UI/UX specifications

**Status:** Design-complete, ready for implementation

---

## PART 1: DATABASE SCHEMA

### 1.1 User Core Tables (Expansion)

#### users (Modified from existing)
```sql
CREATE TABLE users (
  -- Basic Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  
  -- Profile Information
  display_name TEXT,
  bio TEXT DEFAULT '',
  profile_pic_url TEXT,
  cover_pic_url TEXT,
  website_url TEXT,
  location TEXT,
  
  -- Profile Settings
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_blocked_from_search BOOLEAN DEFAULT FALSE,
  
  -- Security Settings
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret TEXT,
  
  -- Gamification
  omni_score FLOAT DEFAULT 0.0,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  
  -- Account Management
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_private ON users(is_private);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public profiles"
  ON users FOR SELECT
  USING (NOT is_private OR auth.uid() = id);

CREATE POLICY "Users can only update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can only delete own account"
  ON users FOR DELETE
  USING (auth.uid() = id);
```

---

### 1.2 Profile & Activity Tables

#### user_profiles (Extended Profile Data)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Additional Fields
  bio_formatted JSONB,
  interests TEXT[],
  pronouns TEXT,
  birthday DATE,
  
  -- Statistics
  total_posts INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_likes_received INT DEFAULT 0,
  total_views INT DEFAULT 0,
  
  -- Visibility
  show_followers BOOLEAN DEFAULT TRUE,
  show_following BOOLEAN DEFAULT TRUE,
  show_posts_count BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

#### user_activity_log (Activity Tracking)
```sql
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  action VARCHAR NOT NULL,  -- login, logout, post_created, comment, like, etc.
  action_metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR,  -- mobile, tablet, desktop, unknown
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user_id_date ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_action ON user_activity_log(action);
```

#### user_sessions (Active Sessions)
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  session_token TEXT UNIQUE NOT NULL,
  device_name TEXT,
  device_type VARCHAR,
  browser VARCHAR,
  os VARCHAR,
  ip_address INET,
  
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  is_revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
```

---

### 1.3 Privacy & Security Tables

#### blocked_users (Block List)
```sql
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_blocked_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_user ON blocked_users(blocked_id);

-- RLS: Users can only see their own blocks
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocked list"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);
```

#### muted_users (Mute List)
```sql
CREATE TABLE muted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  muted_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  mute_type VARCHAR DEFAULT 'all',  -- all, stories, posts, messages
  muted_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(muter_id, muted_id),
  CHECK (muter_id != muted_id)
);

CREATE INDEX idx_muted_muter ON muted_users(muter_id);
```

#### restricted_users (Restricted Interactions)
```sql
CREATE TABLE restricted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restrictor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restricted_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  can_see_stories BOOLEAN DEFAULT FALSE,
  can_send_messages BOOLEAN DEFAULT FALSE,
  can_see_activity BOOLEAN DEFAULT FALSE,
  
  restricted_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restrictor_id, restricted_id),
  CHECK (restrictor_id != restricted_id)
);

CREATE INDEX idx_restricted_restrictor ON restricted_users(restrictor_id);
```

#### reported_users (Report History)
```sql
CREATE TABLE reported_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  reason VARCHAR NOT NULL,  -- harassment, spam, impersonation, etc.
  description TEXT,
  status VARCHAR DEFAULT 'pending',  -- pending, under_review, resolved, dismissed
  
  moderator_id UUID REFERENCES users(id),
  resolution TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reported_user ON reported_users(reported_id);
CREATE INDEX idx_reported_status ON reported_users(status);
```

#### notification_settings (User Notification Preferences)
```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Push Notifications
  push_likes BOOLEAN DEFAULT TRUE,
  push_comments BOOLEAN DEFAULT TRUE,
  push_follows BOOLEAN DEFAULT TRUE,
  push_messages BOOLEAN DEFAULT TRUE,
  push_mentions BOOLEAN DEFAULT TRUE,
  
  -- Email Notifications
  email_likes BOOLEAN DEFAULT FALSE,
  email_comments BOOLEAN DEFAULT FALSE,
  email_follows BOOLEAN DEFAULT FALSE,
  email_messages BOOLEAN DEFAULT FALSE,
  email_digests BOOLEAN DEFAULT TRUE,
  
  -- SMS Notifications
  sms_messages BOOLEAN DEFAULT FALSE,
  sms_critical BOOLEAN DEFAULT TRUE,
  
  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone VARCHAR,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

#### privacy_settings (User Privacy Preferences)
```sql
CREATE TABLE privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Account Privacy
  is_private BOOLEAN DEFAULT FALSE,
  is_hidden_from_search BOOLEAN DEFAULT FALSE,
  allow_follow_requests BOOLEAN DEFAULT TRUE,
  
  -- Profile Visibility
  show_followers BOOLEAN DEFAULT TRUE,
  show_following BOOLEAN DEFAULT TRUE,
  show_activity_status BOOLEAN DEFAULT TRUE,
  show_read_receipts BOOLEAN DEFAULT TRUE,
  
  -- Content Visibility
  allow_message_from_strangers BOOLEAN DEFAULT FALSE,
  allow_comments_on_posts BOOLEAN DEFAULT TRUE,
  allow_tagging BOOLEAN DEFAULT TRUE,
  
  -- Data & Analytics
  allow_personalization BOOLEAN DEFAULT TRUE,
  allow_data_sale BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

#### security_settings (Security Preferences)
```sql
CREATE TABLE security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Authentication
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_method VARCHAR,  -- authenticator, sms, email
  
  -- Session Management
  require_login_approval BOOLEAN DEFAULT FALSE,
  auto_logout_minutes INT DEFAULT 0,  -- 0 = disabled
  
  -- Security Alerts
  login_alerts_enabled BOOLEAN DEFAULT TRUE,
  new_device_alerts BOOLEAN DEFAULT TRUE,
  
  -- Password
  password_changed_at TIMESTAMPTZ,
  password_attempts INT DEFAULT 0,
  password_locked_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

#### theme_settings (User Theme Preferences)
```sql
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  theme VARCHAR DEFAULT 'dark',  -- dark, light (future)
  accent_color VARCHAR DEFAULT '#00d4ff',  -- custom color support (future)
  font_size VARCHAR DEFAULT 'normal',  -- small, normal, large
  compact_mode BOOLEAN DEFAULT FALSE,
  high_contrast BOOLEAN DEFAULT FALSE,
  motion_reduced BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

#### follow_requests (Private Account Follow Requests)
```sql
CREATE TABLE follow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  status VARCHAR DEFAULT 'pending',  -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  UNIQUE(requester_id, target_id),
  CHECK (requester_id != target_id)
);

CREATE INDEX idx_follow_requests_target ON follow_requests(target_id);
CREATE INDEX idx_follow_requests_status ON follow_requests(status);
```

#### login_attempts (Failed Login Tracking)
```sql
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_or_username TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN,
  failure_reason TEXT,
  
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email_or_username, attempted_at DESC);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, attempted_at DESC);
```

---

## PART 2: API ENDPOINTS (40+ Routes)

### 2.1 Profile Management APIs

```
GET    /api/v1/users/{user_id}
       Returns: {user, profile, followers_count, following_count, is_following, is_blocked}

GET    /api/v1/users/me
       Returns: {user, profile, settings, preferences} (authenticated user)

PATCH  /api/v1/users/me
       Body: {display_name, bio, website_url, location, profile_pic_url, cover_pic_url}
       Returns: {user}

GET    /api/v1/users/{user_id}/profile
       Returns: {profile_data, stats, verification_badge}

GET    /api/v1/users/{user_id}/posts
       Returns: [posts] (paginated)
       Query: ?tab=posts&limit=12&offset=0

GET    /api/v1/users/{user_id}/media
       Returns: [posts_with_media] (only with images/videos)

GET    /api/v1/users/me/saved
       Returns: [saved_posts] (authenticated user only)

GET    /api/v1/users/me/likes
       Returns: [liked_posts] (authenticated user only)

GET    /api/v1/users/{user_id}/followers
       Returns: [users] (paginated)
       Query: ?limit=20&offset=0

GET    /api/v1/users/{user_id}/following
       Returns: [users] (paginated)

GET    /api/v1/users/{user_id}/is-follower
       Returns: {is_follower, is_blocked}

POST   /api/v1/users/{user_id}/report
       Body: {reason, description}
       Returns: {report_id, status}
```

### 2.2 Settings APIs

```
GET    /api/v1/settings/account
       Returns: {email, username, mobile, created_at, verification_status}

POST   /api/v1/settings/change-password
       Body: {current_password, new_password}
       Returns: {success, message}

POST   /api/v1/settings/change-email
       Body: {new_email, current_password}
       Returns: {verification_code_sent}

POST   /api/v1/settings/verify-email-change
       Body: {new_email, verification_code}
       Returns: {success}

POST   /api/v1/settings/change-phone
       Body: {new_phone, current_password}
       Returns: {verification_code_sent}

POST   /api/v1/settings/verify-phone-change
       Body: {new_phone, verification_code}
       Returns: {success}

POST   /api/v1/settings/change-username
       Body: {new_username, current_password}
       Returns: {success, message} or {error, available_usernames}

GET    /api/v1/settings/notifications
       Returns: {notification_settings}

PATCH  /api/v1/settings/notifications
       Body: {push_likes, push_comments, email_digests, ...}
       Returns: {notification_settings}

GET    /api/v1/settings/privacy
       Returns: {privacy_settings}

PATCH  /api/v1/settings/privacy
       Body: {is_private, is_hidden_from_search, show_followers, ...}
       Returns: {privacy_settings}

GET    /api/v1/settings/security
       Returns: {two_fa_enabled, password_changed_at, login_alerts}

GET    /api/v1/settings/theme
       Returns: {theme, accent_color, font_size, compact_mode}

PATCH  /api/v1/settings/theme
       Body: {theme, font_size, compact_mode, high_contrast, motion_reduced}
       Returns: {theme_settings}

POST   /api/v1/settings/logout
       Returns: {success}

POST   /api/v1/settings/logout-all
       Returns: {success, message: "All sessions ended"}
```

### 2.3 Privacy & Security APIs

```
POST   /api/v1/users/{user_id}/block
       Returns: {blocked, success}

DELETE /api/v1/users/{user_id}/unblock
       Returns: {blocked: false}

GET    /api/v1/users/blocked
       Returns: [blocked_users] (paginated)

GET    /api/v1/users/blocked/{user_id}
       Returns: {is_blocked}

POST   /api/v1/users/{user_id}/mute
       Body: {mute_type: "all|stories|posts|messages"}
       Returns: {muted}

DELETE /api/v1/users/{user_id}/unmute
       Returns: {muted: false}

GET    /api/v1/users/muted
       Returns: [muted_users]

POST   /api/v1/users/{user_id}/restrict
       Body: {can_see_stories, can_send_messages, can_see_activity}
       Returns: {restricted}

DELETE /api/v1/users/{user_id}/unrestrict
       Returns: {restricted: false}

GET    /api/v1/users/restricted
       Returns: [restricted_users]

GET    /api/v1/users/reported
       Returns: [reports] (admin only)

PATCH  /api/v1/reports/{report_id}
       Body: {status, resolution, moderator_notes}
       Returns: {report}
```

### 2.4 Two-Factor Authentication APIs

```
POST   /api/v1/auth/2fa/setup
       Returns: {secret, qr_code_url, backup_codes}

POST   /api/v1/auth/2fa/verify
       Body: {code}
       Returns: {success, two_fa_enabled: true}

POST   /api/v1/auth/2fa/disable
       Body: {password}
       Returns: {success, two_fa_enabled: false}

POST   /api/v1/auth/2fa/backup-codes
       Returns: [backup_codes]

POST   /api/v1/auth/login/verify-2fa
       Body: {login_token, 2fa_code}
       Returns: {access_token, refresh_token}
```

### 2.5 Session Management APIs

```
GET    /api/v1/sessions
       Returns: [active_sessions]

DELETE /api/v1/sessions/{session_id}
       Returns: {success}

POST   /api/v1/sessions/logout-all
       Returns: {success}

GET    /api/v1/activity
       Returns: [activity_log] (paginated, last 90 days)

GET    /api/v1/login-history
       Returns: [login_attempts] (paginated, last 30 days)
```

### 2.6 Follow Request APIs (Private Accounts)

```
POST   /api/v1/users/{user_id}/follow-request
       Returns: {request_id, status: "pending"}

GET    /api/v1/follow-requests/pending
       Returns: [pending_requests]

POST   /api/v1/follow-requests/{request_id}/approve
       Returns: {status: "approved", followed: true}

POST   /api/v1/follow-requests/{request_id}/reject
       Returns: {status: "rejected"}

DELETE /api/v1/follow-requests/{request_id}
       Returns: {success}
```

---

## PART 3: FRONTEND WIREFRAMES & COMPONENTS

### 3.1 Profile Page Structure

```
┌─────────────────────────────────────────┐
│           PROFILE HEADER                │
│  // @username  [⋯ OPTIONS]  [← BACK]   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     PROFILE BANNER (gradient)           │
│     [EDIT BANNER BUTTON]                │
│                                         │
│    ┌─────────────┐                      │
│    │   AVATAR    │  Display Name        │
│    │  [EDIT]     │  @username NODE-42   │
│    └─────────────┘  Bio text here...    │
│                     🔗 website.com      │
│                     📍 Location         │
│                                         │
│     ┌─────┬─────┬─────┬─────┐          │
│     │Posts│Follow│Following│OMNI│      │
│     │ 248 │ 4.2K │  312   │9.3 │      │
│     └─────┴─────┴─────┴─────┘          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TABS: POSTS | MEDIA | SAVED | TAGGED  │
│  ─────────────────────────────────────── │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ POST │ │ POST │ │ POST │           │
│  └──────┘ └──────┘ └──────┘           │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ POST │ │ POST │ │ POST │           │
│  └──────┘ └──────┘ └──────┘           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  FIXED BOTTOM NAVIGATION (5 items)      │
│  Home | Search | Create | Chat |Profile │
└─────────────────────────────────────────┘
```

### 3.2 Edit Profile Modal

```
┌───────────────────────────────────────┐
│  EDIT PROFILE          [✕ CLOSE]      │
├───────────────────────────────────────┤
│                                       │
│  [UPLOAD PROFILE PIC]                 │
│                                       │
│  [UPLOAD COVER PIC]                   │
│                                       │
│  Display Name: [____________]         │
│  Username:     [____________]         │
│  Bio:          [____________] 150/160 │
│  Website:      [____________]         │
│  Location:     [____________]         │
│                                       │
│  [X] Make Account Private             │
│  [X] Hide from Search                 │
│                                       │
│           [SAVE]  [CANCEL]            │
└───────────────────────────────────────┘
```

### 3.3 Settings Page Layout

```
┌─────────────────────────────────────────┐
│     SETTINGS              [← BACK]      │
├─────────────────────────────────────────┤
│                                         │
│  ACCOUNT SETTINGS                       │
│  ├─ Edit Profile        [>]            │
│  ├─ Change Username     [>]            │
│  ├─ Change Email        [>]            │
│  ├─ Change Phone        [>]            │
│  ├─ Change Password     [>]            │
│  └─ Verification Badge  [>]            │
│                                         │
│  NOTIFICATIONS                          │
│  ├─ Push Notifications  [Toggle]       │
│  ├─ Email Digest        [Toggle]       │
│  ├─ Quiet Hours         [>]            │
│  └─ Notification Settings [>]          │
│                                         │
│  PRIVACY                                │
│  ├─ Private Account     [Toggle]       │
│  ├─ Hide from Search    [Toggle]       │
│  ├─ Blocked Users       [>] (5)        │
│  ├─ Muted Users         [>] (2)        │
│  ├─ Restricted Users    [>] (0)        │
│  └─ Activity Status     [Toggle]       │
│                                         │
│  SECURITY                               │
│  ├─ Two-Factor Auth     [>] (Disabled) │
│  ├─ Active Sessions     [>] (3)        │
│  ├─ Login History       [>]            │
│  ├─ Login Alerts        [Toggle]       │
│  └─ New Device Alerts   [Toggle]       │
│                                         │
│  DISPLAY                                │
│  ├─ Theme              [dark] [v]      │
│  ├─ Font Size          [normal] [v]    │
│  ├─ Compact Mode       [Toggle]        │
│  ├─ High Contrast      [Toggle]        │
│  └─ Reduce Motion      [Toggle]        │
│                                         │
│  ACCOUNT ACTIONS                        │
│  ├─ Logout                    [Button] │
│  ├─ Logout All Sessions       [Button] │
│  ├─ Deactivate Account        [Button] │
│  └─ Delete Account (Admin)    [Button] │
│                                         │
└─────────────────────────────────────────┘
```

### 3.4 Privacy Settings Modal

```
┌─────────────────────────────────────────┐
│  PRIVACY SETTINGS         [✕]           │
├─────────────────────────────────────────┤
│                                         │
│  ACCOUNT PRIVACY                        │
│  ┌─────────────────────────────────┐  │
│  │ [X] Private Account             │  │
│  │ Only approved followers can     │  │
│  │ follow you. You'll receive      │  │
│  │ follow requests.                │  │
│  └─────────────────────────────────┘  │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │ [X] Hide from Search            │  │
│  │ Your account won't appear in    │  │
│  │ search results or suggestions.  │  │
│  └─────────────────────────────────┘  │
│                                        │
│  VISIBILITY OPTIONS                    │
│  ┌─────────────────────────────────┐  │
│  │ [X] Show my followers list      │  │
│  │ [X] Show my following list      │  │
│  │ [X] Show my activity status     │  │
│  │ [X] Show read receipts          │  │
│  └─────────────────────────────────┘  │
│                                        │
│  CONTENT SETTINGS                      │
│  ┌─────────────────────────────────┐  │
│  │ [X] Allow messages from anyone  │  │
│  │ [ ] Allow only followers        │  │
│  │ [X] Allow tagging in posts      │  │
│  │ [X] Allow comments on my posts  │  │
│  └─────────────────────────────────┘  │
│                                        │
│          [SAVE]  [CANCEL]              │
└─────────────────────────────────────────┘
```

### 3.5 Security Settings Modal

```
┌─────────────────────────────────────────┐
│  SECURITY SETTINGS        [✕]           │
├─────────────────────────────────────────┤
│                                         │
│  TWO-FACTOR AUTHENTICATION              │
│  ┌─────────────────────────────────┐  │
│  │ Status: DISABLED                │  │
│  │                                 │  │
│  │ [ENABLE 2FA]                    │  │
│  │ Add an extra layer of security  │  │
│  │ to your account.                │  │
│  └─────────────────────────────────┘  │
│                                        │
│  SESSIONS (3 active)                   │
│  ┌─────────────────────────────────┐  │
│  │ This Device                     │  │
│  │ Chrome on macOS · 192.168.1.1   │  │
│  │ Last active: now                │  │
│  │                [REVOKE]         │  │
│  ├─────────────────────────────────┤  │
│  │ Mobile                          │  │
│  │ Safari on iOS · 192.168.1.100   │  │
│  │ Last active: 2 hours ago        │  │
│  │                [REVOKE]         │  │
│  ├─────────────────────────────────┤  │
│  │ Other                           │  │
│  │ Firefox on Windows              │  │
│  │ Last active: 3 days ago         │  │
│  │                [REVOKE]         │  │
│  └─────────────────────────────────┘  │
│                                        │
│  [LOGOUT ALL SESSIONS]                 │
│                                        │
│  LOGIN ALERTS                          │
│  ┌─────────────────────────────────┐  │
│  │ [X] Email alerts for new logins │  │
│  │ [X] Alert for new devices       │  │
│  │ [ ] Require approval for login  │  │
│  └─────────────────────────────────┘  │
│                                        │
│  PASSWORD LAST CHANGED: 90 days ago    │
│  [CHANGE PASSWORD]                     │
│                                        │
│          [DONE]                        │
└─────────────────────────────────────────┘
```

### 3.6 Blocked Users Page

```
┌─────────────────────────────────────────┐
│  BLOCKED USERS (5)        [← BACK]      │
├─────────────────────────────────────────┤
│                                         │
│  Search blocked users: [____________]  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  [Avatar] User Name             │  │
│  │           @username             │  │
│  │ Blocked 5 days ago    [UNBLOCK] │  │
│  └─────────────────────────────────┘  │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │  [Avatar] Another User          │  │
│  │           @another_user         │  │
│  │ Blocked 3 weeks ago   [UNBLOCK] │  │
│  └─────────────────────────────────┘  │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │  [Avatar] Third User            │  │
│  │           @third_user           │  │
│  │ Blocked 2 months ago  [UNBLOCK] │  │
│  └─────────────────────────────────┘  │
│                                        │
│  (... more items paginated)            │
│                                        │
└─────────────────────────────────────────┘
```

---

## PART 4: IMPLEMENTATION ROADMAP

### Phase 4A: Database & API Infrastructure (1 week)

#### Week 1, Days 1-2: Database Migration
- [ ] Create all 13 new tables (see schema above)
- [ ] Set up RLS policies
- [ ] Create indexes for performance
- [ ] Seed sample data for testing
- [ ] Verify migrations with test queries

#### Week 1, Days 3-4: API Base Setup
- [ ] Create `/backend/routes/profile.py`
- [ ] Create `/backend/routes/settings.py`
- [ ] Create `/backend/routes/privacy.py`
- [ ] Create `/backend/services/profile_service.py`
- [ ] Create `/backend/services/privacy_service.py`
- [ ] Setup FastAPI dependency injection for auth middleware

#### Week 1, Days 5-7: Core Profile APIs
- [ ] `GET /api/v1/users/{user_id}` - Get user profile
- [ ] `GET /api/v1/users/me` - Get authenticated user
- [ ] `PATCH /api/v1/users/me` - Update user profile
- [ ] `GET /api/v1/users/{user_id}/followers`
- [ ] `GET /api/v1/users/{user_id}/following`
- [ ] `GET /api/v1/users/{user_id}/posts`
- [ ] Test all endpoints with sample data

### Phase 4B: Frontend Profile Pages (1 week)

#### Week 2, Days 1-3: Profile Page UI
- [ ] Create `templates/profile-view.html` (read-only view of any user)
- [ ] Update `templates/profile.html` for authenticated user (my profile)
- [ ] Create `components/profile-header.html`
- [ ] Create `components/profile-tabs.html`
- [ ] Wire up profile tab switching (JS)
- [ ] Add profile image lazy loading

#### Week 2, Days 4-5: Edit Profile Modal
- [ ] Create `components/edit-profile-modal.html`
- [ ] Add form validation (client-side)
- [ ] Wire to `PATCH /api/v1/users/me`
- [ ] Add file upload for profile & cover pics
- [ ] Show success/error toasts

#### Week 2, Days 6-7: Settings Page
- [ ] Create `templates/settings.html`
- [ ] Create `components/settings-account.html`
- [ ] Create `components/settings-notifications.html`
- [ ] Create `components/settings-privacy.html`
- [ ] Create `components/settings-security.html`
- [ ] Create `components/settings-display.html`

### Phase 4C: Settings APIs (1 week)

#### Week 3, Days 1-3: Account Settings
- [ ] `GET /api/v1/settings/account`
- [ ] `POST /api/v1/settings/change-password`
- [ ] `POST /api/v1/settings/change-email`
- [ ] `POST /api/v1/settings/verify-email-change`
- [ ] `POST /api/v1/settings/change-phone`
- [ ] `POST /api/v1/settings/verify-phone-change`
- [ ] `POST /api/v1/settings/change-username`

#### Week 3, Days 4-5: Preferences APIs
- [ ] `GET /api/v1/settings/notifications` + `PATCH`
- [ ] `GET /api/v1/settings/privacy` + `PATCH`
- [ ] `GET /api/v1/settings/theme` + `PATCH`

#### Week 3, Days 6-7: Session & Logout
- [ ] `GET /api/v1/sessions`
- [ ] `DELETE /api/v1/sessions/{session_id}`
- [ ] `POST /api/v1/settings/logout`
- [ ] `POST /api/v1/settings/logout-all`

### Phase 4D: Privacy & Security (1 week)

#### Week 4, Days 1-3: Block/Mute/Restrict
- [ ] `POST /api/v1/users/{user_id}/block` + `DELETE`
- [ ] `GET /api/v1/users/blocked`
- [ ] `POST /api/v1/users/{user_id}/mute` + `DELETE`
- [ ] `POST /api/v1/users/{user_id}/restrict` + `DELETE`
- [ ] Create blocked users UI page
- [ ] Create muted users UI page

#### Week 4, Days 4-5: 2FA Implementation
- [ ] `POST /api/v1/auth/2fa/setup` - Generate secret + QR
- [ ] `POST /api/v1/auth/2fa/verify` - Verify setup code
- [ ] `POST /api/v1/auth/2fa/disable` - Disable 2FA
- [ ] `POST /api/v1/auth/2fa/backup-codes` - Generate backup codes
- [ ] Create 2FA setup modal UI

#### Week 4, Days 6-7: Report & Activity
- [ ] `POST /api/v1/users/{user_id}/report`
- [ ] `GET /api/v1/activity` - Activity log
- [ ] `GET /api/v1/login-history` - Login history
- [ ] Create activity history UI page

### Phase 4E: Integration & Testing (1 week)

#### Week 5, Days 1-3: Full Integration
- [ ] Wire all frontend forms to backend APIs
- [ ] Test complete user flows (edit profile, change password, block user, etc.)
- [ ] Verify RLS policies work correctly
- [ ] Test permission scenarios (own user vs other user)

#### Week 5, Days 4-5: Mobile Responsiveness
- [ ] Test all pages on mobile (380px, 480px, 600px)
- [ ] Adjust modal sizes for small screens
- [ ] Fix any layout issues

#### Week 5, Days 6-7: QA & Polish
- [ ] Bug fixes and edge cases
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Final testing and deployment

---

## PART 5: UI/UX SPECIFICATIONS

### 5.1 Design System Application

#### Colors
- **Primary Accent:** `#00d4ff` (Cyan) - Active states, links
- **Secondary Accent:** `#00ff9d` (Green) - Success, verification
- **Error:** `#ff3060` (Red/Pink) - Errors, warnings
- **Background Base:** `#030508` - Page background
- **Card Background:** `#0d1420` - Cards, modals
- **Input Background:** `#0a111a` - Form inputs
- **Text Primary:** `#e8f4ff` - Main text
- **Text Secondary:** `#7a9bb5` - Muted text
- **Border:** `rgba(0,212,255,0.12)` - Element borders

#### Typography
- **Headings:** Rajdhani (700 weight)
- **Body:** Inter (400 weight)
- **Monospace:** Share Tech Mono (400 weight, for usernames/codes)

#### Spacing
- Gap: 8px, 12px, 16px, 24px, 32px
- Padding: 16px (cards), 24px (pages)
- Margin: 8px, 16px, 24px

#### Radius
- Buttons: 8px
- Cards: 14px
- Large components: 22px

#### Animations
- Transitions: 0.25s cubic-bezier(0.4, 0, 0.2, 1)
- Page entry: fadeUp 0.4s
- Hover effects: 0.2s scale/color change

### 5.2 Component Library

#### Profile Header Component
```html
<profile-header>
  <avatar size="lg" glow="cyan" src="...">
  <name>Display Name</name>
  <username>@username</username>
  <bio>User bio text...</bio>
  <actions>
    <button if="is_own">Edit</button>
    <button if="is_other">Follow</button>
  </actions>
  <stats>
    <stat label="Posts">248</stat>
    <stat label="Followers">4.2K</stat>
    <stat label="Following">312</stat>
    <stat label="OMNI">9.3</stat>
  </stats>
</profile-header>
```

#### Settings List Component
```html
<settings-section title="Account">
  <setting-item label="Email" value="user@example.com">
    <button>Change</button>
  </setting-item>
  <setting-item label="Username" value="@username">
    <button>Change</button>
  </setting-item>
  <setting-toggle label="Private Account" checked="false" />
  <setting-toggle label="Hide from Search" checked="true" />
</settings-section>
```

#### Modal Dialog Component
```html
<modal title="Edit Profile">
  <form>
    <input-field label="Display Name" placeholder="..." />
    <textarea label="Bio" maxlength="160" />
    <file-upload label="Profile Picture" />
    <form-actions>
      <button primary>Save</button>
      <button ghost>Cancel</button>
    </form-actions>
  </form>
</modal>
```

### 5.3 Mobile-First Responsive Design

**Mobile (320px - 380px):**
- Single column layout
- Modals full-screen with bottom sheet style
- Smaller avatars (64px instead of 88px)
- Simplified settings list (no descriptions)
- Smaller font sizes (14px body instead of 16px)

**Small Tablet (381px - 480px):**
- Avatar 76px
- Settings can show 2 columns
- Modals max-width 90%
- Normal font sizes

**Tablet (481px - 768px):**
- Avatar 88px
- Settings 2-3 columns
- Modals max-width 600px
- Larger spacing

**Desktop (769px+):**
- Avatar 88px
- Settings 3 columns
- Modals max-width 700px
- Full spacing

### 5.4 Animation Guidelines

**Page Transitions:**
- Exit: Fade out (220ms)
- Enter: Fade up (400ms)

**Modal Appearance:**
- Backdrop: Fade in (150ms)
- Modal: Slide up from bottom (300ms)

**Button Interactions:**
- Hover: Slight scale (1.02) + glow increase
- Click: Ripple effect (550ms)
- Active: Glow persists

**Loading States:**
- Skeleton loaders (shimmer effect)
- Spinner (rotate animation)
- Progress bars (width animation)

---

## PART 6: SECURITY CONSIDERATIONS

### 6.1 RLS Policies

All tables must have RLS enabled with policies:

**users Table:**
- SELECT: Public profiles visible, private profiles only to followers
- UPDATE: Only own profile
- DELETE: Only own profile (soft delete)

**user_sessions Table:**
- SELECT: Only own sessions
- DELETE: Only own sessions

**blocked_users Table:**
- SELECT: Only own blocks (not visible to blocked person)
- INSERT/DELETE: Only own blocks

**notification_settings, privacy_settings, security_settings, theme_settings:**
- SELECT/UPDATE/DELETE: Only own settings (user_id = auth.uid())

### 6.2 Data Protection

- Passwords: Hash with bcrypt (10+ rounds)
- 2FA Secrets: Encrypt with AES-256
- Login attempts: Rate limit (5 attempts / 15 minutes)
- Session tokens: Random UUID, short-lived (7 days)
- Email changes: Verify with OTP before confirming

### 6.3 Privacy by Design

- No activity tracking without consent
- No IP logging except for security events
- Delete all data on account deletion
- Allow data export (GDPR compliance)
- Audit trail for sensitive actions

---

## PART 7: IMPLEMENTATION CHECKLIST

### Phase 4A: Database
- [ ] All 13 tables created
- [ ] All RLS policies configured
- [ ] All indexes created
- [ ] Foreign key constraints working
- [ ] Test data seeded

### Phase 4B: Profile Frontend
- [ ] Profile view page (other users)
- [ ] My profile page (own user)
- [ ] Edit profile modal
- [ ] Profile tabs working
- [ ] Image uploads working
- [ ] Mobile responsive

### Phase 4C: Settings Frontend
- [ ] Settings page structure
- [ ] Account settings section
- [ ] Notifications section
- [ ] Privacy settings section
- [ ] Security settings section
- [ ] Display/theme section
- [ ] Modal dialogs for all sections

### Phase 4D: Profile APIs
- [ ] GET /users/{id}
- [ ] GET /users/me
- [ ] PATCH /users/me
- [ ] GET /users/{id}/followers
- [ ] GET /users/{id}/following
- [ ] GET /users/{id}/posts
- [ ] GET /users/me/saved
- [ ] GET /users/me/likes

### Phase 4E: Settings APIs
- [ ] Account change endpoints
- [ ] Notification settings
- [ ] Privacy settings
- [ ] Theme settings
- [ ] Logout endpoints

### Phase 4F: Privacy/Security APIs
- [ ] Block/unblock endpoints
- [ ] Mute/unmute endpoints
- [ ] Restrict/unrestrict endpoints
- [ ] 2FA setup/verify
- [ ] Session management
- [ ] Activity logging

### Phase 4G: Testing
- [ ] All APIs tested
- [ ] RLS policies verified
- [ ] Mobile responsive verified
- [ ] Error handling tested
- [ ] Edge cases covered

---

## PART 8: DATABASE MIGRATION SQL

See `/PROFILE_SETTINGS_MIGRATIONS.sql` for complete migration scripts.

Key points:
- Create extensions: `uuid-ossp`, `pgcrypto`
- Enable RLS on all user-data tables
- Add audit trigger for `updated_at` timestamps
- Create indexes for performance
- Add constraints for data integrity

---

## PART 9: DEPENDENCIES & LIBRARIES

### Python Packages (Already Available)
- `fastapi` - Web framework
- `sqlalchemy` - ORM
- `asyncpg` - PostgreSQL async driver
- `passlib` - Password hashing
- `python-jose` - JWT tokens

### Python Packages (To Add)
- `pyotp` - TOTP for 2FA (already listed in roadmap)
- `qrcode[pil]` - QR code generation
- `python-multipart` - File uploads
- `emails` - Email verification (optional, use SendGrid API instead)
- `requests` - HTTP for external services

### Frontend
- No new dependencies (vanilla JS only)

---

## SUMMARY

**Profile & Settings System Specifications:**

| Aspect | Count | Status |
|--------|-------|--------|
| **Database Tables** | 13 | Designed |
| **API Endpoints** | 40+ | Designed |
| **Frontend Pages** | 7 | Wireframed |
| **Modal Dialogs** | 5 | Wireframed |
| **CSS Components** | 15 | Ready (existing) |
| **Implementation Time** | 5 weeks | Estimated |
| **Testing Time** | 1 week | Estimated |
| **Total Duration** | 6 weeks | To completion |

**Ready for implementation. Complete architecture documented. All wireframes provided. Database schema finalized. API contracts defined.**

Next step: Proceed to Phase 4A implementation.
