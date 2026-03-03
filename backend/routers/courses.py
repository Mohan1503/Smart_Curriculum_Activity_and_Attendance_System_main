from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import db, models, schemas

router = APIRouter(
    prefix="/courses",
    tags=["courses"]
)

@router.post("/", response_model=schemas.CourseResponse)
def create_course(course: schemas.CourseCreate, db: Session = Depends(db.get_db)):
    db_course = db.query(models.Course).filter(models.Course.code == course.code).first()
    if db_course:
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    new_course = models.Course(**course.dict())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.get("/", response_model=List[schemas.CourseResponse])
def read_courses(skip: int = 0, limit: int = 100, db: Session = Depends(db.get_db)):
    return db.query(models.Course).offset(skip).limit(limit).all()
