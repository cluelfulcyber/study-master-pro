# LimbusMentor Backend

Python FastAPI backend with PostgreSQL database.

## Setup

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows - Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   psql postgres
   CREATE DATABASE limbus_mentor;
   \q
   ```

3. **Install Python Dependencies**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY and update DATABASE_URL if needed
   ```

5. **Run Backend**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Schema

The application automatically creates the following tables:
- `users` - User authentication
- `profiles` - User profiles
- `study_sessions` - Study summaries
- `quiz_results` - Quiz scores and history
