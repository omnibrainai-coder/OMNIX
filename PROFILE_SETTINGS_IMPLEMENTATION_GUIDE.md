# OMNIX Profile & Settings Implementation Guide

## Quick Start

This guide walks you through implementing the complete Profile & Settings System.

### Prerequisites
- FastAPI running on localhost:8000
- Supabase database connected
- SQLAlchemy ORM configured
- Authentication middleware implemented (or planned)

### Documents
- **PROFILE_SETTINGS_ARCHITECTURE.md** - Complete design (database schema, APIs, wireframes, implementation roadmap)
- **PROFILE_SETTINGS_MIGRATIONS.sql** - Database migration SQL (ready to apply to Supabase)
- This file - Step-by-step implementation guide

---

## Phase 1: Database Setup (Day 1)

### Step 1.1: Apply Migrations to Supabase

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire content from `PROFILE_SETTINGS_MIGRATIONS.sql`
4. Paste into new query
5. Execute

**What this does:**
- Creates 15 new tables
- Modifies users table (adds 13 columns)
- Sets up RLS policies
- Creates triggers for timestamps
- Creates indexes for performance
- Total: ~500 lines of SQL

### Step 1.2: Verify Migration Success

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check users table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Should show: display_name, bio, profile_pic_url, cover_pic_url, website_url, location, is_verified, is_private, is_blocked_from_search, two_fa_enabled, two_fa_secret, is_active, is_suspended, suspension_reason, omni_score, followers_count, following_count, posts_count, created_at, updated_at, deleted_at

-- Check all profile tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%profile%' OR table_name LIKE '%setting%' OR table_name LIKE '%session%' OR table_name LIKE '%block%'
ORDER BY table_name;

-- Should show: user_profiles, user_activity_log, user_sessions, blocked_users, muted_users, restricted_users, reported_users, notification_settings, privacy_settings, security_settings, theme_settings, follow_requests, login_attempts
```

### Step 1.3: Seed Test Data (Optional)

```sql
-- Insert test user (if no auth exists yet)
INSERT INTO users (email, username, mobile, password_hash, display_name, bio, is_verified)
VALUES (
  'test@example.com',
  'testuser',
  '+1234567890',
  'hashed_password_here',
  'Test User',
  'This is a test profile',
  false
);

-- Verify insert
SELECT id, email, username, display_name FROM users LIMIT 1;
```

---

## Phase 2: Backend API Setup (Days 2-4)

### Step 2.1: Create API Route Files

Create these files in `/backend/routes/`:

#### `/backend/routes/profile.py`
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List

router = APIRouter(prefix="/api/v1", tags=["profile"])

@router.get("/users/{user_id}")
async def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    """Get public profile of any user"""
    pass

@router.get("/users/me")
async def get_my_profile(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get authenticated user's full profile"""
    pass

@router.patch("/users/me")
async def update_my_profile(profile_data: dict, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update authenticated user's profile"""
    pass

@router.get("/users/{user_id}/followers")
async def get_followers(user_id: str, limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    """Get followers list"""
    pass

@router.get("/users/{user_id}/following")
async def get_following(user_id: str, limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    """Get following list"""
    pass

@router.get("/users/{user_id}/posts")
async def get_user_posts(user_id: str, tab: str = "posts", limit: int = 12, offset: int = 0, db: Session = Depends(get_db)):
    """Get user's posts (tab: posts, media, saved, likes)"""
    pass

@router.post("/users/{user_id}/report")
async def report_user(user_id: str, reason: str, description: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Report a user for abuse"""
    pass
```

#### `/backend/routes/settings.py`
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])

@router.get("/account")
async def get_account_settings(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get account settings"""
    pass

@router.post("/change-password")
async def change_password(current_password: str, new_password: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Change password"""
    pass

@router.get("/notifications")
async def get_notification_settings(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get notification preferences"""
    pass

@router.patch("/notifications")
async def update_notification_settings(settings: dict, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update notification preferences"""
    pass

@router.get("/privacy")
async def get_privacy_settings(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get privacy settings"""
    pass

@router.patch("/privacy")
async def update_privacy_settings(settings: dict, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update privacy settings"""
    pass

@router.get("/theme")
async def get_theme_settings(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get theme preferences"""
    pass

@router.patch("/theme")
async def update_theme_settings(settings: dict, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update theme preferences"""
    pass

@router.post("/logout")
async def logout(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Logout user"""
    pass

@router.post("/logout-all")
async def logout_all_sessions(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Logout all active sessions"""
    pass
```

#### `/backend/routes/privacy.py`
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/v1", tags=["privacy"])

@router.post("/users/{user_id}/block")
async def block_user(user_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Block a user"""
    pass

@router.delete("/users/{user_id}/unblock")
async def unblock_user(user_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Unblock a user"""
    pass

@router.get("/users/blocked")
async def get_blocked_users(limit: int = 20, offset: int = 0, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get list of blocked users"""
    pass

@router.post("/users/{user_id}/mute")
async def mute_user(user_id: str, mute_type: str = "all", current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mute a user"""
    pass

@router.delete("/users/{user_id}/unmute")
async def unmute_user(user_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Unmute a user"""
    pass

@router.get("/users/muted")
async def get_muted_users(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get list of muted users"""
    pass

@router.post("/users/{user_id}/restrict")
async def restrict_user(user_id: str, restrictions: dict, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Restrict a user's interactions"""
    pass

@router.delete("/users/{user_id}/unrestrict")
async def unrestrict_user(user_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove restrictions on a user"""
    pass

@router.get("/sessions")
async def get_active_sessions(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get list of active sessions"""
    pass

@router.delete("/sessions/{session_id}")
async def revoke_session(session_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Revoke a specific session"""
    pass

@router.get("/activity")
async def get_activity_log(limit: int = 20, offset: int = 0, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's activity log"""
    pass

@router.get("/login-history")
async def get_login_history(limit: int = 20, offset: int = 0, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get login history"""
    pass
```

### Step 2.2: Create Service Layer

Create `/backend/services/profile_service.py`:

```python
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models import User, UserProfile, BlockedUsers, MutedUsers
from typing import Optional, List

class ProfileService:
    @staticmethod
    def get_user_profile(user_id: str, db: Session, current_user_id: Optional[str] = None):
        """Get user profile, respecting privacy settings"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Check if blocked
        if current_user_id:
            is_blocked = db.query(BlockedUsers).filter(
                or_(
                    and_(BlockedUsers.blocker_id == user_id, BlockedUsers.blocked_id == current_user_id),
                    and_(BlockedUsers.blocker_id == current_user_id, BlockedUsers.blocked_id == user_id)
                )
            ).first()
            if is_blocked:
                return None
        
        # Return limited profile if private and not follower
        return {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "bio": user.bio,
            "profile_pic_url": user.profile_pic_url,
            "cover_pic_url": user.cover_pic_url,
            "website_url": user.website_url,
            "location": user.location,
            "is_verified": user.is_verified,
            "omni_score": user.omni_score,
            "followers_count": user.followers_count,
            "following_count": user.following_count,
            "posts_count": user.posts_count,
        }
    
    @staticmethod
    def update_user_profile(user_id: str, profile_data: dict, db: Session):
        """Update user profile"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Update allowed fields
        allowed_fields = ['display_name', 'bio', 'website_url', 'location', 'profile_pic_url', 'cover_pic_url']
        for field in allowed_fields:
            if field in profile_data:
                setattr(user, field, profile_data[field])
        
        db.commit()
        db.refresh(user)
        return user

class PrivacyService:
    @staticmethod
    def block_user(blocker_id: str, blocked_id: str, db: Session):
        """Block a user"""
        if blocker_id == blocked_id:
            return {"error": "Cannot block yourself"}
        
        existing = db.query(BlockedUsers).filter(
            and_(BlockedUsers.blocker_id == blocker_id, BlockedUsers.blocked_id == blocked_id)
        ).first()
        if existing:
            return {"already_blocked": True}
        
        block = BlockedUsers(blocker_id=blocker_id, blocked_id=blocked_id)
        db.add(block)
        db.commit()
        return {"blocked": True}
    
    @staticmethod
    def get_blocked_users(user_id: str, db: Session, limit: int = 20, offset: int = 0):
        """Get list of blocked users"""
        blocked = db.query(BlockedUsers).filter(
            BlockedUsers.blocker_id == user_id
        ).offset(offset).limit(limit).all()
        
        return [db.query(User).filter(User.id == b.blocked_id).first() for b in blocked]
```

### Step 2.3: Register Routes in main.py

```python
from backend.routes import profile, settings, privacy

# Add to FastAPI app
app.include_router(profile.router)
app.include_router(settings.router)
app.include_router(privacy.router)
```

---

## Phase 3: Frontend Pages (Days 5-7)

### Step 3.1: Create Profile Page

Create `/templates/profile-public.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile - OMNIX</title>
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
  <header class="header">
    <div class="header-content">
      <h1 class="brand">// @{username}</h1>
      <button class="btn btn-ghost" onclick="openOptions()">⋯</button>
    </div>
  </header>

  <main class="container">
    <!-- Profile Banner -->
    <div class="profile-banner" id="profileBanner">
      <img src="#" alt="Cover" id="coverImage" class="profile-cover">
      <button class="btn btn-sm" id="editBannerBtn" style="display:none;">EDIT BANNER</button>
    </div>

    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <img src="#" alt="Avatar" class="avatar avatar-xl" id="profileAvatar">
        <button class="btn btn-sm" id="editNodeBtn" style="display:none;">EDIT NODE</button>
      </div>

      <div class="profile-info">
        <h2 id="displayName">Display Name</h2>
        <p class="text-secondary" id="userhandle">@username · NODE-42</p>
        <p id="bio">User bio goes here...</p>
        <div class="profile-meta">
          <a href="#" id="website">🔗 website.com</a>
          <span id="location">📍 Location</span>
        </div>
      </div>
    </div>

    <!-- OMNI Score Card -->
    <div class="card omni-score-card">
      <div class="omni-header">
        <span>OMNI SCORE</span>
        <span id="omniScore">0.0</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" id="omniBar" style="width: 0%"></div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat">
        <div class="stat-value" id="postsCount">0</div>
        <div class="stat-label">Posts</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="followersCount">0</div>
        <div class="stat-label">Followers</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="followingCount">0</div>
        <div class="stat-label">Following</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="streakCount">0</div>
        <div class="stat-label">Streak</div>
      </div>
    </div>

    <!-- Profile Tabs -->
    <div class="profile-tabs">
      <button class="tab active" onclick="setTab('posts')">POSTS</button>
      <button class="tab" onclick="setTab('media')">MEDIA</button>
      <button class="tab" onclick="setTab('saved')" id="savedTab" style="display:none;">SAVED</button>
      <button class="tab" onclick="setTab('likes')" id="likesTab" style="display:none;">LIKES</button>
    </div>

    <!-- Content Grid -->
    <div class="content-grid" id="contentGrid">
      <!-- Posts will be loaded here -->
    </div>
  </main>

  <!-- Bottom Navigation -->
  <nav class="bottom-nav">
    <a href="/" class="nav-item">Home</a>
    <a href="/search" class="nav-item">Search</a>
    <a href="/create" class="nav-item">Create</a>
    <a href="/chat" class="nav-item">Chat</a>
    <a href="/profile" class="nav-item active">Profile</a>
  </nav>

  <script src="/static/app.js"></script>
  <script>
    // Load profile data from API
    async function loadProfile() {
      const userId = new URLSearchParams(window.location.search).get('id') || 'me';
      const response = await fetch(`/api/v1/users/${userId}`);
      const user = await response.json();
      
      document.getElementById('displayName').textContent = user.display_name;
      document.getElementById('userhandle').textContent = `@${user.username}`;
      document.getElementById('bio').textContent = user.bio;
      document.getElementById('omniScore').textContent = user.omni_score;
      document.getElementById('followersCount').textContent = formatCount(user.followers_count);
      document.getElementById('followingCount').textContent = formatCount(user.following_count);
      document.getElementById('postsCount').textContent = formatCount(user.posts_count);
      
      document.getElementById('profileAvatar').src = user.profile_pic_url;
      document.getElementById('coverImage').src = user.cover_pic_url;
      
      // Show edit buttons only if own profile
      if (userId === 'me') {
        document.getElementById('editNodeBtn').style.display = 'block';
        document.getElementById('editBannerBtn').style.display = 'block';
        document.getElementById('savedTab').style.display = 'block';
        document.getElementById('likesTab').style.display = 'block';
      }
    }

    function formatCount(count) {
      if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
      return count;
    }

    function setTab(tab) {
      // Load posts by tab
      console.log('Loading tab:', tab);
    }

    window.addEventListener('DOMContentLoaded', loadProfile);
  </script>
</body>
</html>
```

### Step 3.2: Create Settings Page

Create `/templates/settings.html`:

(See architecture document for full HTML - ~400 lines)

---

## Phase 4: Testing & Deployment

### Step 4.1: Unit Tests

Create `/tests/test_profile_api.py`:

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_user_profile():
    response = client.get("/api/v1/users/test-user-id")
    assert response.status_code == 200

def test_update_profile_unauthorized():
    response = client.patch("/api/v1/users/me", json={"display_name": "New Name"})
    assert response.status_code == 401

def test_block_user():
    # Requires authentication
    headers = {"Authorization": "Bearer fake-token"}
    response = client.post("/api/v1/users/other-user-id/block", headers=headers)
    assert response.status_code in [200, 401]
```

### Step 4.2: E2E Testing

Manual testing checklist:
- [ ] View own profile
- [ ] View other user's profile
- [ ] Edit own profile
- [ ] Change password
- [ ] Block/unblock user
- [ ] Enable 2FA
- [ ] Change settings
- [ ] Test RLS policies

### Step 4.3: Deployment

```bash
# Build Docker image
docker build -t omnix-profile .

# Push to registry
docker push registry/omnix-profile:latest

# Deploy to production
# (Using Railway, Render, or preferred platform)
```

---

## Implementation Checklist

- [ ] **Database Migration** - All 15 tables created
- [ ] **RLS Policies** - All security policies applied
- [ ] **API Routes** - All 40+ endpoints created
- [ ] **Service Layer** - Business logic implemented
- [ ] **Frontend Pages** - Profile & settings pages built
- [ ] **Frontend Components** - Modals, dialogs, forms created
- [ ] **Mobile Responsive** - All pages tested on mobile
- [ ] **Authentication** - Auth middleware working
- [ ] **File Uploads** - Profile/cover pic upload working
- [ ] **Error Handling** - All edge cases covered
- [ ] **Performance** - Indexes optimized
- [ ] **Security** - RLS tested, no data leaks
- [ ] **Testing** - Unit tests written
- [ ] **Documentation** - Code documented
- [ ] **Deployment** - Deployed to production

---

## Next Steps

1. Apply database migrations (Step 1.1)
2. Create API route files (Step 2.1)
3. Implement service layer (Step 2.2)
4. Register routes in main.py (Step 2.3)
5. Create frontend pages (Step 3.1)
6. Test all endpoints (Step 4.1)
7. Deploy (Step 4.3)

**Estimated Time:** 5 weeks

**Total API Endpoints:** 40+  
**Total Database Tables:** 15 new  
**Total Frontend Pages:** 7  
**Total Components:** 15+

Ready to begin implementation!
