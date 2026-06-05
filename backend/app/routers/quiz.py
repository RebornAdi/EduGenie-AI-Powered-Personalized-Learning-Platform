import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.models import Progress, Quiz, QuizAttempt, User
from app.schemas.schemas import (
    QuizGenerateRequest,
    QuizQuestion,
    QuizResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
)
from app.services.quiz_service import evaluate_answers, generate_quiz

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.post("/generate", response_model=QuizResponse)
def create_quiz(
    data: QuizGenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    questions = generate_quiz(
        user.id,
        data.topic,
        data.difficulty,
        data.num_questions,
        data.subject_id,
    )

    quiz = Quiz(
        user_id=user.id,
        topic=data.topic,
        difficulty=data.difficulty,
        questions_json=json.dumps(questions),
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return QuizResponse(
        id=quiz.id,
        topic=quiz.topic,
        difficulty=quiz.difficulty,
        questions=[QuizQuestion(**q) for q in questions],
        created_at=quiz.created_at,
    )


@router.get("/history", response_model=list[QuizResponse])
def quiz_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).filter(Quiz.user_id == user.id).order_by(Quiz.created_at.desc()).limit(20).all()
    result = []
    for quiz in quizzes:
        questions = json.loads(quiz.questions_json)
        result.append(QuizResponse(
            id=quiz.id,
            topic=quiz.topic,
            difficulty=quiz.difficulty,
            questions=[QuizQuestion(**q) for q in questions],
            created_at=quiz.created_at,
        ))
    return result


@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    quiz_id: int,
    data: QuizSubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = json.loads(quiz.questions_json)
    score, results = evaluate_answers(questions, data.answers)
    total = len(questions)
    percentage = (score / total * 100) if total else 0

    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=user.id,
        score=score,
        total_questions=total,
        answers_json=json.dumps(data.answers),
    )
    db.add(attempt)

    progress = db.query(Progress).filter(
        Progress.user_id == user.id,
        Progress.topic == quiz.topic,
    ).first()

    if progress:
        progress.accuracy = percentage
        progress.completion_status = "completed" if percentage >= 70 else "in_progress"
        progress.updated_at = datetime.utcnow()
    else:
        progress = Progress(
            user_id=user.id,
            topic=quiz.topic,
            accuracy=percentage,
            completion_status="completed" if percentage >= 70 else "in_progress",
        )
        db.add(progress)

    db.commit()

    return QuizSubmitResponse(
        score=score,
        total=total,
        percentage=round(percentage, 1),
        results=results,
    )
