import { Brain } from "lucide-react";

interface LimbusAvatarProps {
  message: string;
}

export function LimbusAvatar({ message }: LimbusAvatarProps) {
  return (
    <div className="flex items-start gap-4 max-w-3xl">
      {/* Limbus Avatar */}
      <div className="relative flex-shrink-0">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden shadow-lg border-4 border-primary/20" 
          style={{ background: "var(--gradient-primary)" }}
        >
          <Brain className="w-10 h-10 text-primary-foreground relative z-10" />
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
        {/* Small indicator dot */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background" />
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1">
        {/* Triangle pointer */}
        <div className="absolute -left-3 top-4">
          <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[16px] border-r-card" />
          <div className="absolute top-[1px] -left-[1px] w-0 h-0 border-t-[11px] border-t-transparent border-b-[11px] border-b-transparent border-r-[15px] border-r-border" />
        </div>

        {/* Message Box */}
        <div className="p-5 rounded-2xl border-2 border-border bg-card shadow-lg">
          <div className="flex items-start gap-2 mb-2">
            <span className="font-bold text-primary text-sm">Limbus</span>
            <span className="text-xs text-muted-foreground mt-0.5">• Eternal Scholar</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
