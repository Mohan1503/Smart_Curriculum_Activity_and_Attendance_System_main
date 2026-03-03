from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import db, schemas
from backend.services.timetable_engine import TimetableEngine

router = APIRouter(
    prefix="/timetable",
    tags=["timetable"]
)

@router.post("/generate")
def generate_timetable(request: schemas.GenerateRequest, db: Session = Depends(db.get_db)):
    engine = TimetableEngine(db)
    result = engine.generate_timetable(request.semester_type)
    
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["error"])
        
    return result
