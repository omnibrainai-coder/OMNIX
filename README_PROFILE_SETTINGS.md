# OMNIX Profile & Settings System - Design Documentation

## Overview

Complete architectural design for the OMNIX Profile, Settings, and Privacy management system. Three comprehensive documents with 6,000+ lines of specifications, ready for implementation.

## Documents Included

### 1. **PROFILE_SETTINGS_ARCHITECTURE.md** ⭐ START HERE
The primary design document containing:
- **Database Schema** (15 new tables, fully detailed)
- **API Endpoints** (40+ routes with request/response specs)
- **Frontend Wireframes** (7 pages, 5 modals with ASCII mockups)
- **UI/UX Specifications** (colors, typography, spacing, animations)
- **Security & RLS Policies** (comprehensive data protection)
- **Implementation Roadmap** (5-week phase breakdown)
- **Mobile-First Design** (responsive breakpoints)
- **Feature Specifications** (all features detailed)

**Use this to:** Understand the complete system architecture before implementation.

### 2. **PROFILE_SETTINGS_MIGRATIONS.sql** ⚙️ DATABASE
Production-ready SQL migrations containing:
- 15 new table definitions
- Users table modifications (13 new columns)
- RLS policies for security
- Indexes for performance
- Triggers for timestamps
- Validation constraints
- Ready to paste into Supabase SQL Editor

**Use this to:** Apply database schema to your Supabase instance.

### 3. **PROFILE_SETTINGS_IMPLEMENTATION_GUIDE.md** 🛠️ IMPLEMENTATION
Step-by-step implementation walkthrough:
- Database setup instructions
- FastAPI route structure
- Service layer templates
- Frontend page templates
- Testing checklist
- Deployment instructions

**Use this to:** Build the system phase by phase.

## Quick Start

### Phase 1: Database (Day 1)
1. Open Supabase SQL Editor
2. Copy content from `PROFILE_SETTINGS_MIGRATIONS.sql`
3. Execute the migration
4. Verify tables created: `SELECT table_name FROM information_schema.tables...`

### Phase 2: APIs (Days 2-4)
1. Create `/backend/routes/profile.py`
2. Create `/backend/routes/settings.py`
3. Create `/backend/routes/privacy.py`
4. Implement endpoints following templates in guide
5. Test with sample data

### Phase 3: Frontend (Days 5-7)
1. Create `/templates/profile-public.html`
2. Create `/templates/settings.html`
3. Wire frontend forms to APIs
4. Test responsive design

## Architecture Overview

```
OMNIX Profile & Settings System
│
├── Database Layer (15 Tables)
│   ├── User Core (3 tables)
│   ├── Privacy & Safety (5 tables)
│   ├── Settings & Preferences (6 tables)
│   └── Indexes & RLS Policies
│
├── API Layer (40+ Endpoints)
│   ├── Profile Management (8)
│   ├── Account Settings (7)
│   ├── Preferences (3)
│   ├── Privacy & Security (15+)
│   └── Follow Requests (3)
│
├── Frontend Layer (7 Pages)
│   ├── Profile View/Edit
│   ├── Settings Hub
│   ├── Privacy Settings
│   ├── Security Settings
│   └── User Management Pages
│
└── Security Layer
    ├── RLS Policies
    ├── Password Hashing
    ├── 2FA Support
    ├── Session Management
    └── Audit Logging
```

## Database Schema Summary

### Core Tables (Added/Modified)
- `users` (modified: +13 columns for profile fields)
- `user_profiles` - Extended profile data
- `user_activity_log` - Activity tracking
- `user_sessions` - Session management

### Privacy & Safety
- `blocked_users` - Block list
- `muted_users` - Mute list
- `restricted_users` - Restrictions
- `reported_users` - Report history
- `follow_requests` - Private account requests

### User Preferences
- `notification_settings` - Notification preferences
- `privacy_settings` - Privacy controls
- `security_settings` - Security options
- `theme_settings` - Display preferences
- `login_attempts` - Failed login tracking

## API Endpoints Summary

### Profile (8 endpoints)
```
GET    /api/v1/users/{user_id}              # Get public profile
GET    /api/v1/users/me                     # Get own profile
PATCH  /api/v1/users/me                     # Update profile
GET    /api/v1/users/{user_id}/followers    # Get followers
GET    /api/v1/users/{user_id}/following    # Get following
GET    /api/v1/users/{user_id}/posts        # Get user posts
GET    /api/v1/users/me/saved               # Get saved posts
POST   /api/v1/users/{user_id}/report       # Report user
```

### Settings (10 endpoints)
```
GET    /api/v1/settings/account
POST   /api/v1/settings/change-password
POST   /api/v1/settings/change-email
POST   /api/v1/settings/verify-email-change
POST   /api/v1/settings/change-phone
POST   /api/v1/settings/verify-phone-change
POST   /api/v1/settings/change-username
GET    /api/v1/settings/notifications + PATCH
GET    /api/v1/settings/privacy + PATCH
GET    /api/v1/settings/theme + PATCH
```

### Privacy & Security (15+ endpoints)
- Block/mute/restrict users
- 2FA setup and management
- Session management
- Activity logging
- Report moderation

## Key Features

### Profile Management
✓ Edit profile (name, bio, website, location)
✓ Upload photos (profile & cover)
✓ Display verification badge
✓ Statistics (posts, followers, following, streak)
✓ OMNI score display
✓ Profile tabs (Posts, Media, Saved, Likes)

### Account Settings
✓ Change email/phone/password/username
✓ Email verification
✓ Account recovery
✓ Logout management

### Privacy Controls
✓ Private account mode
✓ Hide from search
✓ Show/hide followers/following
✓ Activity status visibility
✓ Content permissions (tags, comments, messages)

### Security Features
✓ Two-factor authentication (TOTP)
✓ Backup codes
✓ Session management (all devices)
✓ Login alerts
✓ Activity log (90 days)
✓ Login history (30 days)

### User Interactions
✓ Block users
✓ Mute users
✓ Restrict users
✓ Report users
✓ Follow requests (private accounts)

### Display Preferences
✓ Theme (dark/light)
✓ Font size
✓ Compact mode
✓ High contrast
✓ Reduce motion

## Implementation Timeline

| Phase | Week | Tasks | Deliverable |
|-------|------|-------|------------|
| 4A | 1 | Database setup, core APIs | Database ready, 8 profile APIs |
| 4B | 2 | Frontend profile pages | Profile pages functional |
| 4C | 3 | Settings APIs | All settings endpoints |
| 4D | 4 | Privacy/security APIs | Privacy system complete |
| 4E | 5 | Integration & testing | Production-ready system |

**Total: 5 weeks**

## Security Features

### Row Level Security (RLS)
- All sensitive tables protected
- Users can only access their own data
- Public profiles visible with privacy checks
- Moderation data restricted to admins

### Authentication
- JWT tokens for API access
- Password hashing (bcrypt 10+ rounds)
- 2FA support (TOTP)
- Session tokens with expiration
- Rate limiting on auth endpoints

### Data Protection
- Encryption for sensitive fields
- Audit logging for sensitive actions
- Activity tracking with IP/user-agent
- Email/phone change verification
- Password reset verification

### Privacy
- Consent-based activity tracking
- Limited IP logging
- Data export support (GDPR)
- Account deletion (cascading)
- Clear data retention policies

## Design System Integration

### Colors (Cyberpunk Theme)
- Primary: `#00d4ff` (Cyan)
- Secondary: `#00ff9d` (Green/Teal)
- Base: `#030508` (Near-black)
- Card: `#0d1420` (Dark gray)
- Error: `#ff3060` (Pink)

### Typography
- Headings: Rajdhani
- Body: Inter
- Monospace: Share Tech Mono

### Responsive Design
- Mobile: 320px - 380px (single column, full modals)
- Tablet: 381px - 768px (2-3 columns)
- Desktop: 769px+ (full layout)

## Getting Started

1. **Read** `PROFILE_SETTINGS_ARCHITECTURE.md` for complete understanding
2. **Review** Database schema section (Part 1)
3. **Review** API endpoints (Part 2)
4. **Review** Frontend wireframes (Part 3)
5. **Apply** `PROFILE_SETTINGS_MIGRATIONS.sql` to Supabase
6. **Follow** `PROFILE_SETTINGS_IMPLEMENTATION_GUIDE.md` for step-by-step build

## Support

Each document is self-contained with:
- Complete specifications
- Copy-paste ready code
- Step-by-step instructions
- Implementation templates
- Testing checklists

## Next Steps

→ Open `PROFILE_SETTINGS_ARCHITECTURE.md` to begin implementation

---

**Status:** Design Complete ✅  
**Ready for:** Phase 4 Implementation  
**Est. Duration:** 5 weeks  
**Total APIs:** 40+  
**Total Tables:** 15 new  
**Code Ready:** No (architecture only)

Begin Phase 4A when ready!
