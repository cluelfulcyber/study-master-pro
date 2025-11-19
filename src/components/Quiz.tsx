import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizProps {
  sessionId: string;
  subject: string;
  onComplete: () => void;
}

const Quiz = ({ sessionId, subject, onComplete }: QuizProps) => {
  const { toast } = useToast();
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
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { subject, sessionId },
      });

      if (error) throw error;

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase.from("quiz_results").insert([
        {
          user_id: user.id,
          session_id: sessionId,
          total_questions: questions.length,
          correct_answers: correctAnswers,
          score_percentage: scorePercentage,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving quiz result:", error);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating quiz questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResult) {
    const correctCount = answers.reduce((acc, answer, idx) => {
      return acc + (answer === questions[idx].correct ? 1 : 0);
    }, 0);

    return (
      <Card className="shadow-xl">
        <CardHeader className="text-center border-b border-border/50 bg-card/50">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Award className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="text-center space-y-4">
            <div>
              <div className="text-5xl font-bold mb-2" style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {score.toFixed(1)}%
              </div>
              <p className="text-muted-foreground">
                You got {correctCount} out of {questions.length} questions correct
              </p>
            </div>
            <Progress value={score} className="h-3" />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-lg">Review Your Answers</h3>
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correct;

              return (
                <div key={idx} className="p-4 rounded-lg border border-border bg-card/30">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">{q.question}</p>
                      <div className="space-y-1 text-sm">
                        <p className={isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          Your answer: {q.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-green-600 dark:text-green-400">
                            Correct answer: {q.options[q.correct]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={onComplete} className="w-full h-12" style={{ background: "var(--gradient-primary)" }}>
            Start New Study Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b border-border/50 bg-card/50">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <span className="text-sm font-medium text-muted-foreground">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <h3 className="text-xl font-medium leading-relaxed">{question.question}</h3>

          <RadioGroup value={selectedAnswer?.toString()} onValueChange={(val) => setSelectedAnswer(parseInt(val))}>
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <Button
            onClick={handleNext}
            className="w-full h-12"
            disabled={selectedAnswer === null}
            style={{ background: selectedAnswer !== null ? "var(--gradient-primary)" : undefined }}
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Quiz;
