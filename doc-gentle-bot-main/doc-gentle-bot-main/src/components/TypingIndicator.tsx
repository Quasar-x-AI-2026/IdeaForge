import { DoctorAvatar } from "./DoctorAvatar";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 items-end animate-fade-in">
      <DoctorAvatar size="sm" />
      <div className="bg-card shadow-soft border border-border/50 rounded-2xl px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
};
