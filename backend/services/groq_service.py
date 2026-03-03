import os
from groq import Groq
import json
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = "llama-3.1-70b-versatile"

    def analyze_conflict(self, conflict_details: dict):
        """
        Explains a timetable conflict in plain English.
        """
        prompt = f"""
        You are an expert academic scheduler. Analyze the following timetable conflict and explain it clearly to a faculty member.
        Suggest a specific resolution if possible.
        
        Conflict Details:
        {json.dumps(conflict_details, indent=2)}
        
        Output Format: JSON with keys "explanation" and "suggestion".
        """
        
        return self._get_json_response(prompt)

    def optimize_schedule(self, metrics: dict):
        """
        Analyzes schedule metrics and suggests optimizations.
        """
        prompt = f"""
        Analyze these timetable metrics and suggest 3 high-impact improvements to reduce idle time and improve room utilization.
        
        Metrics:
        {json.dumps(metrics, indent=2)}
        
        Output Format: JSON with key "suggestions" (list of strings).
        """
        
        return self._get_json_response(prompt)
    
    def natural_language_to_constraint(self, text: str):
        """
        Converts natural language input into a structured constraint JSON.
        """
        prompt = f"""
        Convert this natural language constraint into a structured JSON object for a timetable system.
        
        Input: "{text}"
        
        Possible Constraint Types:
        - "MAX_HOURS": {{ "type": "max_hours", "faculty_id": <id>, "value": <int> }}
        - "NO_CLASS": {{ "type": "no_class", "faculty_id": <id>, "day": <day>, "slots": [<times>] }}
        - "ROOM_REQ": {{ "type": "room_requirement", "course_id": <id>, "room_feature": <feature> }}
        
        Return ONLY the valid JSON.
        """
        
        return self._get_json_response(prompt)

    def _get_json_response(self, prompt: str):
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that outputs strictly JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            return {"error": str(e)}

groq_service = GroqService()
