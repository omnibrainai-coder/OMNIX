"""FastAPI entrypoint. Wires routers, mounts static, sets up CORS, ensures indexes."""
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from db import ensure_indexes, close_client
from routers import auth, pages, posts, stories, chat

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s :: %(message)s")
log = logging.getLogger("server")

ROOT = Path(__file__).parent

app = FastAPI(title="OMNIX Social", version="0.1.0")

# CORS: this app is same-origin via /api/* ingress; keep permissive in dev only.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENV == "dev" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files at /api/static/*
static_dir = ROOT / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/api/static", StaticFiles(directory=str(static_dir)), name="static")

# Routers
app.include_router(auth.router)
app.include_router(pages.router)
app.include_router(posts.router)
app.include_router(stories.router)
app.include_router(chat.router)


@app.get("/api/health")
async def health():
    return {"ok": True, "env": settings.ENV}


@app.on_event("startup")
async def on_startup():
    await ensure_indexes()
    log.info("Indexes ensured. Server ready.")


@app.on_event("shutdown")
async def on_shutdown():
    close_client()
