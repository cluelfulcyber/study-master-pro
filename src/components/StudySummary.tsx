import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface StudySummaryProps {
  summary: string;
  onStartQuiz: () => void;
  onNewTopic: () => void;
}

const StudySummary = ({ summary, onStartQuiz, onNewTopic }: StudySummaryProps) => {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-border/50">
        <CardHeader className="border-b border-border/50 bg-card/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              Study Material
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

      <div className="flex gap-4">
        <Button onClick={onStartQuiz} className="flex-1 h-12" style={{ background: "var(--gradient-primary)" }}>
          <Sparkles className="mr-2 h-5 w-5" />
          Take Quiz on This Topic
        </Button>
        <Button onClick={onNewTopic} variant="outline" className="flex-1 h-12">
          Study New Topic
        </Button>
      </div>
    </div>
  );
};

export default StudySummary;
