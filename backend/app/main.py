from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import analytics, auth, materials, planner, quiz, tutor

Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
Path(settings.chroma_dir).mkdir(parents=True, exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EduGenie API",
    description="AI-Powered Personalized Learning Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(tutor.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(planner.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "EduGenie API is running", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
