import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, Loader2, LogOut, History, BookOpen, Zap, GraduationCap } from "lucide-react";
import StudySummary from "@/components/StudySummary";
import Quiz from "@/components/Quiz";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LimbusAvatar } from "@/components/LimbusAvatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type DifficultyLevel = "simple" | "normal" | "advanced";

const Study = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("normal");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const generateSummary = async () => {
    if (!subject.trim()) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("errorSubjectRequired"),
      });
      return;
    }

    setLoading(true);
    setSummary("");
    setShowQuiz(false);
    setSessionId(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-summary", {
        body: { subject, difficulty, language },
      });

      if (error) throw error;

      setSummary(data.summary);
      setSessionId(data.sessionId);

      toast({
        title: t("summaryGenerated"),
        description: t("summaryGeneratedDesc"),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message || t("errorGenerating"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = () => {
    setSubject("");
    setSummary("");
    setShowQuiz(false);
    setSessionId(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      {/* Header */}
      <header className="border-b border-border/50 bg-card/95 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: "var(--gradient-primary)" }}>
              <Brain className="w-6 h-6 text-primary-foreground relative z-10" />
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xl block">LimbusMentor</span>
              <span className="text-xs text-muted-foreground">Guided by Limbus</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              <History className="w-4 h-4 mr-2" />
              {t("viewHistory")}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              {t("signOut")}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!summary ? (
          <div className="space-y-8">
            {/* Lore Section with Limbus Avatar */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <LimbusAvatar 
                  message={t("limbusGreeting")}
                />
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader className="text-center space-y-4 pb-8 border-b border-border/50">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                    <BookOpen className="w-9 h-9 text-primary-foreground relative z-10" />
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
                <CardTitle className="text-3xl md:text-4xl">{t("enterSubject")}</CardTitle>
                <CardDescription className="text-base">
                  {t("selectDifficulty")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">{t("enterSubject")}</label>
                  <Textarea
                    placeholder={t("enterSubjectPlaceholder")}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="min-h-[120px] resize-none text-base border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-foreground">{t("selectDifficulty")}</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setDifficulty("simple")}
                      className={cn(
                        "relative p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-105",
                        difficulty === "simple"
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                        difficulty === "simple" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                      )}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{t("simple")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("simpleDesc")}
                      </p>
                      {difficulty === "simple" && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDifficulty("normal")}
                      className={cn(
                        "relative p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-105",
                        difficulty === "normal"
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                        difficulty === "normal" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                      )}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{t("normal")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("normalDesc")}
                      </p>
                      {difficulty === "normal" && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDifficulty("advanced")}
                      className={cn(
                        "relative p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-105",
                        difficulty === "advanced"
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                        difficulty === "advanced" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                      )}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Advanced</h3>
                      <p className="text-sm text-muted-foreground">
                        In-depth technical details for expert-level insight
                      </p>
                      {difficulty === "advanced" && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={generateSummary}
                  disabled={loading}
                  className="w-full h-14 text-base font-semibold relative overflow-hidden group"
                  style={{ background: loading ? undefined : "var(--gradient-primary)" }}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("generating")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        {t("generateSummary")}
                      </>
                    )}
                  </span>
                  {!loading && (
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : !showQuiz ? (
          <StudySummary
            summary={summary}
            onStartQuiz={handleStartQuiz}
            onNewTopic={() => {
              setSubject("");
              setSummary("");
            }}
          />
        ) : (
          <Quiz
            sessionId={sessionId!}
            subject={subject}
            language={language}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Study;
