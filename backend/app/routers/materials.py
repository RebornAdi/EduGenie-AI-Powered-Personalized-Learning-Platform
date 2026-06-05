import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models.models import Note, Subject, User
from app.schemas.schemas import NoteResponse, SubjectCreate, SubjectResponse
from app.services.rag_service import index_document

router = APIRouter(prefix="/materials", tags=["Study Materials"])


@router.post("/subjects", response_model=SubjectResponse)
def create_subject(data: SubjectCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subject = Subject(name=data.name, user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return SubjectResponse.model_validate(subject)


@router.get("/subjects", response_model=list[SubjectResponse])
def list_subjects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subjects = db.query(Subject).filter(Subject.user_id == user.id).all()
    return [SubjectResponse.model_validate(s) for s in subjects]


@router.post("/notes/upload", response_model=NoteResponse)
async def upload_note(
    subject_id: int = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    upload_dir = Path(settings.upload_dir) / str(user.id) / str(subject_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}.pdf"
    file_path = upload_dir / filename

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    note = Note(
        subject_id=subject_id,
        title=title,
        file_path=str(file_path),
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    try:
        index_document(user.id, subject_id, note.id, str(file_path), title)
    except Exception:
        pass

    return NoteResponse.model_validate(note)


@router.get("/notes", response_model=list[NoteResponse])
def list_notes(
    subject_id: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Note).join(Subject).filter(Subject.user_id == user.id)
    if subject_id:
        query = query.filter(Note.subject_id == subject_id)
    notes = query.order_by(Note.upload_date.desc()).all()
    return [NoteResponse.model_validate(n) for n in notes]
