from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

from database import get_db, engine
import models
import schemas
from auth import create_access_token, verify_password, get_password_hash, decode_token
from ai_service import generate_summary_with_ai, generate_quiz_with_ai

load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LimbusMentor API")

# CORS - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

security = HTTPBearer()

# Auth dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(models.User).filter(models.User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Auth endpoints
@app.post("/auth/signup", response_model=schemas.AuthResponse)
async def signup(user_data: schemas.UserSignup, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        user = models.User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")

@app.post("/auth/login", response_model=schemas.AuthResponse)
async def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name
        }
    }

@app.get("/auth/user", response_model=schemas.User)
async def get_user(current_user: models.User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name
    }

@app.post("/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}

# Study sessions endpoints
@app.post("/generate-summary", response_model=schemas.SummaryResponse)
async def generate_summary(
    request: schemas.GenerateSummaryRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate input
    subject = request.subject.strip()
    if len(subject) < 3 or len(subject) > 500:
        raise HTTPException(status_code=400, detail="Subject must be between 3 and 500 characters")
    
    # Generate summary using OpenAI
    try:
        summary = await generate_summary_with_ai(subject, request.difficulty, request.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")
    
    # Save to database
    session = models.StudySession(
        user_id=current_user.id,
        subject=subject,
        difficulty=request.difficulty,
        summary=summary
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {
        "summary": summary,
        "session_id": str(session.id)
    }

@app.post("/generate-quiz", response_model=schemas.QuizResponse)
async def generate_quiz(
    request: schemas.GenerateQuizRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate input
    subject = request.subject.strip()
    if len(subject) < 3 or len(subject) > 500:
        raise HTTPException(status_code=400, detail="Subject must be between 3 and 500 characters")
    
    # Verify session exists and belongs to user
    session = db.query(models.StudySession).filter(
        models.StudySession.id == request.session_id,
        models.StudySession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    
    # Generate quiz using OpenAI
    try:
        questions = await generate_quiz_with_ai(subject, request.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")
    
    return {"questions": questions}

@app.get("/study-sessions", response_model=list[schemas.StudySessionResponse])
async def get_study_sessions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(models.StudySession).filter(
        models.StudySession.user_id == current_user.id
    ).order_by(models.StudySession.created_at.desc()).all()
    
    return [
        {
            "id": str(s.id),
            "subject": s.subject,
            "difficulty": s.difficulty,
            "summary": s.summary,
            "created_at": s.created_at.isoformat()
        }
        for s in sessions
    ]

@app.delete("/study-sessions/{session_id}")
async def delete_study_session(
    session_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(models.StudySession).filter(
        models.StudySession.id == session_id,
        models.StudySession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    
    db.delete(session)
    db.commit()
    
    return {"message": "Session deleted successfully"}

@app.post("/quiz-results", response_model=schemas.QuizResultResponse)
async def save_quiz_result(
    result: schemas.SaveQuizResultRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify session exists and belongs to user
    session = db.query(models.StudySession).filter(
        models.StudySession.id == result.session_id,
        models.StudySession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    
    # Create quiz result
    quiz_result = models.QuizResult(
        user_id=current_user.id,
        session_id=result.session_id,
        total_questions=result.total_questions,
        correct_answers=result.correct_answers,
        score_percentage=result.score_percentage,
        time_taken_seconds=result.time_taken_seconds
    )
    db.add(quiz_result)
    db.commit()
    db.refresh(quiz_result)
    
    return {
        "id": str(quiz_result.id),
        "session_id": str(quiz_result.session_id),
        "total_questions": quiz_result.total_questions,
        "correct_answers": quiz_result.correct_answers,
        "score_percentage": float(quiz_result.score_percentage),
        "time_taken_seconds": quiz_result.time_taken_seconds,
        "created_at": quiz_result.created_at.isoformat()
    }

@app.get("/quiz-results", response_model=list[schemas.QuizResultWithSessionResponse])
async def get_quiz_results(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(models.QuizResult, models.StudySession).join(
        models.StudySession,
        models.QuizResult.session_id == models.StudySession.id
    ).filter(
        models.QuizResult.user_id == current_user.id
    ).order_by(models.QuizResult.created_at.desc()).all()
    
    return [
        {
            "id": str(r.QuizResult.id),
            "session_id": str(r.QuizResult.session_id),
            "total_questions": r.QuizResult.total_questions,
            "correct_answers": r.QuizResult.correct_answers,
            "score_percentage": float(r.QuizResult.score_percentage),
            "time_taken_seconds": r.QuizResult.time_taken_seconds,
            "created_at": r.QuizResult.created_at.isoformat(),
            "subject": r.StudySession.subject,
            "difficulty": r.StudySession.difficulty
        }
        for r in results
    ]

@app.get("/")
async def root():
    return {"message": "LimbusMentor API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
