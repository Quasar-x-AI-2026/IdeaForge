import { DoctorAvatar } from "./DoctorAvatar";
import { User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const isDoctor = role === "assistant";

  return (
    <div
      className={`flex gap-3 animate-fade-in ${
        isDoctor ? "justify-start" : "justify-end"
      }`}
    >
      {isDoctor && <DoctorAvatar size="sm" />}
      
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isDoctor
            ? "bg-card shadow-soft border border-border/50"
            : "gradient-doctor text-primary-foreground shadow-glow"
        }`}
      >
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse-gentle" />
          )}
        </p>
      </div>

      {!isDoctor && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="text-secondary-foreground" size={14} />
        </div>
      )}
    </div>
  );
};
