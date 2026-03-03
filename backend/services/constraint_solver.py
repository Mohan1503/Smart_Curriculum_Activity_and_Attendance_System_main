from ortools.sat.python import cp_model
from backend.database import models
from typing import List, Dict

class TimetableSolver:
    def __init__(self, data: Dict):
        self.data = data
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.status = None
        self.variables = {}  # (course_id, type) -> [(day, slot, room, var), ...]

        # Constants
        self.DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
        self.SLOTS_PER_DAY = 8  # Assuming 8 slots/day
        self.all_slots = [(d, s) for d in range(len(self.DAYS)) for s in range(self.SLOTS_PER_DAY)]

    def solve(self):
        self._create_variables()
        self._add_hard_constraints()
        
        # Optimize for soft constraints (Phase 2) using hints if needed
        # self.solver.Parameters.max_time_in_seconds = 30.0
        
        self.status = self.solver.Solve(self.model)
        
        if self.status == cp_model.OPTIMAL or self.status == cp_model.FEASIBLE:
            return self._extract_solution()
        return None

    def _create_variables(self):
        """
        Create boolean variables for each course-slot-room combination.
        x[course, day, slot, room] = 1 if course is scheduled there.
        """
        for course in self.data['courses']:
            course_id = course.id
            required_hours = course.theory_hours + course.practical_hours + course.tutorial_hours
            
            # We need to schedule 'required_hours' slots for this course
            # To simplify, we treat each hour as a separate unit for now
            # In a real scenario, we might group them for labs (consecutive slots)
            
            self.variables[course_id] = []
            
            for day_idx, _ in enumerate(self.DAYS):
                for slot_idx in range(self.SLOTS_PER_DAY):
                    for room in self.data['rooms']:
                        # Domain reduction: check room capacity and type immediately
                        if room.capacity < course.student_count:
                            continue
                        if course.requires_lab and not room.is_lab:
                            continue
                        if not course.requires_lab and room.is_lab:
                            continue # Prefer lecture halls for theory

                        var_name = f"c{course_id}_d{day_idx}_s{slot_idx}_r{room.id}"
                        var = self.model.NewBoolVar(var_name)
                        self.variables[course_id].append({
                            'day': day_idx,
                            'slot': slot_idx,
                            'room': room.id,
                            'var': var
                        })

    def _add_hard_constraints(self):
        # 1. Each course must be scheduled exactly for its required hours
        for course in self.data['courses']:
            total_vars = [v['var'] for v in self.variables[course.id]]
            required_slots = course.theory_hours + course.practical_hours
            self.model.Add(sum(total_vars) == required_slots)

        # 2. No room overlap: A room can hold max 1 class at a time
        room_usage = {} # (day, slot, room_id) -> list of vars
        for course_id, var_list in self.variables.items():
            for v in var_list:
                key = (v['day'], v['slot'], v['room'])
                if key not in room_usage:
                    room_usage[key] = []
                room_usage[key].append(v['var'])
        
        for key, vars_in_slot in room_usage.items():
            self.model.Add(sum(vars_in_slot) <= 1)

        # 3. No faculty overlap: A faculty can teach max 1 class at a time
        faculty_usage = {} # (day, slot, faculty_id) -> list of vars
        for course in self.data['courses']:
            faculty_id = course.faculty_id # Assuming simpler model for now: 1 faculty per course
            if not faculty_id: continue
            
            for v in self.variables[course.id]:
                key = (v['day'], v['slot'], faculty_id)
                if key not in faculty_usage:
                    faculty_usage[key] = []
                faculty_usage[key].append(v['var'])

        for key, vars_in_slot in faculty_usage.items():
            self.model.Add(sum(vars_in_slot) <= 1)

        # 4. No student overlap: A batch (semester) cannot have >1 class at a time
        batch_usage = {} # (day, slot, semester_id) -> list of vars
        for course in self.data['courses']:
            semester_id = course.semester_id
            for v in self.variables[course.id]:
                key = (v['day'], v['slot'], semester_id)
                if key not in batch_usage:
                    batch_usage[key] = []
                batch_usage[key].append(v['var'])

        for key, vars_in_slot in batch_usage.items():
            self.model.Add(sum(vars_in_slot) <= 1)

    def _extract_solution(self):
        solution = []
        for course_id, var_list in self.variables.items():
            for v in var_list:
                if self.solver.Value(v['var']) == 1:
                    solution.append({
                        "course_id": course_id,
                        "day": self.DAYS[v['day']],
                        "slot": v['slot'],
                        "room_id": v['room']
                    })
        return solution
