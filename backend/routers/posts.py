"""Posts router. Images stored as base64 strings on the document.
Endpoints under /api/posts/*."""
import base64
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from db import get_db
from deps import get_current_user
from security import verify_csrf

router = APIRouter(prefix="/api/posts", tags=["posts"])

MAX_IMAGE_BYTES = 4 * 1024 * 1024  # 4 MB


class PostOut(BaseModel):
    id: str
    user_id: str
    username: str
    caption: str
    image_b64: str
    image_mime: str
    created_at: str
    like_count: int


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
    }


@router.post("")
async def create_post(
    request: Request,
    caption: str = Form(""),
    image: UploadFile = File(...),
):
    verify_csrf(request)
    user = await get_current_user(request)
    if image.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(400, "Only JPEG/PNG/WEBP images allowed")
    raw = await image.read()
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image too large (max 4 MB)")
    b64 = base64.b64encode(raw).decode()

    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user["_id"],
        "username": user["username"],
        "caption": caption[:500],
        "image_b64": b64,
        "image_mime": image.content_type,
        "liked_by": [],
        "created_at": now,
    }
    res = await db.posts.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _serialize_post(doc)


@router.get("/feed")
async def feed(request: Request, limit: int = 30):
    await get_current_user(request)
    limit = max(1, min(limit, 100))
    db = get_db()
    cursor = db.posts.find().sort("created_at", -1).limit(limit)
    out = [_serialize_post(p) async for p in cursor]
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
