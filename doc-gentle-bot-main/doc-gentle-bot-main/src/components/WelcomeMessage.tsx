import { DoctorAvatar } from "./DoctorAvatar";
import { Stethoscope, Shield, MessageCircle } from "lucide-react";

interface WelcomeMessageProps {
  language: string;
}

const welcomeTexts = {
  en: {
    greeting: "Hello! I'm Dr. Aisha",
    subtitle: "Your AI Medical Assistant",
    description:
      "I'm here to help you understand your symptoms and provide general health guidance. Please remember, I'm an AI assistant and cannot replace a real doctor.",
    features: [
      { icon: MessageCircle, text: "Ask about your symptoms" },
      { icon: Stethoscope, text: "Get general health guidance" },
      { icon: Shield, text: "Know when to see a doctor" },
    ],
    prompt: "How can I help you today?",
  },
  hi: {
    greeting: "नमस्ते! मैं डॉ. आइशा हूं",
    subtitle: "आपकी AI मेडिकल असिस्टेंट",
    description:
      "मैं यहाँ आपके लक्षणों को समझने और सामान्य स्वास्थ्य मार्गदर्शन प्रदान करने में मदद करने के लिए हूं। कृपया याद रखें, मैं एक AI सहायक हूं और एक वास्तविक डॉक्टर की जगह नहीं ले सकती।",
    features: [
      { icon: MessageCircle, text: "अपने लक्षणों के बारे में पूछें" },
      { icon: Stethoscope, text: "सामान्य स्वास्थ्य मार्गदर्शन प्राप्त करें" },
      { icon: Shield, text: "जानें कब डॉक्टर से मिलना है" },
    ],
    prompt: "आज मैं आपकी कैसे मदद कर सकती हूं?",
  },
  hinglish: {
    greeting: "Namaste! Main Dr. Aisha hoon",
    subtitle: "Aapki AI Medical Assistant",
    description:
      "Main yahaan aapke symptoms samajhne aur general health guidance dene ke liye hoon. Yaad rakhiye, main ek AI assistant hoon aur real doctor ki jagah nahi le sakti.",
    features: [
      { icon: MessageCircle, text: "Apne symptoms ke baare mein puchiye" },
      { icon: Stethoscope, text: "General health guidance paiye" },
      { icon: Shield, text: "Jaaniye kab doctor se milna hai" },
    ],
    prompt: "Aaj main aapki kaise madad kar sakti hoon?",
  },
};

export const WelcomeMessage = ({ language }: WelcomeMessageProps) => {
  const texts = welcomeTexts[language as keyof typeof welcomeTexts] || welcomeTexts.en;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      <DoctorAvatar size="lg" />
      
      <h2 className="mt-4 text-xl md:text-2xl font-semibold text-foreground text-center">
        {texts.greeting}
      </h2>
      <p className="text-sm text-primary font-medium">{texts.subtitle}</p>
      
      <p className="mt-4 text-sm text-muted-foreground text-center max-w-md leading-relaxed">
        {texts.description}
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {texts.features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm text-foreground/80"
          >
            <feature.icon className="w-4 h-4 text-primary" />
            <span>{feature.text}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-base font-medium text-foreground">
        {texts.prompt}
      </p>
    </div>
  );
};
