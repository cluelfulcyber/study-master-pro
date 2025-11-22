import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizProps {
  sessionId: string;
  subject: string;
  language?: string;
  onComplete: () => void;
}

const Quiz = ({ sessionId, subject, language = "en", onComplete }: QuizProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const data = await api.generateQuiz(subject, sessionId, language);
      setQuestions(data.questions);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate quiz",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast({
        variant: "destructive",
        title: "Please select an answer",
      });
      return;
    }

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    const correctAnswers = finalAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === questions[idx].correct ? 1 : 0);
    }, 0);

    const scorePercentage = (correctAnswers / questions.length) * 100;
    setScore(scorePercentage);
    setShowResult(true);

    try {
      await api.saveQuizResult(
        sessionId,
        questions.length,
        correctAnswers,
        scorePercentage
      );
    } catch (error) {
      console.error("Error saving quiz result:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-border/50">
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <p className="text-muted-foreground text-lg">{t("limbusCrafting")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const correctCount = answers.reduce((acc, answer, idx) => {
      return acc + (answer === questions[idx].correct ? 1 : 0);
    }, 0);

    return (
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center border-b border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 pb-8">
            <div className="flex justify-center mb-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center relative overflow-hidden"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
              >
                <Award className="w-12 h-12 text-primary-foreground relative z-10" />
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-4xl mb-3">{t("challengeComplete")}</CardTitle>
            <p className="text-muted-foreground text-lg">{t("limbusEvaluates")}</p>
          </CardHeader>
          <CardContent className="pt-10 pb-10 space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-primary/20 mb-6 relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-6xl font-bold" style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {score.toFixed(0)}%
                </span>
              </div>
              <p className="text-2xl font-bold mb-3">{t("yourScore")}</p>
              <p className="text-muted-foreground text-lg">
                {t("answeredCorrectly", { correct: correctCount, total: questions.length })}
              </p>
            </div>

            <div className="space-y-4 pt-4 max-w-md mx-auto">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground font-medium">{t("accuracyRate")}</span>
                <span className="font-bold text-lg">{score.toFixed(1)}%</span>
              </div>
              <Progress value={score} className="h-4" />
            </div>

            <div className="space-y-4 pt-6">
              <h3 className="font-semibold text-xl text-center mb-6">{t("reviewAnswers")}</h3>
              <div className="space-y-4 max-w-2xl mx-auto">
                {questions.map((q, idx) => {
                  const userAnswer = answers[idx];
                  const isCorrect = userAnswer === q.correct;

                  return (
                    <div key={idx} className="p-5 rounded-xl border-2 border-border bg-card/50 hover:bg-card transition-colors">
                      <div className="flex items-start gap-4 mb-3">
                        {isCorrect ? (
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <XCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold mb-3 text-base">{q.question}</p>
                          <div className="space-y-2 text-sm">
                            <p className={isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                              {t("yourAnswer")} {q.options[userAnswer]}
                            </p>
                            {!isCorrect && (
                              <>
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                  {t("correctAnswer")} {q.options[q.correct]}
                                </p>
                                <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                                  <p className="text-xs font-semibold text-primary mb-1">{t("limbusExplains")}</p>
                                  <p className="text-xs text-foreground/80 leading-relaxed">{q.explanation}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 pt-6 max-w-md mx-auto">
              <Button onClick={onComplete} className="flex-1 h-14 text-base font-semibold relative overflow-hidden group" style={{ background: "var(--gradient-primary)" }}>
                <span className="relative z-10">{t("continueLearning")}</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader className="border-b border-border/50 pb-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl md:text-3xl">{t("limbusChallenge")}</CardTitle>
            <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-semibold text-primary">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-3" />
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-relaxed">{question.question}</h3>
          </div>
          <RadioGroup value={selectedAnswer?.toString()} onValueChange={(val) => setSelectedAnswer(parseInt(val))}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {question.options.map((option, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center space-x-4 p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer group hover:scale-[1.02]",
                    selectedAnswer === idx
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border hover:border-primary/50 bg-card hover:bg-card/80"
                  )}
                  onClick={() => setSelectedAnswer(idx)}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="flex-shrink-0" />
                  <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1 text-base md:text-lg leading-relaxed">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          <Button
            onClick={handleNext}
            className="w-full mt-8 h-14 text-base font-semibold relative overflow-hidden group max-w-md mx-auto block"
            style={{ background: "var(--gradient-primary)" }}
          >
            <span className="relative z-10">
              {currentQuestion < questions.length - 1 ? t("nextQuestion") : t("completeChallenge")}
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
