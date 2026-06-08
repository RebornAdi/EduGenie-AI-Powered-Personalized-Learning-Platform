from pydantic import BaseModel


class TutorRequest(BaseModel):
    subject_id: int
    question: str


class TutorResponse(BaseModel):
    answer: str