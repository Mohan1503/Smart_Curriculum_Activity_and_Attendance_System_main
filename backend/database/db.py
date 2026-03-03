import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Use MySQL connection from environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:YOUR_PASSWORD@yamabiko.proxy.rlwy.net:18691/railway"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()