import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, disabled, placeholder }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Apni symptoms bataiye..."}
          disabled={disabled}
          rows={1}
          className="w-full bg-card border border-border rounded-2xl px-4 py-3 pr-4 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none min-h-[48px] max-h-[120px] shadow-soft transition-all"
          style={{ height: "48px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "48px";
            target.style.height = Math.min(target.scrollHeight, 120) + "px";
          }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="w-12 h-12 rounded-full gradient-doctor flex items-center justify-center shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
        aria-label="Send message"
      >
        <Send className="w-5 h-5 text-primary-foreground" />
      </button>
    </div>
  );
};
