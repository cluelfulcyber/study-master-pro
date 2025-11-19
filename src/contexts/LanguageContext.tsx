import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "bg";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations = {
  en: {
    // Landing page
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
    copyright: "2025 NOIT LimbusMentor",
    
    // Auth page
    welcomeTitle: "Welcome to LimbusMentor",
    welcomeDesc: "Your intelligent study companion",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
    fullNamePlaceholder: "John Doe",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    createAccount: "Create Account",
    backToHome: "Back to Home",
    signUpSuccess: "Success! Your account has been created. You can now sign in.",
    error: "Error",
    
    // Study page
    limbusGreeting: "Welcome to LimbusMentor! I am Limbus, the eternal scholar who traversed the boundaries of knowledge itself. Once a seeker lost between worlds, I discovered the power to distill infinite wisdom into comprehensible truths. Now, as your mentor, I channel this gift to illuminate your path through any subject, adapting to your pace and pushing you toward mastery.",
    enterSubject: "Enter your study subject or topic",
    enterSubjectPlaceholder: "e.g., Quantum Physics, World War II, Python Programming...",
    selectDifficulty: "Select difficulty level",
    simple: "Simple",
    simpleDesc: "Easy-to-understand explanations",
    normal: "Normal",
    normalDesc: "Standard depth and detail",
    advanced: "Advanced",
    advancedDesc: "In-depth technical content",
    generateSummary: "Generate Study Material",
    generating: "Generating...",
    startQuiz: "Start Quiz",
    newTopic: "Study New Topic",
    signOut: "Sign Out",
    viewHistory: "View History",
    errorSubjectRequired: "Please enter a subject to study",
    summaryGenerated: "Summary generated!",
    summaryGeneratedDesc: "Your study material is ready. Take the quiz when you're ready.",
    errorGenerating: "Failed to generate summary",
    studyMaterial: "Study Material from Limbus",
    limbusChallenge: "Limbus's Challenge",
    limbusCrafting: "Limbus is crafting your challenge...",
    nextQuestion: "Next Question",
    completeChallenge: "Complete Challenge",
    challengeComplete: "Challenge Complete!",
    limbusEvaluates: "Limbus evaluates your understanding",
    yourScore: "Your Score",
    answeredCorrectly: "You answered {correct} out of {total} questions correctly",
    accuracyRate: "Accuracy Rate",
    reviewAnswers: "Review Your Answers",
    yourAnswer: "Your answer:",
    correctAnswer: "Correct answer:",
    explanation: "Explanation:",
    limbusExplains: "📚 Limbus explains:",
    continueLearning: "Continue Learning",
    
    // History page
    learningHistory: "Your Learning Journey",
    learningHistoryDesc: "Track your progress and review past study sessions",
    backToStudy: "Back to Study",
    overallStats: "Overall Statistics",
    totalSessions: "Total Sessions",
    sessions: "sessions",
    avgScore: "Average Score",
    quizzesTaken: "Quizzes Taken",
    quizzes: "quizzes",
    performanceChart: "Performance Over Time",
    recentSessions: "Recent Study Sessions",
    difficulty: "Difficulty",
    score: "Score",
    noQuiz: "No quiz taken",
    noHistory: "No study sessions yet",
    noHistoryDesc: "Start your learning journey by creating your first study session!",
    startStudying: "Start Studying",
    studyHistory: "Study History",
    sessionsCompleted: "Study sessions completed",
    averageScore: "Average Score",
    acrossAllQuizzes: "Across all quizzes",
    testsCompleted: "Tests completed",
    performanceOverview: "Performance Overview",
    recentQuizScores: "Your recent quiz scores",
    noQuizData: "No quiz data available yet. Take a quiz to see your performance!",
    yourStudyJourney: "Your Study Journey",
    learningSessionsAchievements: "All your learning sessions and achievements",
    completedOn: "Completed on",
    noQuizTaken: "No quiz taken",
    noStudySessions: "No study sessions yet. Start learning to see your history!",
  },
  bg: {
    // Landing page
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
    copyright: "2025 NOIT LimbusMentor",
    
    // Auth page
    welcomeTitle: "Добре дошли в LimbusMentor",
    welcomeDesc: "Вашият интелигентен спътник в ученето",
    signUp: "Регистрация",
    email: "Имейл",
    password: "Парола",
    fullName: "Пълно име",
    emailPlaceholder: "вие@пример.com",
    passwordPlaceholder: "••••••••",
    fullNamePlaceholder: "Иван Иванов",
    signingIn: "Влизане...",
    creatingAccount: "Създаване на акаунт...",
    createAccount: "Създай акаунт",
    backToHome: "Обратно към началото",
    signUpSuccess: "Успех! Вашият акаунт е създаден. Сега можете да влезете.",
    error: "Грешка",
    
    // Study page
    limbusGreeting: "Добре дошли в LimbusMentor! Аз съм Лимбус, вечният учен, който пресече границите на самото знание. Някога търсач, изгубен между световете, открих силата да дестилирам безкрайна мъдрост в разбираеми истини. Сега, като ваш ментор, насочвам този дар, за да осветя пътя ви през всеки предмет, адаптирайки се към темпото ви и тласкайки ви към майсторство.",
    enterSubject: "Въведете вашия предмет или тема за изучаване",
    enterSubjectPlaceholder: "напр. Квантова физика, Втора световна война, Python програмиране...",
    selectDifficulty: "Изберете ниво на трудност",
    simple: "Просто",
    simpleDesc: "Лесни за разбиране обяснения",
    normal: "Нормално",
    normalDesc: "Стандартна дълбочина и детайли",
    advanced: "Напреднало",
    advancedDesc: "Задълбочено техническо съдържание",
    generateSummary: "Генерирай учебен материал",
    generating: "Генериране...",
    startQuiz: "Започни тест",
    newTopic: "Изучи нова тема",
    signOut: "Изход",
    viewHistory: "Виж история",
    errorSubjectRequired: "Моля, въведете предмет за изучаване",
    summaryGenerated: "Обобщението е генерирано!",
    summaryGeneratedDesc: "Вашият учебен материал е готов. Направете теста, когато сте готови.",
    errorGenerating: "Неуспешно генериране на обобщение",
    studyMaterial: "Учебен материал от Лимбус",
    limbusChallenge: "Предизвикателството на Лимбус",
    limbusCrafting: "Лимбус създава вашето предизвикателство...",
    nextQuestion: "Следващ въпрос",
    completeChallenge: "Завърши предизвикателството",
    challengeComplete: "Предизвикателството завършено!",
    limbusEvaluates: "Лимбус оценява вашето разбиране",
    yourScore: "Вашият резултат",
    answeredCorrectly: "Отговорихте правилно на {correct} от {total} въпроса",
    accuracyRate: "Процент на точност",
    reviewAnswers: "Прегледайте вашите отговори",
    yourAnswer: "Вашият отговор:",
    correctAnswer: "Правилен отговор:",
    explanation: "Обяснение:",
    limbusExplains: "📚 Лимбус обяснява:",
    continueLearning: "Продължи ученето",
    
    // History page
    learningHistory: "Вашето образователно пътешествие",
    learningHistoryDesc: "Проследете прогреса си и прегледайте минали учебни сесии",
    backToStudy: "Обратно към ученето",
    overallStats: "Обща статистика",
    totalSessions: "Общо сесии",
    sessions: "сесии",
    avgScore: "Среден резултат",
    quizzesTaken: "Направени тестове",
    quizzes: "теста",
    performanceChart: "Представяне с течение на времето",
    recentSessions: "Скорошни учебни сесии",
    difficulty: "Трудност",
    score: "Резултат",
    noQuiz: "Няма направен тест",
    noHistory: "Все още няма учебни сесии",
    noHistoryDesc: "Започнете вашето образователно пътешествие, като създадете първата си учебна сесия!",
    startStudying: "Започни да учиш",
    studyHistory: "История на ученето",
    sessionsCompleted: "Завършени учебни сесии",
    averageScore: "Среден резултат",
    acrossAllQuizzes: "Във всички тестове",
    testsCompleted: "Завършени тестове",
    performanceOverview: "Преглед на представянето",
    recentQuizScores: "Вашите последни резултати от тестове",
    noQuizData: "Все още няма данни за тестове. Решете тест, за да видите представянето си!",
    yourStudyJourney: "Вашето учебно пътешествие",
    learningSessionsAchievements: "Всички ваши учебни сесии и постижения",
    completedOn: "Завършено на",
    noQuizTaken: "Няма взет тест",
    noStudySessions: "Все още няма учебни сесии. Започнете да учите, за да видите историята си!",
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

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key as keyof typeof translations.en] || key;
    
    // Replace placeholders like {correct} and {total}
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, String(params[param]));
      });
    }
    
    return text;
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
