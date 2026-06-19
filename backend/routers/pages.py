"""Jinja-rendered HTML page routes. All under /api/pages/*.

Pages that require authentication will redirect to /api/pages/login if cookie is missing/invalid.
The pin-lock page is rendered when the JWT has pin_pending=True.
"""
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from security import ACCESS_COOKIE, decode_token, ensure_csrf_cookie
from db import get_db
from bson import ObjectId

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


@router.get("/pin-lock", response_class=HTMLResponse)
async def pin_lock(request: Request):
    payload = _safe_decode(request.cookies.get(ACCESS_COOKIE))
    if not payload or not payload.get("pin_pending"):
        return RedirectResponse(url="/api/pages/home", status_code=302)
    deadline = payload.get("pin_deadline", 0)
    resp = templates.TemplateResponse(
        "pin_lock.html", {"request": request, "deadline": deadline}
    )
    ensure_csrf_cookie(request, resp)
    return resp


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


@router.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    payload = _safe_decode(request.cookies.get(ACCESS_COOKIE))
    if not payload or payload.get("pin_pending"):
        return RedirectResponse(url="/api/pages/login", status_code=302)
    user = await _load_user(payload)
    if not user:
        return RedirectResponse(url="/api/pages/login", status_code=302)
    resp = templates.TemplateResponse(
        "profile.html",
        {
            "request": request,
            "username": user["username"],
            "phone": user["phone"],
            "pin_enabled": bool(user.get("pin_hash")),
        },
    )
    ensure_csrf_cookie(request, resp)
    return resp


@router.get("/chat", response_class=HTMLResponse)
async def chat_page(request: Request, peer: str = ""):
    payload = _safe_decode(request.cookies.get(ACCESS_COOKIE))
    if not payload or payload.get("pin_pending"):
        return RedirectResponse(url="/api/pages/login", status_code=302)
    user = await _load_user(payload)
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
