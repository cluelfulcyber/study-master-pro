import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, BookOpen, TrendingUp, Award, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/study");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
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
            <ThemeToggle />
            <LanguageToggle />
            <Button variant="outline" onClick={() => navigate("/auth")}>
              {t("signIn")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{t("aiPowered")}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            {t("heroTitle")}
            <br />
            <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("heroSubtitle")}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("heroDescription")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="h-14 px-8 text-lg"
              onClick={() => navigate("/auth")}
              style={{ background: "var(--gradient-primary)" }}
            >
              {t("getStarted")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
              {t("learnMore")}
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{t("featuresTitle")}</h2>
          <p className="text-xl text-muted-foreground">{t("featuresSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t("adaptiveLearning")}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("adaptiveDesc")}
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t("comprehensiveTesting")}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("comprehensiveDesc")}
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t("progressTracking")}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("progressDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-12 text-center" style={{ background: "var(--gradient-primary)" }}>
            <div className="relative z-10">
              <Award className="w-16 h-16 mx-auto mb-6 text-primary-foreground" />
              <h2 className="text-4xl font-bold mb-4 text-primary-foreground">{t("readyToStart")}</h2>
              <p className="text-xl mb-8 text-primary-foreground/90">
                {t("readyDesc")}
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-lg"
                onClick={() => navigate("/auth")}
              >
                {t("getStarted")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{t("copyright")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
