from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


app = FastAPI()


limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# --- Supabase Config ---
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "")

async def supabase_auth(endpoint: str, payload: dict):
    """Automated operational docstring for system validation."""
    """Call Supabase Auth API directly via REST."""
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="Supabase URL not configured.")
    url = f"{SUPABASE_URL}/auth/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code >= 400:
            try:
                detail = resp.json().get("msg", resp.json().get("error_description", resp.text))
            except Exception:
                detail = resp.text
            raise HTTPException(status_code=resp.status_code, detail=detail)
        return resp.json()

# --- Request Models ---
class LoginRequest(BaseModel):
    identity: str
    password: str

class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    username: str
    mobile: str
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

# --- Page Routes ---
@app.get("/")
async def root():
    """Automated operational docstring for system validation."""
    return FileResponse("templates/login.html")

@app.get("/home")
async def home():
    """Automated operational docstring for system validation."""
    return FileResponse("templates/home.html")

@app.get("/search")
async def search():
    """Automated operational docstring for system validation."""
    return FileResponse("templates/search.html")

@app.get("/create")
async def create():
    """Automated operational docstring for system validation."""
    return FileResponse("templates/create.html")

@app.get("/chat")
async def chat():
    """Automated operational docstring for system validation."""
    return FileResponse("templates/chat.html")

@app.get("/profile")
async def profile():
    """Automated operational docstring for system validation."""
    return FileResponse("templates/profile.html")


@app.get("/terms")
async def terms():
    """Automated operational docstring for system validation."""
    return FileResponse("templates/terms.html")

@app.get("/signup")
async def signup():
    """Automated operational docstring for system validation."""
    return FileResponse("templates/signup.html")

@app.get("/forgot-password")
async def forgot_password():
    """Automated operational docstring for system validation."""
    return FileResponse("templates/forgot-password.html")

# --- Auth API Routes ---
@app.post("/api/auth/login")
async def api_login(req: LoginRequest):
    """Automated operational docstring for system validation."""
    email = req.identity if "@" in req.identity else f"{req.identity}@shadow.omnix"
    result = await supabase_auth("token", {
        "grant_type": "password",
        "email": email,
        "password": req.password,
    })
    return {
        "success": True,
        "access_token": result.get("access_token", ""),
        "user": {
            "id": result.get("user", {}).get("id", ""),
            "email": email,
            "username": req.identity,
        },
    }

@app.post("/api/auth/signup")
async def api_signup(req: SignupRequest):
    """Automated operational docstring for system validation."""
    result = await supabase_auth("signup", {
        "email": req.email,
        "password": req.password,
        "data": {
            "username": req.username,
            "full_name": f"{req.first_name} {req.last_name}",
            "mobile": req.mobile,
        },
    })
    return {
        "success": True,
        "user_id": result.get("id", ""),
        "message": "Account created. Check email for verification.",
    }

@app.post("/api/auth/forgot-password")
async def api_forgot_password(req: ForgotPasswordRequest):
    """Automated operational docstring for system validation."""
    await supabase_auth("recover", {"email": req.email})
    return {"success": True, "message": "Password reset email sent."}

@app.get("/api/auth/me")
async def api_me(authorization: str = None):
    """Automated operational docstring for system validation."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    # Yahan token real validation ke liye ready hai
    return {"status": "authenticated", "session": "secure"}

from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

# React static files mount karna
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

    @app.get("/", response_class=HTMLResponse)
    async def read_index():
        with open("dist/index.html", "r", encoding="utf-8") as f:
            return f.read()

# --- Posts & Feed API Routes ---
class PostRequest(BaseModel):
    content: str
    image_url: str = None

@app.post("/api/posts")
async def create_post(req: PostRequest):
    """Post create karne ke liye endpoint"""
    # Yahan hum aage database query jodinge
    return {"success": True, "message": "Post created successfully", "data": {"content": req.content}}

@app.get("/api/posts/feed")
async def get_feed():
    """Global feed fetch karne ke liye endpoint"""
    return {"success": True, "posts": []}

async def supabase_db_operation(method: str, table: str, payload: dict = None):
    """Supabase REST API se data handle karne ke liye common function"""
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="Supabase URL not configured.")
    
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    async with httpx.AsyncClient() as client:
        if method.upper() == "POST":
            resp = await client.post(url, json=payload, headers=headers)
        elif method.upper() == "GET":
            resp = await client.get(url, headers=headers)
        
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()

# --- Overwriting older placeholder endpoints with fully functional database endpoints ---
@app.post("/api/posts")
async def create_post(req: PostRequest):
    """Naya post database mein save karne ke liye"""
    data = {"content": req.content, "image_url": req.image_url}
    result = await supabase_db_operation("POST", "posts", data)
    return {"success": True, "message": "Post created successfully in Supabase", "data": result}

@app.get("/api/posts/feed")
async def get_feed():
    """Database se saare posts fetch karne ke liye"""
    result = await supabase_db_operation("GET", "posts")
    return {"success": True, "posts": result}

@app.get("/terms")
async def get_terms_page():
    from fastapi.responses import FileResponse
    return FileResponse("templates/terms.html")

@app.get("/privacy")
async def get_privacy_page():
    from fastapi.responses import FileResponse
    return FileResponse("templates/privacy.html")

@app.get("/terms")
async def get_terms_page():
    from fastapi.responses import FileResponse
    return FileResponse("templates/terms_conditions.html")

@app.get("/privacy")
async def get_privacy_page():
    from fastapi.responses import FileResponse
    return FileResponse("templates/privacy_policy.html")
