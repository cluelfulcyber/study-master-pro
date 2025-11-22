import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def generate_summary_with_ai(subject: str, difficulty: str, language: str = "en") -> str:
    system_prompt = """You are an expert educational assistant. Your task is to create comprehensive, well-structured study materials.

Based on the difficulty level:
- SIMPLE: Use basic language, short paragraphs, simple examples, and focus on core concepts only. Perfect for beginners.
- NORMAL: Use moderate complexity, balanced detail, practical examples, and cover main concepts with some depth.
- ADVANCED: Use technical language, in-depth analysis, complex examples, and cover comprehensive details with nuances.

Format your response using Markdown with:
- Clear headings (## for main sections)
- Bullet points for lists
- **Bold** for key terms
- Code blocks for technical content (if applicable)
- Short, focused paragraphs

Make it engaging, accurate, and easy to scan."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Create a {difficulty} level study summary for: {subject}"}
            ]
        )
        
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")

async def generate_quiz_with_ai(subject: str, language: str = "en") -> list:
    language_instruction = (
        "IMPORTANT: All questions, options, and explanations MUST be in Bulgarian language."
        if language == "bg"
        else "All content should be in English."
    )
    
    system_prompt = f"""You are an expert quiz generator. {language_instruction} Create 5 multiple-choice questions about the given subject.

CRITICAL: You MUST respond with ONLY valid JSON in this EXACT format:
{{
  "questions": [
    {{
      "question": "What is...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "A brief explanation of why the correct answer is right and why others are wrong"
    }}
  ]
}}

Requirements:
- Exactly 5 questions
- Each question has exactly 4 options
- "correct" is the index (0-3) of the correct answer
- "explanation" must be a clear, concise explanation (2-3 sentences) that teaches the concept
- Questions should test understanding, not just memorization
- Options should be plausible but clearly distinct
- NO additional text, NO markdown, ONLY the JSON object"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate 5 quiz questions about: {subject}"}
            ]
        )
        
        content = response.choices[0].message.content
        
        # Clean up response
        content = content.replace("```json\n", "").replace("```\n", "").replace("```", "").strip()
        
        # Parse JSON
        import json
        parsed = json.loads(content)
        questions = parsed.get("questions", [])
        
        # Validate
        if not isinstance(questions, list) or len(questions) != 5:
            raise ValueError("Invalid number of questions")
        
        for idx, q in enumerate(questions):
            if not all(k in q for k in ["question", "options", "correct", "explanation"]):
                raise ValueError(f"Invalid question format at index {idx}")
            if not isinstance(q["options"], list) or len(q["options"]) != 4:
                raise ValueError(f"Invalid options format at index {idx}")
            if not isinstance(q["correct"], int) or q["correct"] not in range(4):
                raise ValueError(f"Invalid correct answer at index {idx}")
        
        return questions
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")
