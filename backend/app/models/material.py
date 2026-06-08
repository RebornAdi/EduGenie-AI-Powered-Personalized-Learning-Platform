from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
)

from app.database.database import Base

from sqlalchemy import Text

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True)

    title = Column(String, nullable=False)

    file_path = Column(String, nullable=False)

    content = Column(Text, nullable=True)

    subject_id = Column(
        Integer,
        ForeignKey("subjects.id"),
        nullable=False,
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow,
    )