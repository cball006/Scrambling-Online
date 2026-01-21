from fastapi import FastAPI, HTTPException, status, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import secrets

app = FastAPI(title="Scramble Game Backend")

# CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-memory storage ---
sessions: Dict[str, Dict] = {}  # key=session name, value=dict with id, password
next_session_id = 1
active_tokens: Dict[str, str] = {}  # token -> session name

# --- Pydantic models ---
class SessionCreate(BaseModel):
    name: str
    password: str

class SessionOut(BaseModel):
    id: int
    name: str

class SessionAuthOut(SessionOut):
    token: str

# --- Health check ---
@app.get("/health")
def health():
    return {"status": "ok"}

# --- List active sessions ---
@app.get("/sessions", response_model=List[SessionOut])
def list_sessions():
    return [{"id": s["id"], "name": name} for name, s in sessions.items()]

# --- Create a new session ---
@app.post("/sessions", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(session: SessionCreate):
    global next_session_id
    if session.name in sessions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session already exists"
        )
    sessions[session.name] = {
        "id": next_session_id,
        "password": session.password
    }
    next_session_id += 1
    return {"id": sessions[session.name]["id"], "name": session.name}

# --- Join session ---
@app.post("/sessions/join", response_model=SessionAuthOut)
def join_session(session: SessionCreate):
    if session.name not in sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    if sessions[session.name]["password"] != session.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )

    # generate token for this user
    token = secrets.token_urlsafe(32)
    active_tokens[token] = session.name

    return {
        "id": sessions[session.name]["id"],
        "name": session.name,
        "token": token
    }

# --- Optional helper for validating token ---
def get_session_from_token(token: Optional[str] = Header(None)):
    if not token or token not in active_tokens:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token")
    session_name = active_tokens[token]
    return sessions[session_name]
