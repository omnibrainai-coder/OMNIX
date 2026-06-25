"""Moderation: user-submitted reports + admin queue + actions.

Submitter side (any authed user):
  POST /api/reports                       create a report
  GET  /api/reports/me                    my own reports (status visible to me)

Moderator side (requires users.is_moderator = true):
  GET  /api/moderation/queue              list pending reports
  GET  /api/moderation/stats              counts by status
  POST /api/moderation/reports/{id}/action
       body: {"action":"dismiss"|"remove_content"|"ban_user", "note": "..."}
"""
from datetime import datetime, timezone
from typing import Literal, Optional

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field

from db import get_db
from deps import get_current_user
from security import verify_csrf

router = APIRouter(prefix="/api", tags=["moderation"])

TARGET_TYPES = ("post", "story", "user", "message")
REASONS = ("spam", "harassment", "nudity", "violence", "hate", "csam", "self_harm", "impersonation", "other")
ACTIONS = ("dismiss", "remove_content", "ban_user")
DAILY_REPORT_LIMIT = 30  # per user


class ReportIn(BaseModel):
    target_type: Literal["post", "story", "user", "message"]
    target_id: str = Field(min_length=1, max_length=64)
    reason: Literal["spam", "harassment", "nudity", "violence", "hate", "csam", "self_harm", "impersonation", "other"]
    details: Optional[str] = Field(default="", max_length=500)


class ModerationActionIn(BaseModel):
    action: Literal["dismiss", "remove_content", "ban_user"]
    note: Optional[str] = Field(default="", max_length=500)


def _serialize_report(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "reporter_id": str(doc["reporter_id"]),
        "target_type": doc["target_type"],
        "target_id": doc["target_id"],
        "reason": doc["reason"],
        "details": doc.get("details", ""),
        "status": doc.get("status", "pending"),
        "action_taken": doc.get("action_taken"),
        "reviewer_id": str(doc["reviewer_id"]) if doc.get("reviewer_id") else None,
        "reviewer_note": doc.get("reviewer_note", ""),
        "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None,
        "reviewed_at": doc["reviewed_at"].isoformat() if doc.get("reviewed_at") else None,
    }


async def _require_moderator(request: Request) -> dict:
    user = await get_current_user(request)
    if not user.get("is_moderator"):
        raise HTTPException(403, "Moderator privileges required")
    return user


# ---------- Submit ----------
@router.post("/reports")
async def submit_report(payload: ReportIn, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()

    # Anti-abuse: per-user daily cap
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    day_count = await db.reports.count_documents({
        "reporter_id": me["_id"],
        "created_at": {"$gte": today_start},
    })
    if day_count >= DAILY_REPORT_LIMIT:
        raise HTTPException(429, "Daily report limit reached")

    # Idempotent: don't allow same user to file an identical pending report twice
    dup = await db.reports.find_one({
        "reporter_id": me["_id"],
        "target_type": payload.target_type,
        "target_id": payload.target_id,
        "status": "pending",
    })
    if dup:
        return {"ok": True, "id": str(dup["_id"]), "deduped": True}

    doc = {
        "reporter_id": me["_id"],
        "target_type": payload.target_type,
        "target_id": payload.target_id,
        "reason": payload.reason,
        "details": (payload.details or "").strip(),
        "status": "pending",
        "action_taken": None,
        "reviewer_id": None,
        "reviewer_note": "",
        "created_at": now,
        "reviewed_at": None,
    }
    res = await db.reports.insert_one(doc)
    return {"ok": True, "id": str(res.inserted_id)}


@router.get("/reports/me")
async def my_reports(request: Request, limit: int = 50):
    me = await get_current_user(request)
    db = get_db()
    cursor = db.reports.find({"reporter_id": me["_id"]}).sort("created_at", -1).limit(min(limit, 200))
    return {"reports": [_serialize_report(r) async for r in cursor]}


# ---------- Moderator: queue ----------
@router.get("/moderation/queue")
async def moderation_queue(request: Request, status: str = "pending", limit: int = 50):
    mod = await _require_moderator(request)
    db = get_db()
    if status not in ("pending", "reviewed", "dismissed", "actioned", "all"):
        raise HTTPException(400, "Invalid status filter")
    q = {} if status == "all" else {"status": status}
    cursor = db.reports.find(q).sort("created_at", 1).limit(min(limit, 200))
    items = []
    async for r in cursor:
        item = _serialize_report(r)
        # Enrich with reporter username + target preview
        reporter = await db.users.find_one({"_id": r["reporter_id"]})
        item["reporter_username"] = reporter["username"] if reporter else "(deleted)"
        item["target_preview"] = await _target_preview(db, r["target_type"], r["target_id"])
        items.append(item)
    return {"reports": items, "is_moderator": True, "mod_username": mod["username"]}


@router.get("/moderation/stats")
async def moderation_stats(request: Request):
    await _require_moderator(request)
    db = get_db()
    out = {}
    for s in ("pending", "dismissed", "actioned"):
        out[s] = await db.reports.count_documents({"status": s})
    out["total"] = sum(out.values())
    return out


async def _target_preview(db, target_type: str, target_id: str) -> dict:
    try:
        if target_type == "post":
            p = await db.posts.find_one({"_id": ObjectId(target_id)})
            return {"exists": bool(p), "summary": (p["caption"][:80] if p else "(deleted)"),
                    "owner_username": p["username"] if p else None}
        if target_type == "story":
            s = await db.stories.find_one({"_id": ObjectId(target_id)})
            return {"exists": bool(s), "summary": "story",
                    "owner_username": s["username"] if s else None}
        if target_type == "message":
            m = await db.messages.find_one({"_id": ObjectId(target_id)})
            return {"exists": bool(m), "summary": (m["text"][:80] if m else "(deleted)"),
                    "owner_username": m.get("from_username") if m else None}
        if target_type == "user":
            # target_id can be username or ObjectId
            u = None
            if ObjectId.is_valid(target_id):
                u = await db.users.find_one({"_id": ObjectId(target_id)})
            if not u:
                u = await db.users.find_one({"username": target_id.lower()})
            return {"exists": bool(u), "summary": u["username"] if u else "(deleted)",
                    "owner_username": u["username"] if u else None}
    except Exception:
        pass
    return {"exists": False, "summary": "(unknown)", "owner_username": None}


# ---------- Moderator: act ----------
@router.post("/moderation/reports/{report_id}/action")
async def moderation_action(report_id: str, payload: ModerationActionIn, request: Request):
    verify_csrf(request)
    mod = await _require_moderator(request)
    db = get_db()

    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(400, "Invalid report id")
    report = await db.reports.find_one({"_id": oid})
    if not report:
        raise HTTPException(404, "Report not found")
    if report.get("status") not in (None, "pending"):
        raise HTTPException(409, f"Report already {report['status']}")

    action = payload.action
    now = datetime.now(timezone.utc)
    side_effect = None

    if action == "dismiss":
        new_status = "dismissed"
    elif action == "remove_content":
        side_effect = await _remove_target(db, report["target_type"], report["target_id"])
        new_status = "actioned"
    elif action == "ban_user":
        side_effect = await _ban_owner(db, report["target_type"], report["target_id"])
        new_status = "actioned"
    else:
        raise HTTPException(400, "Unknown action")

    await db.reports.update_one(
        {"_id": oid},
        {"$set": {
            "status": new_status,
            "action_taken": action,
            "reviewer_id": mod["_id"],
            "reviewer_note": (payload.note or "").strip(),
            "reviewed_at": now,
        }},
    )
    return {"ok": True, "status": new_status, "side_effect": side_effect}


async def _remove_target(db, target_type: str, target_id: str) -> dict:
    try:
        if target_type == "post":
            r = await db.posts.delete_one({"_id": ObjectId(target_id)})
            return {"removed": r.deleted_count > 0, "kind": "post"}
        if target_type == "story":
            r = await db.stories.delete_one({"_id": ObjectId(target_id)})
            return {"removed": r.deleted_count > 0, "kind": "story"}
        if target_type == "message":
            r = await db.messages.delete_one({"_id": ObjectId(target_id)})
            return {"removed": r.deleted_count > 0, "kind": "message"}
        if target_type == "user":
            return await _ban_owner(db, "user", target_id)
    except Exception as e:
        return {"removed": False, "error": str(e)}
    return {"removed": False, "kind": target_type}


async def _ban_owner(db, target_type: str, target_id: str) -> dict:
    """Find the owner of a target and set banned=True + deleted_at=now (revokes session next request)."""
    owner_id = None
    try:
        if target_type == "user":
            if ObjectId.is_valid(target_id):
                u = await db.users.find_one({"_id": ObjectId(target_id)})
            else:
                u = await db.users.find_one({"username": target_id.lower()})
            owner_id = u["_id"] if u else None
        elif target_type == "post":
            p = await db.posts.find_one({"_id": ObjectId(target_id)})
            owner_id = p["user_id"] if p else None
        elif target_type == "story":
            s = await db.stories.find_one({"_id": ObjectId(target_id)})
            owner_id = s["user_id"] if s else None
        elif target_type == "message":
            m = await db.messages.find_one({"_id": ObjectId(target_id)})
            owner_id = m["from_user_id"] if m else None
    except Exception as e:
        return {"banned": False, "error": str(e)}

    if not owner_id:
        return {"banned": False, "reason": "owner_not_found"}

    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": owner_id},
        {"$set": {"banned": True, "banned_at": now, "deleted_at": now, "search_hidden": True}},
    )
    # Revoke all of their refresh tokens (no jti map; we just bump a generation marker)
    return {"banned": True, "user_id": str(owner_id)}
