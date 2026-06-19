"""Legal endpoints: privacy policy, terms of service, data usage agreement.
Required for Google Play Store compliance — must be accessible without authentication
and the registration form must collect explicit consent.
"""
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(prefix="/api/legal", tags=["legal"])
templates = Jinja2Templates(directory="templates")

PRIVACY_TEXT = """\
OMNIX collects the following data: username, phone number, password (hashed), 2FA PIN \
(hashed), profile photo, posts and stories you upload, messages you send, and your \
device's IP address used for rate-limiting and abuse prevention. We do not sell your \
data. You may permanently delete your account at any time from Settings → Delete \
Account. Deletion wipes all your posts, stories, messages, follows, and blocks. Your \
username is reserved for 90 days after deletion to prevent impersonation. We use \
HTTPS in production. Passwords are hashed with bcrypt. Authentication tokens are \
stored in HttpOnly, Secure, SameSite=Strict cookies."""

TERMS_TEXT = """\
By using OMNIX you agree to: (1) be at least 13 years old; (2) not impersonate \
others; (3) not post illegal, hateful, sexual, or harassing content; (4) accept that \
we may remove content and suspend accounts that violate these terms; (5) understand \
that you own your content but grant OMNIX a non-exclusive license to display it \
within the app. We may update these terms; continued use after an update means you \
accept the updated terms."""

DATA_USAGE_TEXT = """\
OMNIX uses your data only to: (1) authenticate you, (2) display your profile and \
content to people you've allowed, (3) deliver your messages to the recipient, \
(4) detect abuse and brute-force attacks via IP-based rate limiting, (5) maintain \
service reliability via standard server logs (retained 30 days). We do not share \
data with third-party advertisers."""


@router.get("/privacy")
async def privacy_json():
    return {"version": "1.0", "effective": "2026-01-01", "text": PRIVACY_TEXT}


@router.get("/terms")
async def terms_json():
    return {"version": "1.0", "effective": "2026-01-01", "text": TERMS_TEXT}


@router.get("/data-usage")
async def data_usage_json():
    return {"version": "1.0", "effective": "2026-01-01", "text": DATA_USAGE_TEXT}


@router.get("/privacy/page", response_class=HTMLResponse)
async def privacy_page(request: Request):
    return templates.TemplateResponse("privacy.html", {"request": request, "text": PRIVACY_TEXT})


@router.get("/terms/page", response_class=HTMLResponse)
async def terms_page(request: Request):
    return templates.TemplateResponse("terms.html", {"request": request, "text": TERMS_TEXT})
