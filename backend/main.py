from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="AI-Based Timetable System",
    description="NEP 2020 Compliant Timetable Generator",
    version="1.0.0"
)

# CORS Config
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "active", "system": "AI Timetable Generator"}

from backend.routers import faculty, courses, rooms, llm
from backend.database import models, db

# Create tables
models.Base.metadata.create_all(bind=db.engine)

app.include_router(faculty.router)
app.include_router(courses.router)
app.include_router(rooms.router)
app.include_router(llm.router)
app.include_router(timetable.router)
