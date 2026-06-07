from app.database.database import Base, engine

# Import models
from app.models.user import User


Base.metadata.create_all(bind=engine)

print("Tables created successfully!")