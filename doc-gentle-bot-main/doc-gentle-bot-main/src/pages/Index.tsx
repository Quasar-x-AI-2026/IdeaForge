import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { useMedicalChat } from "@/hooks/useMedicalChat";
import { RotateCcw } from "lucide-react";

const placeholders = {
  en: "Describe your symptoms...",
  hi: "अपने लक्षण बताइए...",
  hinglish: "Apne symptoms bataiye...",
};

const Index = () => {
  const [language, setLanguage] = useState("en");
  const { messages, isLoading, sendMessage, clearChat } = useMedicalChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (message: string) => {
    sendMessage(message, language);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <ChatHeader language={language} onLanguageChange={setLanguage} />

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <WelcomeMessage language={language} />
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={
                    isLoading &&
                    msg.role === "assistant" &&
                    index === messages.length - 1
                  }
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-card/80 backdrop-blur-lg border-t border-border/50 px-4 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                New conversation
              </button>
            )}
          </div>
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            placeholder={placeholders[language as keyof typeof placeholders]}
          />
          <p className="text-xs text-muted-foreground text-center mt-3">
            AI medical assistant for guidance only. Always consult a real doctor.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
