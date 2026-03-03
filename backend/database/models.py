from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON, Float, Time, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class ProgramType(str, enum.Enum):
    FYUP = "FYUP"
    BED = "B.Ed"
    MED = "M.Ed"
    ITEP = "ITEP"

class SemesterType(str, enum.Enum):
    ODD = "ODD"
    EVEN = "EVEN"

class DayOfWeek(str, enum.Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"

class Program(Base):
    __tablename__ = "programs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g., "B.Tech Computer Science"
    program_type = Column(String, index=True) # Enum: FYUP, B.Ed, etc.
    duration_years = Column(Integer)
    
    branches = relationship("Branch", back_populates="program")

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # e.g., "CSE", "ECE"
    program_id = Column(Integer, ForeignKey("programs.id"))
    
    program = relationship("Program", back_populates="branches")
    semesters = relationship("AcademicSemester", back_populates="branch")

class AcademicSemester(Base):
    __tablename__ = "academic_semesters"
    
    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    semester_number = Column(Integer) # 1, 2, 3...
    semester_type = Column(String) # ODD/EVEN
    student_count = Column(Integer, default=60)
    
    branch = relationship("Branch", back_populates="semesters")
    courses = relationship("Course", back_populates="semester")

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g., "LAB-101", "CR-202"
    capacity = Column(Integer)
    is_lab = Column(Boolean, default=False)
    resources = Column(JSON, default={}) # e.g., {"projector": true}

class Faculty(Base):
    __tablename__ = "faculty"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department = Column(String)
    max_hours_per_week = Column(Integer, default=18)
    preferred_slots = Column(JSON, default=[]) # List of preferred {day, time}
    unavailable_slots = Column(JSON, default=[]) # List of unavailable {day, time}
    
    courses = relationship("FacultyCourseMap", back_populates="faculty")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True) # e.g., "CS101"
    name = Column(String)
    semester_id = Column(Integer, ForeignKey("academic_semesters.id"))
    
    theory_hours = Column(Integer, default=3)
    practical_hours = Column(Integer, default=0)
    tutorial_hours = Column(Integer, default=0)
    credits = Column(Integer)
    is_core = Column(Boolean, default=True)
    requires_lab = Column(Boolean, default=False)
    
    semester = relationship("AcademicSemester", back_populates="courses")
    allocations = relationship("FacultyCourseMap", back_populates="course")

class FacultyCourseMap(Base):
    __tablename__ = "faculty_course_map"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    is_primary = Column(Boolean, default=True) # For shared courses
    
    faculty = relationship("Faculty", back_populates="courses")
    course = relationship("Course", back_populates="allocations")

class TimetableEntry(Base):
    __tablename__ = "timetable_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    day = Column(String) # MONDAY, TUESDAY...
    start_time = Column(Time)
    end_time = Column(Time)
    
    semester_id = Column(Integer, ForeignKey("academic_semesters.id")) # Which batch
    course_id = Column(Integer, ForeignKey("courses.id"))
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    
    is_lab = Column(Boolean, default=False)
