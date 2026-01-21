# server/app/main.py

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .database import engine, get_db
from . import models

# ---------------- Create DB Tables ----------------
models.Base.metadata.create_all(bind=engine)

# ---------------- FastAPI Setup ----------------
app = FastAPI(title="Scramble Game Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Request Models ----------------
class SessionCreate(BaseModel):
    name: str
    password: str

# ---------------- Health Check ----------------
@app.get("/health")
def health():
    return {"status": "ok"}

# ---------------- Session Endpoints ----------------
@app.post("/sessions")
def create_session(
    session: SessionCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(models.Session).filter(
        models.Session.name == session.name
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Session already exists")

    new_session = models.Session(name=session.name)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "status": "created",
        "session": new_session.name,
        "id": new_session.id
    }

@app.get("/sessions")
def list_sessions(db: Session = Depends(get_db)):
    sessions = db.query(models.Session).all()
    return {
        "sessions": [s.name for s in sessions]
    }

@app.post("/sessions/join")
def join_session(
    session: SessionCreate,
    db: Session = Depends(get_db)
):
    db_session = db.query(models.Session).filter(
        models.Session.name == session.name
    ).first()

    if not db_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    if db_session.password != session.password:
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    return {
        "status": "joined",
        "session": db_session.name,
        "session_id": db_session.id
    }

