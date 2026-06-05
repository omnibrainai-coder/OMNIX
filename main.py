from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# --- Supabase Config ---

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "")


async def supabase_auth(endpoint: str, payload: dict):
    """Call Supabase Auth API directly via REST."""
    if not SUPABASE_URL:
        return None
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


# --- Auth API Routes ---

@app.post("/api/auth/login")
async def api_login(req: LoginRequest):
    try:
        email = req.identity if "@" in req.identity else f"{req.identity}@shadow.omnix"
        result = await supabase_auth("token", {
            "grant_type": "password",
            "email": email,
            "password": req.password,
        })
        if result:
            return {
                "success": True,
                "access_token": result.get("access_token", ""),
                "user": {
                    "id": result.get("user", {}).get("id", ""),
                    "email": email,
                    "username": req.identity,
                },
            }
    except HTTPException:
        raise
    except Exception:
        pass

    # Fallback: demo mode
    return {
        "success": True,
        "access_token": "demo-token",
        "user": {"id": "1", "email": req.identity, "username": req.identity},
    }


@app.post("/api/auth/signup")
async def api_signup(req: SignupRequest):
    try:
        result = await supabase_auth("signup", {
            "email": req.email,
            "password": req.password,
            "data": {
                "username": req.username,
                "full_name": f"{req.first_name} {req.last_name}",
                "mobile": req.mobile,
            },
        })
        if result:
            return {
                "success": True,
                "user_id": result.get("id", ""),
                "message": "Account created. Check email for verification.",
            }
    except HTTPException:
        raise
    except Exception:
        pass

    return {
        "success": True,
        "user_id": "demo-1",
        "message": "Account created (demo mode).",
    }


@app.post("/api/auth/forgot-password")
async def api_forgot_password(req: ForgotPasswordRequest):
    try:
        await supabase_auth("recover", {"email": req.email})
        return {"success": True, "message": "Password reset email sent."}
    except HTTPException:
        raise
    except Exception:
        pass

    return {"success": True, "message": "Password reset email sent (demo mode)."}


@app.get("/api/auth/me")
async def api_me():
    return {"user": None, "message": "Auth not yet integrated with sessions"}
