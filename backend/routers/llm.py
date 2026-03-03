from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from backend.services.groq_service import groq_service

router = APIRouter(
    prefix="/llm",
    tags=["llm"]
)

class AnalysisRequest(BaseModel):
    data: Dict[str, Any]

class TextRequest(BaseModel):
    text: str

@router.post("/analyze-conflict")
async def analyze_conflict(request: AnalysisRequest):
    return groq_service.analyze_conflict(request.data)

@router.post("/optimize")
async def optimize_schedule(request: AnalysisRequest):
    return groq_service.optimize_schedule(request.data)

@router.post("/constraint")
async def parse_constraint(request: TextRequest):
    return groq_service.natural_language_to_constraint(request.text)
