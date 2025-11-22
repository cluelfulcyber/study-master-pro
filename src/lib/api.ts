const FASTAPI_BASE_URL =
  import.meta.env.VITE_API_URL || "https://study-master-pro-production.up.railway.app";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

const PROXY_FUNCTION_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/fastapi-proxy`
  : null;

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
    this.token = localStorage.getItem("auth_token");
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request(path: string, options: RequestInit = {}): Promise<Response> {
    const headers = this.getHeaders();
    const mergedHeaders: HeadersInit = {
      ...headers,
      ...(options.headers || {}),
    };

    // Use proxy edge function when available to avoid CORS issues
    if (PROXY_FUNCTION_URL) {
      const url = new URL(PROXY_FUNCTION_URL);
      url.searchParams.set("path", path);
      if (options.method) {
        url.searchParams.set("method", String(options.method));
      }

      return fetch(url.toString(), {
        ...options,
        headers: mergedHeaders,
      });
    }

    // Fallback directly to FastAPI backend if proxy is not configured
    return fetch(`${FASTAPI_BASE_URL}${path}`, {
      ...options,
      headers: mergedHeaders,
    });
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  async signup(email: string, password: string, full_name?: string): Promise<AuthResponse> {
    const response = await this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = typeof (error as any).detail === "string"
        ? (error as any).detail
        : (error as any).message || "Signup failed. Please try again.";
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as AuthResponse;
    this.setToken(data.access_token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = typeof (error as any).detail === "string"
        ? (error as any).detail
        : (error as any).message || "Login failed. Please check your credentials.";
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as AuthResponse;
    this.setToken(data.access_token);
    return data;
  }

  async logout(): Promise<void> {
    await this.request("/auth/logout", {
      method: "POST",
    });
    this.clearToken();
  }

  async getUser(): Promise<User> {
    const response = await this.request("/auth/user");

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    return (await response.json()) as User;
  }

  async generateSummary(
    subject: string,
    difficulty: string,
    language: string = "en",
  ): Promise<{ summary: string; session_id: string }> {
    const response = await this.request("/generate-summary", {
      method: "POST",
      body: JSON.stringify({ subject, difficulty, language }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).detail || "Failed to generate summary");
    }

    return (await response.json()) as { summary: string; session_id: string };
  }

  async generateQuiz(
    subject: string,
    session_id: string,
    language: string = "en",
  ): Promise<{ questions: QuizQuestion[] }> {
    const response = await this.request("/generate-quiz", {
      method: "POST",
      body: JSON.stringify({ subject, session_id, language }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).detail || "Failed to generate quiz");
    }

    return (await response.json()) as { questions: QuizQuestion[] };
  }

  async getStudySessions(): Promise<StudySession[]> {
    const response = await this.request("/study-sessions");

    if (!response.ok) {
      throw new Error("Failed to get study sessions");
    }

    return (await response.json()) as StudySession[];
  }

  async deleteStudySession(sessionId: string): Promise<void> {
    const response = await this.request(`/study-sessions/${sessionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete study session");
    }
  }

  async saveQuizResult(
    session_id: string,
    total_questions: number,
    correct_answers: number,
    score_percentage: number,
    time_taken_seconds?: number,
  ): Promise<QuizResult> {
    const response = await this.request("/quiz-results", {
      method: "POST",
      body: JSON.stringify({
        session_id,
        total_questions,
        correct_answers,
        score_percentage,
        time_taken_seconds,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).detail || "Failed to save quiz result");
    }

    return (await response.json()) as QuizResult;
  }

  async getQuizResults(): Promise<QuizResult[]> {
    const response = await this.request("/quiz-results");

    if (!response.ok) {
      throw new Error("Failed to get quiz results");
    }

    return (await response.json()) as QuizResult[];
  }
}


export const api = new ApiClient();
export type { AuthResponse, User, StudySession, QuizQuestion, QuizResult };
