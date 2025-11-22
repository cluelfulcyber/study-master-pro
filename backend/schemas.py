from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class GenerateSummaryRequest(BaseModel):
    subject: str
    difficulty: str
    language: str = "en"

class SummaryResponse(BaseModel):
    summary: str
    session_id: str

class GenerateQuizRequest(BaseModel):
    subject: str
    session_id: str
    language: str = "en"

class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct: int
    explanation: str

class QuizResponse(BaseModel):
    questions: list[QuizQuestion]

class StudySessionResponse(BaseModel):
    id: str
    subject: str
    difficulty: str
    summary: str
    created_at: str

class SaveQuizResultRequest(BaseModel):
    session_id: str
    total_questions: int
    correct_answers: int
    score_percentage: float
    time_taken_seconds: Optional[int] = None

class QuizResultResponse(BaseModel):
    id: str
    session_id: str
    total_questions: int
    correct_answers: int
    score_percentage: float
    time_taken_seconds: Optional[int]
    created_at: str

class QuizResultWithSessionResponse(QuizResultResponse):
    subject: str
    difficulty: str
