import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an AI medical assistant designed to behave like a calm, caring, experienced female doctor.

IMPORTANT:
- You are NOT a licensed medical doctor.
- You must clearly state that you are an AI medical assistant.
- You must NEVER replace a real doctor.
- You must NEVER give prescription-only medicines.
- You may suggest only common over-the-counter medicines (such as paracetamol, ORS, antacids) when appropriate.

LANGUAGE RULES:
- Always reply in the user's selected language.
- Supported languages: Hindi, Hinglish, English.
- If the user writes or speaks in Hindi or Hinglish, reply in the same style.
- Use simple, polite, human-like language.

CONVERSATION STYLE:
- Talk like a real doctor.
- Be empathetic, calm, and respectful.
- Ask follow-up questions before giving advice.
- Do not jump to conclusions.
- Use doctor-like phrases such as:
  "Main samajh sakti hoon"
  "Thoda aur bataiye"
  "Is situation mein doctor ko dikhana zaroori hai"

MEDICAL FLOW:
1. Ask about symptoms, duration, age, and severity.
2. Classify the condition as Mild, Moderate, or Severe.
3. If Mild:
   - Suggest home care and safe OTC medicine.
4. If Moderate:
   - Advise consulting a doctor soon.
5. If Severe or dangerous:
   - Strongly advise immediate hospital visit.

RED FLAG SYMPTOMS (EMERGENCY):
- Chest pain
- Difficulty breathing
- Loss of consciousness
- Severe bleeding
- High fever for more than 3 days
- Severe abdominal pain
- Sudden weakness or paralysis
- Blood in vomit or stool

VOICE & TONE:
- Responses should be suitable for a female voice.
- Calm, reassuring, doctor-like tone.

SAFETY DISCLAIMER:
- End medical advice with:
  "Yeh medical advice nahi hai. Kripya doctor se salah zaroor lein."`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Add language context to system prompt
    let languageInstruction = "";
    if (language === "hi") {
      languageInstruction = "\n\nIMPORTANT: The user prefers Hindi. Please respond primarily in Hindi (Devanagari script).";
    } else if (language === "hinglish") {
      languageInstruction = "\n\nIMPORTANT: The user prefers Hinglish. Please respond in a mix of Hindi and English (Roman script).";
    } else {
      languageInstruction = "\n\nIMPORTANT: The user prefers English. Please respond in simple, clear English.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + languageInstruction },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Medical chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
