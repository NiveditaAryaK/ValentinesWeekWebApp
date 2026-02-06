import os
from datetime import datetime, timezone
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from itsdangerous import BadSignature, URLSafeSerializer
from starlette.middleware.sessions import SessionMiddleware

load_dotenv()

AUTH_USERNAME = os.getenv("AUTH_USERNAME")
AUTH_PASSWORD = os.getenv("AUTH_PASSWORD")
SESSION_SECRET = os.getenv("SESSION_SECRET", "dev-secret-change-me")
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB", "valentine_week")
SESSION_SAMESITE = os.getenv("SESSION_SAMESITE", "lax").lower()

if not AUTH_USERNAME or not AUTH_PASSWORD:
    raise RuntimeError("AUTH_USERNAME and AUTH_PASSWORD must be set in .env")
if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI must be set in .env")

token_serializer = URLSafeSerializer(SESSION_SECRET, salt="valentine-auth")

app = FastAPI(title="Valentine Week API")
mongo_client: AsyncIOMotorClient | None = None

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
allowed_origins: List[str] = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    https_only=os.getenv("SESSION_HTTPS_ONLY", "false").lower() == "true",
    same_site=SESSION_SAMESITE if SESSION_SAMESITE in {"lax", "strict", "none"} else "lax"
)


class LoginRequest(BaseModel):
    username: str
    password: str


class ReplyCreate(BaseModel):
    message: str


def verify_credentials(username: str, password: str) -> bool:
    return username == AUTH_USERNAME and password == AUTH_PASSWORD


def create_token(username: str) -> str:
    return token_serializer.dumps({"u": username})


def verify_token(token: str | None) -> str | None:
    if not token:
        return None
    try:
        data = token_serializer.loads(token)
    except BadSignature:
        return None
    return data.get("u")


def get_bearer_token(request: Request) -> str | None:
    auth_header = request.headers.get("authorization")
    if not auth_header:
        return None
    if not auth_header.lower().startswith("bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip()


@app.get("/health")
async def health():
    return {"ok": True}


@app.on_event("startup")
async def startup():
    global mongo_client
    mongo_client = AsyncIOMotorClient(MONGODB_URI)


@app.on_event("shutdown")
async def shutdown():
    if mongo_client:
        mongo_client.close()


@app.post("/auth/login")
async def login(payload: LoginRequest, request: Request):
    if not verify_credentials(payload.username, payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    request.session["user"] = payload.username
    return {"ok": True, "user": payload.username, "token": create_token(payload.username)}


@app.post("/auth/logout")
async def logout(request: Request):
    request.session.clear()
    return {"ok": True}


@app.get("/auth/me")
async def auth_me(request: Request):
    user = request.session.get("user")
    if not user:
        token_user = verify_token(get_bearer_token(request))
        if not token_user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        user = token_user
    return {"ok": True, "user": user}


@app.post("/responses")
async def create_response(payload: ReplyCreate, request: Request):
    user = request.session.get("user")
    if not user:
        token_user = verify_token(get_bearer_token(request))
        if not token_user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        user = token_user
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    if not mongo_client:
        raise HTTPException(status_code=500, detail="Database not available")

    db = mongo_client[MONGODB_DB]
    document = {
        "message": payload.message.strip(),
        "user": user,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db["responses"].insert_one(document)
    return {"ok": True, "id": str(result.inserted_id)}
