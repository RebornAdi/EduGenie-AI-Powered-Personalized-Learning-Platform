from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.models import Progress, QuizAttempt, User
from app.schemas.schemas import AnalyticsResponse, PredictionResponse, WeakTopicsResponse
from app.services.ml_service import (
    ai_improvement_suggestions,
    detect_weak_topics,
    generate_recommendations,
    predict_performance,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=AnalyticsResponse)
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == user.id)
        .order_by(QuizAttempt.attempted_at.asc())
        .all()
    )

    progress_records = db.query(Progress).filter(Progress.user_id == user.id).all()

    performance_trends = []
    for attempt in attempts:
        pct = (attempt.score / attempt.total_questions * 100) if attempt.total_questions else 0
        performance_trends.append({
            "date": attempt.attempted_at.isoformat(),
            "score": round(pct, 1),
        })

    total_quizzes = len(attempts)
    if total_quizzes:
        average_score = sum(
            (a.score / a.total_questions * 100) if a.total_questions else 0 for a in attempts
        ) / total_quizzes
        quiz_accuracy = round(average_score, 1)
    else:
        quiz_accuracy = 0.0
        average_score = 0.0

    topic_mastery = [
        {"topic": p.topic, "accuracy": p.accuracy, "status": p.completion_status}
        for p in progress_records
    ]

    return AnalyticsResponse(
        performance_trends=performance_trends,
        quiz_accuracy=quiz_accuracy,
        topic_mastery=topic_mastery,
        total_quizzes=total_quizzes,
        average_score=round(average_score, 1),
    )


@router.get("/weak-topics", response_model=WeakTopicsResponse)
def get_weak_topics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress_records = db.query(Progress).filter(Progress.user_id == user.id).all()
    progress_data = [{"topic": p.topic, "accuracy": p.accuracy} for p in progress_records]

    weak = detect_weak_topics(progress_data)
    scores = [a.score / a.total_questions * 100 for a in user.quiz_attempts if a.total_questions]
    performance = predict_performance(scores)
    recommendations = generate_recommendations(weak, performance)

    return WeakTopicsResponse(weak_topics=weak, recommendations=recommendations)


@router.get("/prediction", response_model=PredictionResponse)
def get_prediction(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user.id).all()
    scores = [
        (a.score / a.total_questions * 100) if a.total_questions else 0
        for a in attempts
    ]

    performance = predict_performance(scores)
    progress_records = db.query(Progress).filter(Progress.user_id == user.id).all()
    progress_data = [{"topic": p.topic, "accuracy": p.accuracy} for p in progress_records]
    weak = detect_weak_topics(progress_data)

    suggestions = ai_improvement_suggestions(weak, performance["predicted_score"])

    return PredictionResponse(
        predicted_score=performance["predicted_score"],
        risk_level=performance["risk_level"],
        improvement_suggestions=suggestions,
    )
