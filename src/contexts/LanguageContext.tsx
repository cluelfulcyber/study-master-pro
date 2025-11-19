import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "bg";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    signIn: "Sign In",
    aiPowered: "AI-Powered Learning Platform",
    heroTitle: "Learn Beyond Limits",
    heroSubtitle: "With Limbus",
    heroDescription: "Guided by Limbus, the eternal scholar who crossed boundaries between worlds to master infinite knowledge. Now this timeless mentor adapts to your pace, transforming any subject into comprehensible wisdom.",
    getStarted: "Get Started Free",
    learnMore: "Learn More",
    featuresTitle: "Everything you need to transcend limits",
    featuresSubtitle: "Limbus's gifts to accelerate your mastery",
    adaptiveLearning: "Adaptive Learning",
    adaptiveDesc: "Choose your difficulty level - Simple, Normal, or Advanced. Limbus molds knowledge to match your understanding.",
    comprehensiveTesting: "Comprehensive Testing",
    comprehensiveDesc: "Test your knowledge with AI-generated quizzes that challenge and reinforce your learning journey.",
    progressTracking: "Progress Tracking",
    progressDesc: "Visual insights into your growth. Watch your mastery expand with detailed analytics and history.",
    readyToStart: "Ready to Start Your Journey?",
    readyDesc: "Join thousands of learners who've transcended their limits with Limbus as their guide.",
    copyright: "2025 NOIT LimbusMentor"
  },
  bg: {
    signIn: "Вход",
    aiPowered: "Платформа за обучение с изкуствен интелект",
    heroTitle: "Учи без граници",
    heroSubtitle: "С Лимбус",
    heroDescription: "Водени от Лимбус, вечния учен, който пресече границите между световете, за да овладее безкрайно знание. Сега този вечен ментор се адаптира към твоето темпо, превръщайки всеки предмет в разбираема мъдрост.",
    getStarted: "Започни безплатно",
    learnMore: "Научи повече",
    featuresTitle: "Всичко необходимо за преодоляване на границите",
    featuresSubtitle: "Дарът на Лимбус за ускоряване на твоето майсторство",
    adaptiveLearning: "Адаптивно обучение",
    adaptiveDesc: "Избери нивото си на трудност - Просто, Нормално или Напреднало. Лимбус оформя знанието според твоето разбиране.",
    comprehensiveTesting: "Всеобхватно тестване",
    comprehensiveDesc: "Тествай знанията си с генерирани от AI тестове, които предизвикват и затвърдяват пътя ти на обучение.",
    progressTracking: "Проследяване на прогреса",
    progressDesc: "Визуални прозрения за твоя растеж. Наблюдавай как твоето майсторство се разширява с детайлна аналитика и история.",
    readyToStart: "Готов ли си да започнеш пътешествието си?",
    readyDesc: "Присъедини се към хиляди ученици, които са преодолели границите си с Лимбус като техен водач.",
    copyright: "2025 NOIT LimbusMentor"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "bg" ? "bg" : "en") as Language;
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
