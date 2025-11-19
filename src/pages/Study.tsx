import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Sparkles, Loader2, LogOut, History, BookOpen } from "lucide-react";
import StudySummary from "@/components/StudySummary";
import Quiz from "@/components/Quiz";

type DifficultyLevel = "simple" | "normal" | "advanced";

const Study = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
        title: "Error",
        description: "Please enter a subject to study",
      });
      return;
    }

    setLoading(true);
    setSummary("");
    setShowQuiz(false);
    setSessionId(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-summary", {
        body: { subject, difficulty },
      });

      if (error) throw error;

      setSummary(data.summary);
      setSessionId(data.sessionId);

      toast({
        title: "Summary generated!",
        description: "Your study material is ready. Take the quiz when you're ready.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate summary",
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
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">StudyAI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {!summary ? (
          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                  <BookOpen className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl">What would you like to learn today?</CardTitle>
              <CardDescription className="text-base">
                Enter a subject and select your preferred difficulty level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject or Topic</label>
                <Textarea
                  placeholder="e.g., Heap memory in C, Photosynthesis, French Revolution..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select value={difficulty} onValueChange={(value: DifficultyLevel) => setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Simple</span>
                        <span className="text-xs text-muted-foreground">Easy to understand, beginner-friendly</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="normal">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Normal</span>
                        <span className="text-xs text-muted-foreground">Balanced detail and depth</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Advanced</span>
                        <span className="text-xs text-muted-foreground">In-depth technical details</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateSummary}
                disabled={loading}
                className="w-full h-12 text-base"
                style={{ background: loading ? undefined : "var(--gradient-primary)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating your study material...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Study Material
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
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
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Study;
