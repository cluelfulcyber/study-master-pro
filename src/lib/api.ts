const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface StudySession {
  id: string;
  subject: string;
  difficulty: string;
  summary: string;
  created_at: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizResult {
  id: string;
  session_id: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_taken_seconds?: number;
  created_at: string;
  subject?: string;
  difficulty?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async signup(email: string, password: string, full_name?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, full_name }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = typeof error.detail === 'string' 
        ? error.detail 
        : error.message || 'Signup failed. Please try again.';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = typeof error.detail === 'string' 
        ? error.detail 
        : error.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async logout(): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    this.clearToken();
  }

  async getUser(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/user`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return response.json();
  }

  async generateSummary(subject: string, difficulty: string, language: string = 'en'): Promise<{ summary: string; session_id: string }> {
    const response = await fetch(`${API_URL}/generate-summary`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ subject, difficulty, language }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate summary');
    }

    return response.json();
  }

  async generateQuiz(subject: string, session_id: string, language: string = 'en'): Promise<{ questions: QuizQuestion[] }> {
    const response = await fetch(`${API_URL}/generate-quiz`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ subject, session_id, language }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate quiz');
    }

    return response.json();
  }

  async getStudySessions(): Promise<StudySession[]> {
    const response = await fetch(`${API_URL}/study-sessions`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get study sessions');
    }

    return response.json();
  }

  async deleteStudySession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_URL}/study-sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete study session');
    }
  }

  async saveQuizResult(
    session_id: string,
    total_questions: number,
    correct_answers: number,
    score_percentage: number,
    time_taken_seconds?: number
  ): Promise<QuizResult> {
    const response = await fetch(`${API_URL}/quiz-results`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        session_id,
        total_questions,
        correct_answers,
        score_percentage,
        time_taken_seconds,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save quiz result');
    }

    return response.json();
  }

  async getQuizResults(): Promise<QuizResult[]> {
    const response = await fetch(`${API_URL}/quiz-results`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get quiz results');
    }

    return response.json();
  }
}

export const api = new ApiClient();
export type { AuthResponse, User, StudySession, QuizQuestion, QuizResult };
