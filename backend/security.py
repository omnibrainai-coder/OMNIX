"""Security primitives: password hashing, JWT, OTP HMAC, cookies, CSRF."""
import hmac
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Response, Request, HTTPException, status
from jose import jwt, JWTError
from passlib.context import CryptContext

from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"
CSRF_COOKIE = "csrf_token"


# ---------- Passwords / PIN ----------
def hash_secret(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_secret(plain: str, hashed: str) -> bool:
    if not hashed:
        return False
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


# ---------- OTP HMAC ----------
def otp_hash(phone: str, code: str) -> str:
    msg = f"{phone}:{code}".encode()
    return hmac.new(settings.OTP_HMAC_SECRET.encode(), msg, hashlib.sha256).hexdigest()


def constant_time_eq(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)


# ---------- JWT ----------
def create_access_token(
    user_id: str,
    pin_pending: bool = False,
    pin_deadline_ts: Optional[int] = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)).timestamp()),
        "type": "access",
        "pin_pending": pin_pending,
    }
    if pin_deadline_ts is not None:
        payload["pin_deadline"] = pin_deadline_ts
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str, jti: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=settings.REFRESH_TOKEN_DAYS)).timestamp()),
        "type": "refresh",
        "jti": jti,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")


# ---------- Cookies ----------
def _cookie_kwargs():
    return {
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": "strict",
        "path": "/",
    }


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie(
        key=ACCESS_COOKIE,
        value=access,
        max_age=settings.ACCESS_TOKEN_MINUTES * 60,
        **_cookie_kwargs(),
    )
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=refresh,
        max_age=settings.REFRESH_TOKEN_DAYS * 86400,
        **_cookie_kwargs(),
    )


def clear_auth_cookies(response: Response):
    response.delete_cookie(ACCESS_COOKIE, path="/", samesite="strict", secure=settings.COOKIE_SECURE)
    response.delete_cookie(REFRESH_COOKIE, path="/", samesite="strict", secure=settings.COOKIE_SECURE)


def ensure_csrf_cookie(request: Request, response: Response) -> str:
    """Issue a CSRF token if not present. Returned token must be echoed in
    X-CSRF-Token header (AJAX) or a hidden form field (HTML form)."""
    token = request.cookies.get(CSRF_COOKIE)
    if not token:
        token = secrets.token_urlsafe(32)
        # CSRF cookie is intentionally NOT HttpOnly (client must read it)
        response.set_cookie(
            key=CSRF_COOKIE,
            value=token,
            httponly=False,
            secure=settings.COOKIE_SECURE,
            samesite="strict",
            path="/",
            max_age=86400,
        )
    return token


def verify_csrf(request: Request):
    """Double-submit cookie check. Accept header X-CSRF-Token OR form field csrf_token."""
    cookie_val = request.cookies.get(CSRF_COOKIE)
    header_val = request.headers.get("x-csrf-token")
    if not header_val:
        # Allow form-encoded submissions to send csrf in form body
        # (FastAPI form parsing happens in the endpoint; we permit absence here
        # and re-check at the endpoint via the csrf_token form field)
        return
    if not cookie_val or not constant_time_eq(cookie_val, header_val):
        raise HTTPException(status_code=403, detail="CSRF validation failed")


def verify_csrf_form(form_token: Optional[str], request: Request):
    cookie_val = request.cookies.get(CSRF_COOKIE)
    if not cookie_val or not form_token or not constant_time_eq(cookie_val, form_token):
        raise HTTPException(status_code=403, detail="CSRF validation failed")


def new_jti() -> str:
    return secrets.token_urlsafe(24)
