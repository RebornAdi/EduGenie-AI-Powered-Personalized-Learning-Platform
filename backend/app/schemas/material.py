from datetime import datetime
from pydantic import BaseModel


class MaterialResponse(BaseModel):
    id: int
    title: str
    file_path: str
    subject_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True