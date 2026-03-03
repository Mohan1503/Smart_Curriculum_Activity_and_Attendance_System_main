from sqlalchemy.orm import Session
from backend.database import models
from backend.services.constraint_solver import TimetableSolver
# from backend.services.genetic_optimizer import GeneticOptimizer # Future
from backend.services.groq_service import groq_service

class TimetableEngine:
    def __init__(self, db: Session):
        self.db = db

    def generate_timetable(self, semester_type: str):
        # 1. Fetch Data
        raw_courses = self.db.query(models.Course).all() # Filter by active semester later
        raw_rooms = self.db.query(models.Room).all()
        # raw_faculty...
        
        # Transform data for solver
        solver_data = {
            "courses": [],
            "rooms": [],
            # ...
        }

        # Mock Object for now to match Solver expectation
        # in production, using Pydantic schemas or Dicts is cleaner
        class MockObj:
            def __init__(self, **kwargs):
                self.__dict__.update(kwargs)

        for c in raw_courses:
            # We need to fetch the primary faculty for the course
            faculty_map = self.db.query(models.FacultyCourseMap).filter_by(course_id=c.id, is_primary=True).first()
            faculty_id = faculty_map.faculty_id if faculty_map else None

            sem = self.db.query(models.AcademicSemester).filter_by(id=c.semester_id).first()
            student_count = sem.student_count if sem else 60

            solver_data["courses"].append(MockObj(
                id=c.id,
                theory_hours=c.theory_hours,
                practical_hours=c.practical_hours,
                tutorial_hours=c.tutorial_hours,
                requires_lab=c.requires_lab,
                faculty_id=faculty_id,
                semester_id=c.semester_id,
                student_count=student_count
            ))

        for r in raw_rooms:
            solver_data["rooms"].append(MockObj(
                id=r.id,
                capacity=r.capacity,
                is_lab=r.is_lab
            ))

        # 2. Run Hard Constraint Solver
        solver = TimetableSolver(solver_data)
        solution = solver.solve()

        if not solution:
            return {"status": "failed", "error": "Could not find a feasible solution satisfying all hard constraints."}

        # 3. Store Solution (basic)
        # Note: In a real run, we would wipe old entries for this semester
        generated_entries = []
        for item in solution:
            # Map back slot index to Time object if needed
            # For now just storing index logic or converting to dummy time
            
            # entry = models.TimetableEntry(...)
            # self.db.add(entry)
            generated_entries.append(item)
        
        # self.db.commit()

        # 4. Analyze with AI (Optional Sample)
        # ai_analysis = groq_service.optimize_schedule({"metrics": "sample"})
        
        return {
            "status": "success", 
            "timetable": generated_entries,
            # "ai_analysis": ai_analysis
        }
