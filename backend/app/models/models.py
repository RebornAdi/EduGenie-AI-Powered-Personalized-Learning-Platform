from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    subjects: Mapped[list["Subject"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    quiz_attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    progress_records: Mapped[list["Progress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    study_plans: Mapped[list["StudyPlan"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    user: Mapped["User"] = relationship(back_populates="subjects")
    notes: Mapped[list["Note"]] = relationship(back_populates="subject", cascade="all, delete-orphan")


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    upload_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    subject: Mapped["Subject"] = relationship(back_populates="notes")


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String(200), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")
    questions_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="quiz", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    answers_json: Mapped[str] = mapped_column(Text, nullable=False)
    attempted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    quiz: Mapped["Quiz"] = relationship(back_populates="attempts")
    user: Mapped["User"] = relationship(back_populates="quiz_attempts")


class Progress(Base):
    __tablename__ = "progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String(200), nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    completion_status: Mapped[str] = mapped_column(String(50), default="in_progress")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="progress_records")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    tasks: Mapped[str] = mapped_column(Text, nullable=False)
    goal: Mapped[str] = mapped_column(String(200), default="")
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="study_plans")
