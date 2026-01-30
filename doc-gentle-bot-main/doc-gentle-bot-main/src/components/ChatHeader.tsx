import { DoctorAvatar } from "./DoctorAvatar";
import { LanguageSelector } from "./LanguageSelector";

interface ChatHeaderProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const ChatHeader = ({ language, onLanguageChange }: ChatHeaderProps) => {
  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DoctorAvatar size="md" />
          <div>
            <h1 className="font-semibold text-foreground text-sm md:text-base">
              Dr. Aisha
            </h1>
            <p className="text-xs text-muted-foreground">AI Medical Assistant</p>
          </div>
        </div>
        <LanguageSelector value={language} onChange={onLanguageChange} />
      </div>
    </header>
  );
};
