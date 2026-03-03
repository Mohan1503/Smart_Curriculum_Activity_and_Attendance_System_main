from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import db, models, schemas

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"]
)

@router.post("/", response_model=schemas.RoomResponse)
def create_room(room: schemas.RoomCreate, db: Session = Depends(db.get_db)):
    db_room = db.query(models.Room).filter(models.Room.name == room.name).first()
    if db_room:
        raise HTTPException(status_code=400, detail="Room name already exists")
    
    new_room = models.Room(**room.dict())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.get("/", response_model=List[schemas.RoomResponse])
def read_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(db.get_db)):
    return db.query(models.Room).offset(skip).limit(limit).all()
