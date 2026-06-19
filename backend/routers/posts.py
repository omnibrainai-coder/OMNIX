"""Posts router. Images stored as base64. Block-aware feed, owner delete."""
import base64
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form

from db import get_db
from deps import get_current_user
from security import verify_csrf

router = APIRouter(prefix="/api/posts", tags=["posts"])

MAX_IMAGE_BYTES = 4 * 1024 * 1024


def _serialize_post(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "username": doc["username"],
        "caption": doc.get("caption", ""),
        "image_b64": doc["image_b64"],
        "image_mime": doc.get("image_mime", "image/jpeg"),
        "created_at": doc["created_at"].isoformat(),
        "like_count": len(doc.get("liked_by", [])),
        "close_friends_only": bool(doc.get("close_friends_only")),
    }


@router.post("")
async def create_post(
    request: Request,
    caption: str = Form(""),
    image: UploadFile = File(...),
    close_friends_only: bool = Form(False),
):
    verify_csrf(request)
    user = await get_current_user(request)
    if image.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(400, "Only JPEG/PNG/WEBP images allowed")
    raw = await image.read()
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image too large (max 4 MB)")
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user["_id"],
        "username": user["username"],
        "caption": caption[:500],
        "image_b64": base64.b64encode(raw).decode(),
        "image_mime": image.content_type,
        "liked_by": [],
        "close_friends_only": bool(close_friends_only),
        "created_at": now,
    }
    res = await db.posts.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _serialize_post(doc)


@router.get("/feed")
async def feed(request: Request, limit: int = 30):
    me = await get_current_user(request)
    limit = max(1, min(limit, 100))
    db = get_db()

    blocked_by = [b["blocker"] async for b in db.blocks.find({"blocked": me["_id"]})]
    i_blocked = [b["blocked"] async for b in db.blocks.find({"blocker": me["_id"]})]
    deleted_users = [u["_id"] async for u in db.users.find({"deleted_at": {"$exists": True}})]
    excluded_ids = set(blocked_by) | set(i_blocked) | set(deleted_users)

    cursor = db.posts.find({"user_id": {"$nin": list(excluded_ids)}}).sort("created_at", -1).limit(limit * 2)
    out = []
    async for p in cursor:
        if p.get("close_friends_only") and p["user_id"] != me["_id"]:
            owner = await db.users.find_one({"_id": p["user_id"]})
            if not owner or me["_id"] not in owner.get("close_friends", []):
                continue
        out.append(_serialize_post(p))
        if len(out) >= limit:
            break
    return {"posts": out}


@router.post("/{post_id}/like")
async def like_post(post_id: str, request: Request):
    verify_csrf(request)
    user = await get_current_user(request)
    db = get_db()
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(400, "Invalid post id")
    post = await db.posts.find_one({"_id": oid})
    if not post:
        raise HTTPException(404, "Post not found")
    liked = user["_id"] in post.get("liked_by", [])
    op = "$pull" if liked else "$addToSet"
    await db.posts.update_one({"_id": oid}, {op: {"liked_by": user["_id"]}})
    return {"ok": True, "liked": not liked}


@router.delete("/{post_id}")
async def delete_post(post_id: str, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(400, "Invalid post id")
    res = await db.posts.delete_one({"_id": oid, "user_id": me["_id"]})
    if res.deleted_count == 0:
        raise HTTPException(404, "Post not found")
    return {"ok": True}
