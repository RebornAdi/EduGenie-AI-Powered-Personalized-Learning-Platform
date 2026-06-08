from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine

# Import ALL models here so SQLAlchemy registers them
from app.models.user import User
from app.models.subject import Subject

from app.routers import auth, subjects

from app.models.material import Material

from app.routers import (
    auth,
    subjects,
    materials,
)

from app.routers import tutor

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EduGenie API",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(subjects.router)
app.include_router(materials.router)
app.include_router(tutor.router)

@app.get("/")
def root():
    return {
        "message": "EduGenie API Running"
    }