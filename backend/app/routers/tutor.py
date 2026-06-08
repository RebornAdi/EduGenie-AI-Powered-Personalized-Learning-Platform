from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.material import Material
from app.models.user import User

from app.schemas.tutor import (
    TutorRequest,
    TutorResponse,
)

from app.core.dependencies import get_current_user

from app.services.ollama_service import ask_ollama

router = APIRouter(
    prefix="/tutor",
    tags=["AI Tutor"],
)

@router.post(
    "",
    response_model=TutorResponse,
)
def ask_tutor(
    request: TutorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    materials = (
        db.query(Material)
        .filter(
            Material.subject_id ==
            request.subject_id
        )
        .all()
    )

    context = ""

    for material in materials:
        if material.content:
            context += material.content[:5000]

    prompt = f"""
        You are EduGenie AI Tutor.

        Rules:
        - Answer using ONLY the study material.
        - Use markdown formatting.
        - Use headings.
        - Use bullet points.
        - Explain clearly for engineering students.
        - Give examples whenever possible.
        - If information is unavailable, say so.

        Study Material:

        {context}

        Student Question:

        {request.question}
        """
    answer = ask_ollama(prompt)

    return {
        "answer": answer
    }