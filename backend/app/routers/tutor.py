from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import TutorMessage, TutorResponse
from app.services.rag_service import ask_tutor

router = APIRouter(prefix="/tutor", tags=["AI Tutor"])


@router.post("/chat", response_model=TutorResponse)
def chat(data: TutorMessage, user: User = Depends(get_current_user)):
    reply, sources = ask_tutor(user.id, data.message, data.subject_id)
    return TutorResponse(reply=reply, sources=sources)
