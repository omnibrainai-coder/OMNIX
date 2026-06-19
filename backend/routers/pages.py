"""Jinja-rendered HTML page routes. All under /api/pages/*."""
from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from security import ACCESS_COOKIE, decode_token, ensure_csrf_cookie
from db import get_db

router = APIRouter(prefix="/api/pages", tags=["pages"])
templates = Jinja2Templates(directory="templates")


def _safe_decode(token: str | None):
    if not token:
        return None
    try:
        return decode_token(token)
    except HTTPException:
        return None


async def _load_user(payload):
    if not payload:
        return None
    db = get_db()
    try:
        return await db.users.find_one({"_id": ObjectId(payload["sub"])})
    except Exception:
        return None


async def _require_auth(request: Request):
    payload = _safe_decode(request.cookies.get(ACCESS_COOKIE))
    if not payload or payload.get("pin_pending"):
        return None
    return await _load_user(payload)


# ---------- Public pages ----------
@router.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return RedirectResponse(url="/api/pages/login", status_code=302)


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    resp = templates.TemplateResponse("login.html", {"request": request})
    ensure_csrf_cookie(request, resp)
    return resp


@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    resp = templates.TemplateResponse("register.html", {"request": request})
    ensure_csrf_cookie(request, resp)
    return resp


@router.get("/otp", response_class=HTMLResponse)
async def otp_page(request: Request, phone: str = ""):
    resp = templates.TemplateResponse("otp.html", {"request": request, "phone": phone})
    ensure_csrf_cookie(request, resp)
    return resp


# ---------- PIN lock ----------
@router.get("/pin-lock", response_class=HTMLResponse)
async def pin_lock(request: Request):
    payload = _safe_decode(request.cookies.get(ACCESS_COOKIE))
    if not payload or not payload.get("pin_pending"):
        return RedirectResponse(url="/api/pages/home", status_code=302)
    deadline = payload.get("pin_deadline", 0)
    resp = templates.TemplateResponse("pin_lock.html", {"request": request, "deadline": deadline})
    ensure_csrf_cookie(request, resp)
    return resp


# ---------- Home ----------
@router.get("/home", response_class=HTMLResponse)
async def home_page(request: Request):
    payload = _safe_decode(request.cookies.get(ACCESS_COOKIE))
    if not payload:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    user = await _load_user(payload)
    if not user:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    pin_pending = bool(payload.get("pin_pending"))
    resp = templates.TemplateResponse(
        "home.html",
        {
            "request": request,
            "username": user["username"],
            "pin_pending": pin_pending,
            "pin_deadline": payload.get("pin_deadline", 0),
        },
    )
    ensure_csrf_cookie(request, resp)
    return resp


# ---------- Own profile (rich) ----------
@router.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    user = await _require_auth(request)
    if not user:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    db = get_db()
    followers = await db.follows.count_documents({"followee": user["_id"]})
    following = await db.follows.count_documents({"follower": user["_id"]})
    resp = templates.TemplateResponse(
        "profile.html",
        {
            "request": request,
            "username": user["username"],
            "phone": user["phone"],
            "display_name": user.get("display_name") or user["username"],
            "bio": user.get("bio") or "",
            "avatar_b64": user.get("avatar_b64") or "",
            "avatar_mime": user.get("avatar_mime") or "image/png",
            "pin_enabled": bool(user.get("pin_hash")),
            "search_hidden": bool(user.get("search_hidden")),
            "followers": followers,
            "following": following,
        },
    )
    ensure_csrf_cookie(request, resp)
    return resp


# ---------- Chat ----------
@router.get("/chat", response_class=HTMLResponse)
async def chat_page(request: Request, peer: str = ""):
    user = await _require_auth(request)
    if not user:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    resp = templates.TemplateResponse(
        "chat.html",
        {
            "request": request,
            "username": user["username"],
            "user_id": str(user["_id"]),
            "peer_username": peer,
        },
    )
    ensure_csrf_cookie(request, resp)
    return resp


# ---------- Search ----------
@router.get("/search", response_class=HTMLResponse)
async def search_page(request: Request, q: str = ""):
    user = await _require_auth(request)
    if not user:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    resp = templates.TemplateResponse("search.html", {"request": request, "q": q})
    ensure_csrf_cookie(request, resp)
    return resp


# ---------- Public user profile ----------
@router.get("/user/{username}", response_class=HTMLResponse)
async def user_profile_page(username: str, request: Request):
    user = await _require_auth(request)
    if not user:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    resp = templates.TemplateResponse(
        "user_profile.html",
        {"request": request, "target_username": username.lower()},
    )
    ensure_csrf_cookie(request, resp)
    return resp


# ---------- Close friends ----------
@router.get("/close-friends", response_class=HTMLResponse)
async def close_friends_page(request: Request):
    user = await _require_auth(request)
    if not user:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    resp = templates.TemplateResponse("close_friends.html", {"request": request})
    ensure_csrf_cookie(request, resp)
    return resp


# ---------- Blocks ----------
@router.get("/blocks", response_class=HTMLResponse)
async def blocks_page(request: Request):
    user = await _require_auth(request)
    if not user:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    resp = templates.TemplateResponse("blocks.html", {"request": request})
    ensure_csrf_cookie(request, resp)
    return resp


# ---------- Story archive ----------
@router.get("/archive", response_class=HTMLResponse)
async def archive_page(request: Request):
    user = await _require_auth(request)
    if not user:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    resp = templates.TemplateResponse("archive.html", {"request": request})
    ensure_csrf_cookie(request, resp)
    return resp
