from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SubjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class SubjectResponse(BaseModel):
    id: int
    name: str
    user_id: int

    class Config:
        from_attributes = True


class NoteResponse(BaseModel):
    id: int
    subject_id: int
    title: str
    file_path: str
    upload_date: datetime

    class Config:
        from_attributes = True


class TutorMessage(BaseModel):
    message: str = Field(min_length=1)
    subject_id: int | None = None


class TutorResponse(BaseModel):
    reply: str
    sources: list[str] = []


class QuizGenerateRequest(BaseModel):
    topic: str = Field(min_length=1)
    difficulty: str = "medium"
    num_questions: int = Field(default=5, ge=1, le=20)
    subject_id: int | None = None


class QuizQuestion(BaseModel):
    question: str
    type: str
    options: list[str] | None = None
    correct_answer: str | int | bool


class QuizResponse(BaseModel):
    id: int
    topic: str
    difficulty: str
    questions: list[QuizQuestion]
    created_at: datetime


class QuizSubmitRequest(BaseModel):
    answers: list[Any]


class QuizSubmitResponse(BaseModel):
    score: float
    total: int
    percentage: float
    results: list[dict]


class ProgressResponse(BaseModel):
    id: int
    topic: str
    accuracy: float
    completion_status: str
    updated_at: datetime

    class Config:
        from_attributes = True


class StudyPlanCreate(BaseModel):
    date: datetime
    tasks: str
    goal: str = ""


class StudyPlanResponse(BaseModel):
    id: int
    date: datetime
    tasks: str
    goal: str
    completed: bool

    class Config:
        from_attributes = True


class StudyPlanGenerateRequest(BaseModel):
    exam_date: datetime
    hours_per_day: int = Field(default=2, ge=1, le=12)
    subjects: list[str] = []


class AnalyticsResponse(BaseModel):
    performance_trends: list[dict]
    quiz_accuracy: float
    topic_mastery: list[dict]
    total_quizzes: int
    average_score: float


class WeakTopicsResponse(BaseModel):
    weak_topics: list[dict]
    recommendations: list[str]


class PredictionResponse(BaseModel):
    predicted_score: float
    risk_level: str
    improvement_suggestions: list[str]
