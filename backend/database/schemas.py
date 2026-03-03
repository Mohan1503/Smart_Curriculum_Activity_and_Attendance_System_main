from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from enum import Enum
from datetime import time

# Enums
class ProgramType(str, Enum):
    FYUP = "FYUP"
    BED = "B.Ed"
    MED = "M.Ed"
    ITEP = "ITEP"

class SemesterType(str, Enum):
    ODD = "ODD"
    EVEN = "EVEN"

class DayOfWeek(str, Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"

# --- Faculty Schemas ---
class FacultyBase(BaseModel):
    name: str
    email: EmailStr
    department: str
    max_hours_per_week: int = 18
    preferred_slots: Optional[List[Dict[str, str]]] = [] # [{"day": "MONDAY", "time": "09:00"}]
    unavailable_slots: Optional[List[Dict[str, str]]] = []

class FacultyCreate(FacultyBase):
    pass

class FacultyResponse(FacultyBase):
    id: int
    class Config:
        from_attributes = True

# --- Program & Branch Schemas ---
class BranchBase(BaseModel):
    name: str
    program_id: int

class BranchCreate(BranchBase):
    pass

class BranchResponse(BranchBase):
    id: int
    class Config:
        from_attributes = True

class ProgramBase(BaseModel):
    name: str
    program_type: ProgramType
    duration_years: int

class ProgramCreate(ProgramBase):
    pass

class ProgramResponse(ProgramBase):
    id: int
    branches: List[BranchResponse] = []
    class Config:
        from_attributes = True

# --- Course Schemas ---
class CourseBase(BaseModel):
    code: str
    name: str
    semester_id: int
    theory_hours: int = 3
    practical_hours: int = 0
    tutorial_hours: int = 0
    credits: int
    is_core: bool = True
    requires_lab: bool = False

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    class Config:
        from_attributes = True

# --- Room Schemas ---
class RoomBase(BaseModel):
    name: str
    capacity: int
    is_lab: bool = False
    resources: Dict = {}

class RoomCreate(RoomBase):
    pass

class RoomResponse(RoomBase):
    id: int
    class Config:
        from_attributes = True

# --- Timetable Schemas ---
class TimetableEntryBase(BaseModel):
    day: DayOfWeek
    start_time: time
    end_time: time
    semester_id: int
    course_id: int
    faculty_id: int
    room_id: int
    is_lab: bool

class TimetableEntryCreate(TimetableEntryBase):
    pass

class TimetableEntryResponse(TimetableEntryBase):
    id: int
    class Config:
        from_attributes = True

class GenerateRequest(BaseModel):
    academic_year: str
    semester_type: SemesterType
