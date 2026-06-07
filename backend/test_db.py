from sqlalchemy import text

from app.database.database import engine


with engine.connect() as connection:
    result = connection.execute(text("SELECT version();"))

    for row in result:
        print(row[0])

print("Database connection successful!")