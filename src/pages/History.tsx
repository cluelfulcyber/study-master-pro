import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, Calendar, TrendingUp, Award, Target } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

interface StudySession {
  id: string;
  subject: string;
  difficulty: string;
  created_at: string;
  quiz_results?: {
    score_percentage: number;
    correct_answers: number;
    total_questions: number;
  }[];
}

const History = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalQuizzes: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchHistory();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .select(`
          *,
          quiz_results (
            score_percentage,
            correct_answers,
            total_questions
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSessions(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: StudySession[]) => {
    const totalSessions = data.length;
    const sessionsWithQuizzes = data.filter((s) => s.quiz_results && s.quiz_results.length > 0);
    const totalQuizzes = sessionsWithQuizzes.length;
    const averageScore =
      totalQuizzes > 0
        ? sessionsWithQuizzes.reduce((acc, s) => acc + (s.quiz_results?.[0]?.score_percentage || 0), 0) / totalQuizzes
        : 0;

    setStats({ totalSessions, averageScore, totalQuizzes });
  };

  const chartData = sessions
    .filter((s) => s.quiz_results && s.quiz_results.length > 0)
    .slice(0, 10)
    .reverse()
    .map((s) => ({
      subject: s.subject.slice(0, 15) + (s.subject.length > 15 ? "..." : ""),
      score: s.quiz_results?.[0]?.score_percentage || 0,
    }));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "simple":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "normal":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "advanced":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "simple":
        return t("simple");
      case "normal":
        return t("normal");
      case "advanced":
        return t("advanced");
      default:
        return difficulty;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <header className="border-b border-border/50 bg-card/95 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: "var(--gradient-primary)" }}>
              <Brain className="w-6 h-6 text-primary-foreground relative z-10" />
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LimbusMentor
              </h1>
              <p className="text-xs text-muted-foreground">{t("studyHistory")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Button onClick={() => navigate("/study")} variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t("backToStudy")}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t("studyHistory")}</h1>
          <p className="text-muted-foreground">{t("learningSessionsAchievements")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalSessions")}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">{t("sessionsCompleted")}</p>
              </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("averageScore")}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{t("acrossAllQuizzes")}</p>
              </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("quizzesTaken")}</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                <p className="text-xs text-muted-foreground">{t("testsCompleted")}</p>
              </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("performanceOverview")}</CardTitle>
              <CardDescription>{t("recentQuizScores")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t("yourStudyJourney")}
            </CardTitle>
            <CardDescription>{t("learningSessionsAchievements")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">{t("generating")}</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">{t("noStudySessions")}</p>
                <Button onClick={() => navigate("/study")} style={{ background: "var(--gradient-primary)" }}>
                  {t("startStudying")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{session.subject}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {t("completedOn")} {format(new Date(session.created_at), "MMM dd, yyyy 'at' HH:mm")}
                        </div>
                      </div>
                      <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>
                        {getDifficultyLabel(session.difficulty)}
                      </Badge>
                    </div>

                    {session.quiz_results && session.quiz_results.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("score")}</span>
                          <span className="font-semibold">
                            {session.quiz_results[0].correct_answers} / {session.quiz_results[0].total_questions} (
                            {session.quiz_results[0].score_percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={session.quiz_results[0].score_percentage} className="h-2" />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">{t("noQuizTaken")}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
