import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bg" : "en");
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2">
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium">{language.toUpperCase()}</span>
    </Button>
  );
}
