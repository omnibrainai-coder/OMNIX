"""Stories router. 24h auto-expire via Mongo TTL index on expires_at."""
import base64
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request, HTTPException, UploadFile, File

from db import get_db
from deps import get_current_user
from security import verify_csrf

router = APIRouter(prefix="/api/stories", tags=["stories"])

MAX_BYTES = 4 * 1024 * 1024
STORY_TTL_HOURS = 24


def _serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "username": doc["username"],
        "image_b64": doc["image_b64"],
        "image_mime": doc.get("image_mime", "image/jpeg"),
        "created_at": doc["created_at"].isoformat(),
        "expires_at": doc["expires_at"].isoformat(),
    }


@router.post("")
async def create_story(request: Request, image: UploadFile = File(...)):
    verify_csrf(request)
    user = await get_current_user(request)
    if image.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(400, "Only JPEG/PNG/WEBP")
    raw = await image.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(413, "Image too large (max 4 MB)")
    now = datetime.now(timezone.utc)
    db = get_db()
    doc = {
        "user_id": user["_id"],
        "username": user["username"],
        "image_b64": base64.b64encode(raw).decode(),
        "image_mime": image.content_type,
        "created_at": now,
        "expires_at": now + timedelta(hours=STORY_TTL_HOURS),
    }
    res = await db.stories.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _serialize(doc)


@router.get("/active")
async def list_active(request: Request):
    await get_current_user(request)
    now = datetime.now(timezone.utc)
    db = get_db()
    cursor = db.stories.find({"expires_at": {"$gt": now}}).sort("created_at", -1)
    return {"stories": [_serialize(s) async for s in cursor]}
