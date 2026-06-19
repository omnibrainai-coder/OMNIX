"""Stories router. 24h active window, then auto-archived (NOT deleted).
Active stories remain visible to followers; archived stories visible ONLY to owner.
"""
import base64
from datetime import datetime, timedelta, timezone

from bson import ObjectId
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
        "archived": bool(doc.get("archived")),
        "close_friends_only": bool(doc.get("close_friends_only")),
    }


async def _auto_archive_expired(db):
    """Mark expired stories as archived (no deletion)."""
    now = datetime.now(timezone.utc)
    await db.stories.update_many(
        {"expires_at": {"$lte": now}, "archived": {"$ne": True}},
        {"$set": {"archived": True, "archived_at": now}},
    )


@router.post("")
async def create_story(
    request: Request,
    image: UploadFile = File(...),
    close_friends_only: bool = False,
):
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
        "archived": False,
        "close_friends_only": bool(close_friends_only),
    }
    res = await db.stories.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _serialize(doc)


@router.get("/active")
async def list_active(request: Request):
    me = await get_current_user(request)
    db = get_db()
    await _auto_archive_expired(db)
    now = datetime.now(timezone.utc)

    # Only show stories from people I follow + my own + respecting close_friends_only flag
    following_ids = [f["followee"] async for f in db.follows.find({"follower": me["_id"]})]
    visible_authors = set(following_ids) | {me["_id"]}
    blocked_by = [b["blocker"] async for b in db.blocks.find({"blocked": me["_id"]})]
    visible_authors -= set(blocked_by)

    cursor = db.stories.find({
        "user_id": {"$in": list(visible_authors)},
        "expires_at": {"$gt": now},
        "archived": {"$ne": True},
    }).sort("created_at", -1)

    out = []
    async for s in cursor:
        if s.get("close_friends_only") and s["user_id"] != me["_id"]:
            owner = await db.users.find_one({"_id": s["user_id"]})
            if not owner or me["_id"] not in owner.get("close_friends", []):
                continue
        out.append(_serialize(s))
    return {"stories": out}


@router.get("/archive")
async def my_archive(request: Request, limit: int = 100):
    """Owner-only view of expired stories."""
    me = await get_current_user(request)
    db = get_db()
    await _auto_archive_expired(db)
    cursor = db.stories.find({"user_id": me["_id"], "archived": True}).sort("created_at", -1).limit(min(limit, 500))
    return {"archived": [_serialize(s) async for s in cursor]}


@router.delete("/{story_id}")
async def delete_story(story_id: str, request: Request):
    """Permanent deletion of a single archived/active story (owner only)."""
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    try:
        oid = ObjectId(story_id)
    except Exception:
        raise HTTPException(400, "Invalid story id")
    res = await db.stories.delete_one({"_id": oid, "user_id": me["_id"]})
    if res.deleted_count == 0:
        raise HTTPException(404, "Story not found")
    return {"ok": True}
