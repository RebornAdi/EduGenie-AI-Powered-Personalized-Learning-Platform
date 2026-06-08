from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.subject import Subject
from app.models.user import User

from app.schemas.subject import (
    SubjectCreate,
    SubjectResponse,
)

from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"],
)


@router.post(
    "",
    response_model=SubjectResponse,
)
def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_subject = Subject(
        name=subject.name,
        user_id=current_user.id,
    )

    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)

    return new_subject


@router.get(
    "",
    response_model=list[SubjectResponse],
)
def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Subject)
        .filter(
            Subject.user_id == current_user.id
        )
        .all()
    )