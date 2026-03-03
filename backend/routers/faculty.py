from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import db, models, schemas

router = APIRouter(
    prefix="/faculty",
    tags=["faculty"]
)

@router.post("/", response_model=schemas.FacultyResponse)
def create_faculty(faculty: schemas.FacultyCreate, db: Session = Depends(db.get_db)):
    db_faculty = db.query(models.Faculty).filter(models.Faculty.email == faculty.email).first()
    if db_faculty:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_faculty = models.Faculty(**faculty.dict())
    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)
    return new_faculty

@router.get("/", response_model=List[schemas.FacultyResponse])
def read_faculty(skip: int = 0, limit: int = 100, db: Session = Depends(db.get_db)):
    return db.query(models.Faculty).offset(skip).limit(limit).all()

@router.get("/{faculty_id}", response_model=schemas.FacultyResponse)
def read_faculty_by_id(faculty_id: int, db: Session = Depends(db.get_db)):
    faculty = db.query(models.Faculty).filter(models.Faculty.id == faculty_id).first()
    if faculty is None:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return faculty
