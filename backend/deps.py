"""FastAPI dependencies for auth-gated routes."""
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import Request, HTTPException, status

from db import get_db
from security import (
    ACCESS_COOKIE,
    decode_token,
    clear_auth_cookies,
)


async def _load_user(user_id: str) -> Optional[dict]:
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    user = await db.users.find_one({"_id": oid})
    return user


async def get_current_user(request: Request) -> dict:
    """Returns a fully-authenticated user (PIN already verified if PIN exists)."""
    token = request.cookies.get(ACCESS_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Wrong token type")
    if payload.get("pin_pending"):
        raise HTTPException(status_code=403, detail="2FA PIN verification required")

    user = await _load_user(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("banned") or user.get("deleted_at"):
        raise HTTPException(status_code=401, detail="Account suspended")
    return user


async def get_user_pin_pending(request: Request) -> dict:
    """Returns user whose access token may still be in pin_pending state.
    Used by the /verify-2fa endpoint and the pin-lock screen."""
    token = request.cookies.get(ACCESS_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Wrong token type")

    # Hard enforce PIN deadline if present
    deadline = payload.get("pin_deadline")
    if deadline is not None:
        now_ts = int(datetime.now(timezone.utc).timestamp())
        if now_ts > deadline and payload.get("pin_pending"):
            raise HTTPException(status_code=440, detail="PIN deadline expired. Re-login required.")

    user = await _load_user(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {"user": user, "payload": payload}
