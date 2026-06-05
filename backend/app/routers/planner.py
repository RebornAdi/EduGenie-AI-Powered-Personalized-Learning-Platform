from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.models import Progress, StudyPlan, Subject, User
from app.schemas.schemas import StudyPlanCreate, StudyPlanGenerateRequest, StudyPlanResponse
from app.services.ml_service import detect_weak_topics, generate_study_plan

router = APIRouter(prefix="/planner", tags=["Study Planner"])


@router.post("/plans", response_model=StudyPlanResponse)
def create_plan(
    data: StudyPlanCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = StudyPlan(
        user_id=user.id,
        date=data.date,
        tasks=data.tasks,
        goal=data.goal,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return StudyPlanResponse.model_validate(plan)


@router.get("/plans", response_model=list[StudyPlanResponse])
def list_plans(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plans = (
        db.query(StudyPlan)
        .filter(StudyPlan.user_id == user.id)
        .order_by(StudyPlan.date.asc())
        .all()
    )
    return [StudyPlanResponse.model_validate(p) for p in plans]


@router.post("/generate", response_model=list[StudyPlanResponse])
def generate_plans(
    data: StudyPlanGenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress_records = db.query(Progress).filter(Progress.user_id == user.id).all()
    progress_data = [{"topic": p.topic, "accuracy": p.accuracy} for p in progress_records]
    weak = detect_weak_topics(progress_data)
    weak_topics = [w["topic"] for w in weak]

    subjects = data.subjects
    if not subjects:
        user_subjects = db.query(Subject).filter(Subject.user_id == user.id).all()
        subjects = [s.name for s in user_subjects]

    days_until = max(1, (data.exam_date - datetime.utcnow()).days)
    generated = generate_study_plan(weak_topics, subjects, data.hours_per_day, days_until)

    created_plans = []
    for item in generated:
        plan_date = datetime.utcnow() + timedelta(days=item["day"] - 1)
        plan = StudyPlan(
            user_id=user.id,
            date=plan_date,
            tasks=item["tasks"],
            goal=f"Focus: {item['focus']}",
        )
        db.add(plan)
        created_plans.append(plan)

    db.commit()
    for plan in created_plans:
        db.refresh(plan)

    return [StudyPlanResponse.model_validate(p) for p in created_plans]


@router.patch("/plans/{plan_id}/complete", response_model=StudyPlanResponse)
def complete_plan(
    plan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == user.id).first()
    if not plan:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Plan not found")

    plan.completed = True
    db.commit()
    db.refresh(plan)
    return StudyPlanResponse.model_validate(plan)
