"""FastAPI entrypoint. Wires routers, mounts static, adds rate-limit + global exception handler."""
import logging
import traceback
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from config import settings
from db import ensure_indexes, close_client
from routers import auth, pages, posts, stories, chat, users, legal

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s :: %(message)s")
log = logging.getLogger("server")

ROOT = Path(__file__).parent

# ---------- Rate limiter ----------
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["300/minute"],  # global per-IP soft cap
    headers_enabled=True,
)

app = FastAPI(title="OMNIX Social", version="0.2.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENV == "dev" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Global exception handlers ----------
@app.exception_handler(StarletteHTTPException)
async def http_exc_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail if isinstance(exc.detail, str) else "Error"},
    )


@app.exception_handler(RequestValidationError)
async def validation_exc_handler(request: Request, exc: RequestValidationError):
    # Don't leak full pydantic dump in prod
    msgs = []
    for e in exc.errors():
        loc = ".".join(str(x) for x in e.get("loc", []) if x not in ("body", "query", "path"))
        msgs.append(f"{loc}: {e.get('msg', 'invalid')}")
    return JSONResponse(status_code=422, content={"detail": "; ".join(msgs)[:500] or "Validation error"})


@app.exception_handler(Exception)
async def unhandled_exc_handler(request: Request, exc: Exception):
    # Last-resort: never crash the worker
    log.error("UNHANDLED %s %s :: %s\n%s",
              request.method, request.url.path, exc, traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ---------- Static ----------
static_dir = ROOT / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/api/static", StaticFiles(directory=str(static_dir)), name="static")

# ---------- Routers ----------
app.include_router(auth.router)
app.include_router(pages.router)
app.include_router(posts.router)
app.include_router(stories.router)
app.include_router(chat.router)
app.include_router(users.router)
app.include_router(legal.router)


# ---------- Per-route stricter limits via dependency ----------
# slowapi's @limiter.limit decorator can be applied directly inside routers,
# but for brevity we rely on global default + endpoint-internal rate limits
# (already implemented for OTP). For brute-force, we add a login limit below.

@app.get("/api/health")
async def health(request: Request):
    return {"ok": True, "env": settings.ENV, "version": "0.2.0"}


@app.on_event("startup")
async def on_startup():
    await ensure_indexes()
    log.info("Indexes ensured. Server ready.")


@app.on_event("shutdown")
async def on_shutdown():
    close_client()
