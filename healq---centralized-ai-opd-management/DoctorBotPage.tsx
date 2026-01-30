
import { useCallback, useEffect, useRef, useState, KeyboardEvent } from 'react';
import {
  Heart,
  Globe,
  MessageCircle,
  Stethoscope,
  Shield,
  User,
  Send,
  RotateCcw,
  MapPin,
  Clock
} from 'lucide-react';
import { ChatService, ChatResponse } from './services/ChatService';
import { Hospital } from './types';

// Define Prop Type (Expecting onNavigate from Parent)
type DoctorBotPageProps = {
  onNavigate?: (view: 'LIST' | 'BOOKING' | 'LIVE_TRACKER' | 'HISTORY' | 'ADMIN' | 'AMBULANCE' | 'BOT', data?: any) => void;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Hospital[];
};

const placeholders = {
  en: 'Describe your symptoms and location...',
  hi: 'अपने लक्षण और स्थान बताइए...',
  hinglish: 'Apne symptoms aur location bataiye...',
};

const welcomeTexts = {
  en: {
    greeting: "Hello! I'm Dr. Aisha",
    subtitle: 'Your AI Medical Assistant',
    description:
      "I'm here to help you find the right doctor. Tell me your symptoms and location (e.g., 'Headache in Delhi'), and I'll suggest the best specialists for you.",
    features: [
      { icon: MessageCircle, text: 'Analyze symptoms' },
      { icon: MapPin, text: 'Find nearby hospitals' },
      { icon: Stethoscope, text: 'Book tokens instantly' },
    ],
    prompt: 'How can I help you today?',
  },
  // We can expand other languages later
  hi: {
    greeting: 'नमस्ते! मैं डॉ. आइशा हूं',
    subtitle: 'आपकी AI मेडिकल असिस्टेंट',
    description: 'मैं यहाँ आपके लक्षणों को समझने और सही डॉक्टर खोजने में मदद करने के लिए हूं।',
    features: [
      { icon: MessageCircle, text: 'अपने लक्षणों के बारे में पूछें' },
      { icon: MapPin, text: 'नजदीकी अस्पताल खोजें' },
      { icon: Stethoscope, text: 'तुरंत अपॉइंटमेंट बुक करें' },
    ],
    prompt: 'आज मैं आपकी कैसे मदद कर सकती हूं?',
  },
  hinglish: {
    greeting: 'Namaste! Main Dr. Aisha hoon',
    subtitle: 'Aapki AI Medical Assistant',
    description: 'Main yahaan aapke symptoms samajhne aur sahi doctor dhoondne mein madad karne ke liye hoon.',
    features: [
      { icon: MessageCircle, text: 'Apne symptoms ke baare mein puchiye' },
      { icon: MapPin, text: 'Nazdiki hospital khojein' },
      { icon: Stethoscope, text: 'Turant appointment book karein' },
    ],
    prompt: 'Aaj main aapki kaise madad kar sakti hoon?',
  }
};

const useMedicalChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string, language: string) => {
      const userMsg: Message = { role: 'user', content: userMessage };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const response: ChatResponse = await ChatService.sendMessage(userMessage, language);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.text,
            suggestions: response.suggestedHospitals
          }
        ]);

      } catch (e) {
        const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    clearError,
  };
};

const DoctorAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const iconSizes: Record<'sm' | 'md' | 'lg', number> = {
    sm: 14,
    md: 16,
    lg: 22,
  };
  return (
    <div className={`${sizeClasses[size]} rounded-full gradient-doctor flex items-center justify-center shadow-glow flex-shrink-0`}>
      <Heart className="text-primary-foreground" size={iconSizes[size]} fill="currentColor" />
    </div>
  );
};

const LanguageSelector = ({ value, onChange }: any) => {
  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'hinglish', label: 'Hinglish', flag: '🇮🇳' },
  ];
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ChatMessageProps {
  msg: Message;
  onBook: (h: Hospital) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ msg, onBook }) => {
  const isDoctor = msg.role === 'assistant';

  return (
    <div className={`flex flex-col gap-2 ${isDoctor ? 'items-start' : 'items-end'} animate-fade-in`}>
      <div className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${isDoctor ? 'flex-row' : 'flex-row-reverse'}`}>
        {isDoctor ? <DoctorAvatar size="sm" /> : (
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <User className="text-secondary-foreground" size={14} />
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 ${isDoctor
            ? 'bg-card shadow-soft border border-border/50'
            : 'gradient-doctor text-primary-foreground shadow-glow'
            }`}
        >
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
      </div>

      {isDoctor && msg.suggestions && msg.suggestions.length > 0 && (
        <div className="ml-11 flex flex-col gap-3 w-full max-w-md">
          {msg.suggestions.map((h, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800">{h.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin size={12} /> {h.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Clock size={12} /> {h.opdTimings}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${h.type === 'Government' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                  {h.type}
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => onBook(h)}
                  className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Stethoscope size={14} /> Book Token
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatInput = ({ onSend, disabled, placeholder }: any) => {
  const [input, setInput] = useState('');
  const handleSend = () => { if (input.trim() && !disabled) { onSend(input.trim()); setInput(''); } };
  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none shadow-soft"
          style={{ height: '48px' }}
        />
      </div>
      <button onClick={handleSend} disabled={disabled || !input.trim()} className="w-12 h-12 rounded-full gradient-doctor flex items-center justify-center shadow-glow disabled:opacity-50 text-white">
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

// Main Component
const DoctorBotPage = ({ onNavigate }: DoctorBotPageProps) => {
  const [language, setLanguage] = useState('en');
  const { messages, isLoading, error, sendMessage, clearChat, clearError } = useMedicalChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  const handleBook = (hospital: Hospital) => {
    // Trigger navigation to booking page with this hospital selected
    if (onNavigate) {
      onNavigate('BOOKING', hospital);
    } else {
      // If App.tsx is not yet updated to pass onNavigate, fallback to window event
      const event = new CustomEvent('navigate-to-booking', { detail: { hospital } });
      window.dispatchEvent(event);
    }
  };

  const texts = (welcomeTexts as Record<string, (typeof welcomeTexts)['en']>)[language] || welcomeTexts.en;

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <DoctorAvatar size="md" />
          <div>
            <h1 className="font-semibold text-foreground">Dr. Aisha</h1>
            <p className="text-xs text-muted-foreground">AI Medical Assistant</p>
          </div>
        </div>
        <LanguageSelector value={language} onChange={setLanguage} />
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
              <DoctorAvatar size="lg" />
              <h2 className="mt-4 text-xl md:text-2xl font-semibold text-foreground text-center">{texts.greeting}</h2>
              <p className="text-sm text-primary font-medium">{texts.subtitle}</p>
              <p className="mt-4 text-sm text-muted-foreground text-center max-w-md leading-relaxed">{texts.description}</p>
              <div className="mt-6 flex flex-col gap-2">
                {texts.features.map((feature: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-base font-medium text-foreground">{texts.prompt}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  msg={msg}
                  onBook={handleBook}
                />
              ))}
              {isLoading && <div className="ml-11"><span className="animate-pulse text-slate-400 text-sm">Dr. Aisha is typing...</span></div>}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-card/80 backdrop-blur-lg border-t border-border/50 px-4 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto">
          {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
          <div className="flex justify-end mb-2">
            {messages.length > 0 && <button onClick={clearChat} className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600"><RotateCcw size={12} /> Reset Chat</button>}
          </div>
          <ChatInput
            onSend={(mt: string) => sendMessage(mt, language)}
            disabled={isLoading}
            placeholder={placeholders[language as keyof typeof placeholders]}
          />
        </div>
      </footer>
    </div>
  );
};

export default DoctorBotPage;
