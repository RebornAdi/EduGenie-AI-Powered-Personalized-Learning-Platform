from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.material import Material
from app.models.user import User

from pypdf import PdfReader

from app.schemas.material import MaterialResponse

from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/materials",
    tags=["Materials"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post(
    "",
    response_model=MaterialResponse,
)
async def upload_material(
    subject_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    unique_name = (
        f"{uuid4()}_{file.filename}"
    )

    save_path = (
        UPLOAD_DIR / unique_name
    )

    content = await file.read()

    with open(save_path, "wb") as f:
        f.write(content)

    reader = PdfReader(str(save_path))

    text_content = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text_content += page_text + "\n"
        
    material = Material(
        title=file.filename,
        file_path=str(save_path),
        subject_id=subject_id,
        content=text_content,
    )

    db.add(material)
    db.commit()
    db.refresh(material)

    return material