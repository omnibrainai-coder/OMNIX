"""
OMNIX - Private Social Network Backend
Production-ready FastAPI application with Supabase integration.
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator
import os
import httpx
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Optional
from datetime import datetime, timezone
import json
import re

app = FastAPI(
    title="OMNIX",
    description="Private Social Network API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENABLE_DOCS", "false").lower() == "true" else None,
    redoc_url=None
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:80",
        "http://localhost",
        os.getenv("FRONTEND_URL", "")
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

FLAG_KEYWORDS = {
    "spam", "scam", "phishing", "fraud", "hate", "violence", "abuse", "harassment",
    "explicit", "sexual", "self-harm", "weapon", "bomb", "terror"
}
ACTION_KEYWORDS = {
    "spam", "scam", "abuse", "harass", "impersonation", "fraud"
}


def get_supabase_headers(use_service_key: bool = False) -> dict:
    """Return headers for Supabase API calls."""
    key = SUPABASE_SERVICE_KEY if use_service_key else SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


async def supabase_auth_request(endpoint: str, payload: dict, method: str = "POST") -> dict:
    """Make authenticated request to Supabase Auth API."""
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="Supabase configuration missing")

    url = f"{SUPABASE_URL}/auth/v1/{endpoint}"
    headers = get_supabase_headers()

    async with httpx.AsyncClient(timeout=30.0) as client:
        if method == "POST":
            response = await client.post(url, json=payload, headers=headers)
        else:
            response = await client.get(url, headers=headers)

        if response.status_code >= 400:
            try:
                error_data = response.json()
                detail = error_data.get("msg") or error_data.get("error_description") or error_data.get("message") or "Authentication failed"
            except Exception:
                detail = response.text or "Authentication failed"
            raise HTTPException(status_code=response.status_code, detail=detail)

        return response.json()


async def supabase_db_request(method: str, table: str, payload: dict = None, query: str = "") -> dict:
    """Make request to Supabase Database REST API."""
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="Supabase configuration missing")

    url = f"{SUPABASE_URL}/rest/v1/{table}{query}"
    headers = get_supabase_headers()
    headers["Prefer"] = "return=representation"

    async with httpx.AsyncClient(timeout=30.0) as client:
        if method == "POST":
            response = await client.post(url, json=payload, headers=headers)
        elif method == "GET":
            response = await client.get(url, headers=headers)
        elif method == "PATCH":
            response = await client.patch(url, json=payload, headers=headers)
        elif method == "DELETE":
            response = await client.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")

        if response.status_code >= 400:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        return response.json()


def _parse_datetime(value: Optional[str]) -> Optional[datetime]:
    """Parse an ISO timestamp and return a timezone-aware datetime."""
    if not value:
        return None

    try:
        normalized = str(value).replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed
    except ValueError:
        return None


def auto_flag_content(content: str, action: Optional[str] = None) -> dict:
    """Evaluate text and user action to decide whether content should be flagged."""
    normalized_text = (content or "").lower()
    normalized_action = (action or "").lower()
    reasons = []

    matched_keywords = [keyword for keyword in FLAG_KEYWORDS if keyword in normalized_text]
    if matched_keywords:
        reasons.append("keyword")

    action_matches = [keyword for keyword in ACTION_KEYWORDS if keyword in normalized_action]
    if action_matches:
        reasons.append("action")

    flagged = bool(reasons)
    if flagged and ("spam" in matched_keywords or "spam" in action_matches or "scam" in matched_keywords or "scam" in action_matches):
        severity = "high"
    elif flagged:
        severity = "medium"
    else:
        severity = "none"

    return {
        "flagged": flagged,
        "reasons": reasons,
        "severity": severity,
    }


def rank_posts_for_feed(posts: list[dict]) -> list[dict]:
    """Rank posts by engagement and recency while filtering out likely flagged content."""
    ranked = []
    now = datetime.now(timezone.utc)

    for post in posts or []:
        if not isinstance(post, dict):
            continue

        moderation = auto_flag_content(post.get("content") or "", post.get("action") or "")
        if moderation["flagged"]:
            continue

        likes = int(post.get("likes") or 0)
        comments = int(post.get("comments") or 0)
        shares = int(post.get("shares") or 0)
        created_at = _parse_datetime(post.get("created_at"))

        if created_at is None:
            age_hours = 72
        else:
            age_hours = max(0.0, (now - created_at).total_seconds() / 3600)

        recency_boost = max(0.0, (48 - age_hours) / 48) * 5
        score = likes * 2 + comments * 4 + shares * 6 + recency_boost
        ranked.append({"post": post, "score": score})

    ranked.sort(key=lambda item: (-item["score"], item["post"].get("created_at") or ""))
    return [item["post"] for item in ranked]


def verify_admin_request(authorization: Optional[str], role: Optional[str] = None, x_role: Optional[str] = None) -> bool:
    """Validate that an admin-only request is coming from an authorized role."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    normalized_role = (role or x_role or "").lower()
    if normalized_role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    return True


def trigger_signup_notification_webhook(payload: dict) -> dict:
    """Prepare a lightweight webhook payload for phone notification dispatch."""
    username = (payload or {}).get("username") or "unknown"
    email = (payload or {}).get("email") or ""
    return {
        "status": "queued",
        "channel": "phone",
        "recipient": email or f"{username}@register",
        "message": f"Welcome {username}! Your OMNIX account is ready.",
        "metadata": {
            "source": "signup-webhook",
            "payload": json.dumps(payload, sort_keys=True),
        },
    }


# Request Models with Validation
class LoginRequest(BaseModel):
    identity: str
    password: str


class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    mobile: Optional[str] = ""

    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return v.lower()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class PostRequest(BaseModel):
    content: str
    image_url: Optional[str] = None


class ModerationRequest(BaseModel):
    content: str
    action: Optional[str] = None


# Page Routes
@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve login page or React app in production."""
    if os.path.exists("dist/index.html"):
        with open("dist/index.html", "r", encoding="utf-8") as f:
            return f.read()
    return FileResponse("templates/login.html")


@app.get("/home")
async def home():
    return FileResponse("templates/home.html")


@app.get("/search")
async def search():
    return FileResponse("templates/search.html")


@app.get("/create")
async def create():
    return FileResponse("templates/create.html")


@app.get("/chat")
async def chat():
    return FileResponse("templates/chat.html")


@app.get("/profile")
async def profile():
    return FileResponse("templates/profile.html")


@app.get("/signup")
async def signup():
    return FileResponse("templates/signup.html")


@app.get("/forgot-password")
async def forgot_password():
    return FileResponse("templates/forgot-password.html")


@app.get("/terms")
async def terms():
    return FileResponse("templates/terms.html")


@app.get("/privacy")
async def privacy():
    return FileResponse("templates/privacy.html")


# Authentication API Routes
@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def api_login(request: Request, req: LoginRequest):
    """Authenticate user via Supabase Auth."""
    email = req.identity if "@" in req.identity else f"{req.identity}@shadow.omnix"

    result = await supabase_auth_request("token", {
        "grant_type": "password",
        "email": email,
        "password": req.password,
    })

    return {
        "success": True,
        "access_token": result.get("access_token", ""),
        "refresh_token": result.get("refresh_token", ""),
        "expires_in": result.get("expires_in", 3600),
        "user": {
            "id": result.get("user", {}).get("id", ""),
            "email": result.get("user", {}).get("email", email),
            "username": req.identity,
        },
    }


@app.post("/api/auth/signup")
@limiter.limit("3/minute")
async def api_signup(request: Request, req: SignupRequest):
    """Register new user via Supabase Auth and prepare a notification webhook."""
    result = await supabase_auth_request("signup", {
        "email": req.email,
        "password": req.password,
        "data": {
            "username": req.username,
            "full_name": f"{req.first_name} {req.last_name}".strip(),
            "mobile": req.mobile or "",
        },
    })

    webhook_payload = trigger_signup_notification_webhook({
        "username": req.username,
        "email": req.email,
        "mobile": req.mobile or "",
    })

    return {
        "success": True,
        "user_id": result.get("id", ""),
        "message": "Account created successfully. Please check your email for verification.",
        "notification_webhook": webhook_payload,
    }


@app.post("/api/auth/forgot-password")
@limiter.limit("2/minute")
async def api_forgot_password(request: Request, req: ForgotPasswordRequest):
    """Send password reset email."""
    await supabase_auth_request("recover", {"email": req.email})
    return {"success": True, "message": "Password reset email sent successfully."}


@app.get("/api/auth/me")
async def api_me(authorization: Optional[str] = None):
    """Get current authenticated user info."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]

    user_info = await supabase_auth_request("user", {}, method="GET")

    return {
        "success": True,
        "user": user_info
    }


@app.post("/api/auth/refresh")
async def api_refresh_token(refresh_token: str):
    """Refresh access token."""
    result = await supabase_auth_request("token", {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    })

    return {
        "success": True,
        "access_token": result.get("access_token", ""),
        "refresh_token": result.get("refresh_token", ""),
        "expires_in": result.get("expires_in", 3600),
    }


@app.post("/api/auth/logout")
async def api_logout(authorization: Optional[str] = None):
    """Logout user and invalidate session."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        await supabase_auth_request("logout", {}, method="POST")

    return {"success": True, "message": "Logged out successfully"}


# Google OAuth placeholder (ready for implementation)
@app.get("/api/auth/google")
async def google_oauth_redirect():
    """Initiate Google OAuth flow."""
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="OAuth not configured")

    redirect_url = f"{SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to={os.getenv('FRONTEND_URL', 'http://localhost')}/auth/callback"
    return {"redirect_url": redirect_url}


# Posts API Routes
@app.post("/api/posts")
async def create_post(req: PostRequest, authorization: Optional[str] = None):
    """Create a new post."""
    moderation = auto_flag_content(req.content)
    data = {
        "content": req.content,
        "image_url": req.image_url,
    }
    result = await supabase_db_request("POST", "posts", data)
    return {
        "success": True,
        "message": "Post created successfully",
        "data": result,
        "moderation": moderation,
    }


@app.get("/api/posts/feed")
async def get_feed(limit: int = 20, offset: int = 0):
    """Get posts feed ranked by engagement and recency."""
    requested_limit = max(1, min(int(limit), 100))
    requested_offset = max(0, int(offset))
    fetch_limit = min(requested_offset + requested_limit * 4 + 20, 200)

    query = f"?select=id,content,likes,comments,shares,created_at&order=created_at.desc&limit={fetch_limit}&offset={requested_offset}"
    result = await supabase_db_request("GET", "posts", query=query)
    ranked_posts = rank_posts_for_feed(result)
    paged_posts = ranked_posts[requested_offset:requested_offset + requested_limit]

    return {"success": True, "posts": paged_posts}


@app.post("/api/admin/moderation/flag")
async def flag_content_for_review(request: Request, req: ModerationRequest):
    """Process reported text or actions for automatic moderation review."""
    verify_admin_request(request.headers.get("authorization"), x_role=request.headers.get("x-role"))
    moderation = auto_flag_content(req.content, action=req.action)
    return {
        "success": True,
        "flagged": moderation["flagged"],
        "severity": moderation["severity"],
        "reasons": moderation["reasons"],
    }


@app.get("/api/posts/{post_id}")
async def get_post(post_id: str):
    """Get single post by ID."""
    query = f"?select=*&id=eq.{post_id}"
    result = await supabase_db_request("GET", "posts", query=query)
    if not result:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True, "post": result[0]}


@app.delete("/api/posts/{post_id}")
async def delete_post(post_id: str):
    """Delete a post."""
    query = f"?id=eq.{post_id}"
    await supabase_db_request("DELETE", "posts", query=query)
    return {"success": True, "message": "Post deleted"}


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check for monitoring."""
    return {
        "status": "healthy",
        "service": "omnix-api",
        "version": "1.0.0"
    }


# Mount React production build
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

    @app.get("/{path:path}", response_class=HTMLResponse)
    async def serve_spa(path: str):
        """Serve React SPA for all unmatched routes."""
        # Skip API and static routes
        if path.startswith("api/") or path.startswith("static/") or path.endswith((".css", ".js", ".png", ".jpg", ".svg", ".ico")):
            raise HTTPException(status_code=404)

        # Serve index.html for SPA routing
        index_path = "dist/index.html"
        if os.path.exists(index_path):
            with open(index_path, "r", encoding="utf-8") as f:
                return f.read()
        raise HTTPException(status_code=404)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
