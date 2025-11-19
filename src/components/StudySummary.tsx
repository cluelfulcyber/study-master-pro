import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/contexts/LanguageContext";

interface StudySummaryProps {
  summary: string;
  onStartQuiz: () => void;
  onNewTopic: () => void;
}

const StudySummary = ({ summary, onStartQuiz, onNewTopic }: StudySummaryProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              {t("studyMaterial")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 text-foreground">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-4 text-foreground">{children}</h3>,
                p: ({ children }) => <p className="mb-4 text-foreground/90 leading-7">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>,
                li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-accent">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 border border-border">
                    <code className="text-sm font-mono text-foreground">{children}</code>
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80 my-4">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 flex-col sm:flex-row">
        <Button onClick={onStartQuiz} className="flex-1 h-14 text-base font-semibold relative overflow-hidden group" style={{ background: "var(--gradient-primary)" }}>
          <span className="relative z-10 flex items-center justify-center">
            <Sparkles className="mr-2 h-5 w-5" />
            {t("startQuiz")}
          </span>
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </Button>
        <Button onClick={onNewTopic} variant="outline" className="flex-1 h-14 text-base font-semibold border-2 hover:border-primary">
          {t("newTopic")}
        </Button>
      </div>
    </div>
  );
};

export default StudySummary;
