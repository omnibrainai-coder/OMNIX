"""Auth router: register, OTP, login, 2FA PIN, logout, refresh.

All endpoints under /api/auth/*.
JWT lives in HttpOnly+SameSite=Strict cookies.
OTP is mocked in dev (code = settings.MOCK_OTP). Replace _send_otp() with
the real Fast2SMS call when keys are provided.
"""
import re
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Request, Response, HTTPException, Form
from pydantic import BaseModel, Field

from db import get_db
from config import settings
from security import (
    hash_secret, verify_secret,
    create_access_token, create_refresh_token, decode_token,
    set_auth_cookies, clear_auth_cookies, ensure_csrf_cookie, verify_csrf,
    otp_hash, constant_time_eq, new_jti,
    REFRESH_COOKIE,
)
from deps import get_current_user, get_user_pin_pending

log = logging.getLogger("auth")
router = APIRouter(prefix="/api/auth", tags=["auth"])

PHONE_RE = re.compile(r"^\+?[0-9]{10,15}$")
USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]{3,24}$")
PIN_RE = re.compile(r"^[0-9]{6}$")


# ---------- Pydantic schemas ----------
class RegisterIn(BaseModel):
    username: str
    phone: str
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    username: str
    password: str


class VerifyOtpIn(BaseModel):
    phone: str
    code: str


class VerifyPinIn(BaseModel):
    pin: str


class SetPinIn(BaseModel):
    pin: str


# ---------- Helpers ----------
def _validate_phone(phone: str) -> str:
    phone = phone.strip()
    if not PHONE_RE.match(phone):
        raise HTTPException(400, "Invalid phone format. Use E.164 (e.g. +919876543210)")
    return phone


def _validate_username(u: str) -> str:
    u = u.strip().lower()
    if not USERNAME_RE.match(u):
        raise HTTPException(400, "Username must be 3-24 chars, letters/digits/underscore")
    return u


async def _rate_limit_otp(phone: str):
    """1/min, 5/hour per phone."""
    db = get_db()
    now = datetime.now(timezone.utc)
    last_min = await db.otp_attempts.count_documents({
        "phone": phone,
        "created_at": {"$gte": now - timedelta(seconds=60)},
    })
    if last_min >= 1:
        raise HTTPException(429, "Please wait before requesting another OTP")
    last_hour = await db.otp_attempts.count_documents({
        "phone": phone,
        "created_at": {"$gte": now - timedelta(hours=1)},
    })
    if last_hour >= 5:
        raise HTTPException(429, "OTP request limit reached. Try again later.")


async def _send_otp(phone: str, code: str):
    """Mock now; replace with real Fast2SMS HTTP call when key is set.

    NOTE: This is the single point to swap to real SMS. Keep the signature.
    """
    if settings.FAST2SMS_API_KEY:
        # TODO: Real Fast2SMS HTTPS call goes here.
        # Per playbook: inspect JSON body, not just status code.
        log.info(f"[FAST2SMS-LIVE] would send OTP to {phone}")
    else:
        log.info(f"[FAST2SMS-MOCK] OTP for {phone} = {code}")


async def _issue_otp(phone: str) -> str:
    db = get_db()
    code = settings.MOCK_OTP  # 6-digit, deterministic in dev
    h = otp_hash(phone, code)
    now = datetime.now(timezone.utc)
    await db.otps.delete_many({"phone": phone})  # invalidate any prior code
    await db.otps.insert_one({
        "phone": phone,
        "code_hash": h,
        "attempts": 0,
        "created_at": now,
    })
    await db.otp_attempts.insert_one({"phone": phone, "created_at": now})
    await _send_otp(phone, code)
    return code


def _set_tokens(response: Response, user_id: str, pin_pending: bool):
    pin_deadline_ts = None
    if pin_pending:
        pin_deadline_ts = int(
            (datetime.now(timezone.utc) + timedelta(minutes=settings.PIN_DEADLINE_MINUTES)).timestamp()
        )
    access = create_access_token(user_id, pin_pending=pin_pending, pin_deadline_ts=pin_deadline_ts)
    refresh = create_refresh_token(user_id, jti=new_jti())
    set_auth_cookies(response, access, refresh)


# ---------- CSRF init ----------
@router.get("/csrf")
async def init_csrf(request: Request, response: Response):
    token = ensure_csrf_cookie(request, response)
    return {"csrf_token": token}


# ---------- Register ----------
@router.post("/register")
async def register(payload: RegisterIn, request: Request, response: Response):
    verify_csrf(request)
    username = _validate_username(payload.username)
    phone = _validate_phone(payload.phone)
    if len(payload.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")

    db = get_db()
    if await db.users.find_one({"$or": [{"username": username}, {"phone": phone}]}):
        raise HTTPException(409, "Username or phone already registered")

    now = datetime.now(timezone.utc)
    res = await db.users.insert_one({
        "username": username,
        "phone": phone,
        "password_hash": hash_secret(payload.password),
        "pin_hash": None,
        "pin_strikes": 0,
        "pin_locked_until": None,
        "phone_verified": False,
        "created_at": now,
        "updated_at": now,
    })
    await _issue_otp(phone)
    return {"ok": True, "user_id": str(res.inserted_id), "phone": phone,
            "message": "OTP sent. Verify to complete signup."}


# ---------- Login (password) → triggers OTP ----------
@router.post("/login")
async def login(payload: LoginIn, request: Request, response: Response):
    verify_csrf(request)
    username = _validate_username(payload.username)
    db = get_db()
    user = await db.users.find_one({"username": username})
    if not user or not verify_secret(payload.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid credentials")
    await _rate_limit_otp(user["phone"])
    await _issue_otp(user["phone"])
    return {"ok": True, "phone": user["phone"], "message": "OTP sent"}


# ---------- Verify OTP → set cookies, possibly pin_pending=True ----------
@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpIn, request: Request, response: Response):
    verify_csrf(request)
    phone = _validate_phone(payload.phone)
    if not re.match(r"^[0-9]{6}$", payload.code):
        raise HTTPException(400, "OTP must be 6 digits")

    db = get_db()
    record = await db.otps.find_one({"phone": phone})
    if not record:
        raise HTTPException(400, "OTP expired or not requested")
    if record.get("attempts", 0) >= 5:
        await db.otps.delete_one({"_id": record["_id"]})
        raise HTTPException(429, "Too many OTP attempts. Request a new code.")

    expected = record["code_hash"]
    submitted = otp_hash(phone, payload.code)
    if not constant_time_eq(expected, submitted):
        await db.otps.update_one({"_id": record["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(401, "Incorrect OTP")

    user = await db.users.find_one({"phone": phone})
    if not user:
        raise HTTPException(404, "User not found")

    await db.otps.delete_one({"_id": record["_id"]})
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"phone_verified": True, "updated_at": datetime.now(timezone.utc)}})

    has_pin = bool(user.get("pin_hash"))
    _set_tokens(response, str(user["_id"]), pin_pending=has_pin)
    return {"ok": True, "pin_required": has_pin,
            "next": "/api/pages/pin-lock" if has_pin else "/api/pages/home"}


# ---------- Set/update 6-digit PIN (must be authenticated, no pin_pending) ----------
@router.post("/set-pin")
async def set_pin(payload: SetPinIn, request: Request):
    verify_csrf(request)
    user = await get_current_user(request)
    if not PIN_RE.match(payload.pin):
        raise HTTPException(400, "PIN must be exactly 6 digits")
    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "pin_hash": hash_secret(payload.pin),
            "pin_strikes": 0,
            "pin_locked_until": None,
            "updated_at": datetime.now(timezone.utc),
        }},
    )
    return {"ok": True, "message": "2FA PIN enabled"}


# ---------- Verify 2FA PIN ----------
@router.post("/verify-pin")
async def verify_pin(payload: VerifyPinIn, request: Request, response: Response):
    verify_csrf(request)
    ctx = await get_user_pin_pending(request)
    user, jwt_payload = ctx["user"], ctx["payload"]
    db = get_db()

    if not user.get("pin_hash"):
        raise HTTPException(400, "No PIN set for this account")

    # Check lockout
    locked_until = user.get("pin_locked_until")
    now = datetime.now(timezone.utc)
    if locked_until and locked_until > now:
        clear_auth_cookies(response)
        raise HTTPException(423, "Account locked due to failed PIN attempts")

    # Enforce 3-minute deadline at endpoint level too
    deadline = jwt_payload.get("pin_deadline")
    if deadline and int(now.timestamp()) > deadline:
        clear_auth_cookies(response)
        raise HTTPException(440, "PIN deadline expired. Please log in again.")

    if not PIN_RE.match(payload.pin):
        raise HTTPException(400, "PIN must be 6 digits")

    if not verify_secret(payload.pin, user["pin_hash"]):
        new_strikes = int(user.get("pin_strikes", 0)) + 1
        update = {"pin_strikes": new_strikes, "updated_at": now}
        if new_strikes >= settings.PIN_MAX_STRIKES:
            update["pin_locked_until"] = now + timedelta(minutes=15)
            await db.users.update_one({"_id": user["_id"]}, {"$set": update})
            # Invalidate session
            refresh = request.cookies.get(REFRESH_COOKIE)
            if refresh:
                await db.revoked_tokens.insert_one({"token": refresh, "revoked_at": now})
            clear_auth_cookies(response)
            raise HTTPException(423, "Too many wrong PIN attempts. Session terminated, account locked for 15 minutes.")
        await db.users.update_one({"_id": user["_id"]}, {"$set": update})
        remaining = settings.PIN_MAX_STRIKES - new_strikes
        raise HTTPException(401, f"Wrong PIN. {remaining} attempt(s) left.")

    # Success
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"pin_strikes": 0, "pin_locked_until": None, "updated_at": now}},
    )
    _set_tokens(response, str(user["_id"]), pin_pending=False)
    return {"ok": True, "next": "/api/pages/home"}


# ---------- Refresh ----------
@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    verify_csrf(request)
    rt = request.cookies.get(REFRESH_COOKIE)
    if not rt:
        raise HTTPException(401, "No refresh token")
    db = get_db()
    if await db.revoked_tokens.find_one({"token": rt}):
        clear_auth_cookies(response)
        raise HTTPException(401, "Refresh token revoked")
    payload = decode_token(rt)
    if payload.get("type") != "refresh":
        raise HTTPException(401, "Wrong token type")
    user_id = payload["sub"]
    # Rotate
    await db.revoked_tokens.insert_one({"token": rt, "revoked_at": datetime.now(timezone.utc)})
    _set_tokens(response, user_id, pin_pending=False)
    return {"ok": True}


# ---------- Logout ----------
@router.post("/logout")
async def logout(request: Request, response: Response):
    verify_csrf(request)
    db = get_db()
    rt = request.cookies.get(REFRESH_COOKIE)
    if rt:
        await db.revoked_tokens.insert_one({"token": rt, "revoked_at": datetime.now(timezone.utc)})
    clear_auth_cookies(response)
    return {"ok": True}


# ---------- Whoami ----------
@router.get("/me")
async def me(request: Request):
    user = await get_current_user(request)
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "phone": user["phone"],
        "pin_enabled": bool(user.get("pin_hash")),
        "phone_verified": bool(user.get("phone_verified")),
    }
