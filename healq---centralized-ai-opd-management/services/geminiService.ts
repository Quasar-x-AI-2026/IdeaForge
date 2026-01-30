/// <reference types="vite/client" />

import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResult, Doctor, Token, Hospital } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export const predictWaitTime = async (
  doctor: Doctor,
  queuePosition: number
): Promise<PredictionResult> => {
  const prompt = `
    Analyze the following OPD data for Doctor ${doctor.name}:
    - Specialty: ${doctor.specialty}
    - Average consultation time: ${doctor.averageConsultationTime} minutes per patient.
    - Current Queue Size: ${doctor.currentQueue}
    - New Patient's Position in Queue: ${queuePosition}
    - Current Token Running: ${doctor.currentToken}
    
    Predict the estimated waiting time for the new patient. 
    Account for "real-world" factors like potential delays in ${doctor.specialty} cases.
    Determine if the crowd level is high (over 10 people in queue).
    Provide a short piece of advice for the patient (e.g., "Reach 15 mins early", "OPD is moving fast").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedWaitMinutes: { type: Type.NUMBER },
            isHighCrowd: { type: Type.BOOLEAN },
            advice: { type: Type.STRING },
          },
          required: ["estimatedWaitMinutes", "isHighCrowd", "advice"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result as PredictionResult;
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    return {
      estimatedWaitMinutes: doctor.averageConsultationTime * queuePosition,
      isHighCrowd: doctor.currentQueue > 10,
      advice: "Please track your token status live on the app."
    };
  }
};

export const searchHospitalsByQuery = async (
  query: string,
  hospitals: Hospital[]
): Promise<{ hospitalIds: string[]; reasoning: string }> => {
  const hospitalSummary = hospitals.map(h => ({
    id: h.id,
    name: h.name,
    depts: h.departments.map(d => d.name),
    location: h.location
  }));

  const prompt = `
    A user is searching for medical help with the following query: "${query}"
    Based on this list of hospitals and their departments, identify the top 3 hospitals that best match the user's needs.
    If they mention a symptom (e.g., "heart pain"), match them to the relevant department (e.g., Cardiology).
    
    Hospitals Data: ${JSON.stringify(hospitalSummary)}

    Return the list of matched hospital IDs and a brief "Why we chose these" explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hospitalIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING },
          },
          required: ["hospitalIds", "reasoning"],
        },
      },
    });
    return JSON.parse(response.text || '{"hospitalIds": [], "reasoning": "No matches found."}');
  } catch (error) {
    console.error("Search Error:", error);
    // Fallback: Simple keyword matching
    const lowerQuery = query.toLowerCase();
    const matchedHospitals = hospitals.filter(h =>
      h.name.toLowerCase().includes(lowerQuery) ||
      h.departments.some(d => d.name.toLowerCase().includes(lowerQuery)) ||
      h.location.toLowerCase().includes(lowerQuery)
    );
    return {
      hospitalIds: matchedHospitals.map(h => h.id),
      reasoning: "AI search unavailable. Showing results based on keyword matching."
    };
  }
};

export const generateSmsConfirmation = async (token: Token): Promise<string> => {
  const prompt = `
    Draft a concise, professional SMS confirmation for an OPD appointment.
    Patient: ${token.patientName}
    Hospital: ${token.hospitalName}
    Doctor: ${token.doctorName}
    Token: #${token.tokenNumber}
    Est Time: ${token.estimatedTime}
    Slot: ${token.slotTime}
    
    Requirements:
    - Keep it under 150 characters.
    - Tone: Official and reassuring.
    - Mention: "Track live on HealQ app".
    - No emojis, plain text only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        maxOutputTokens: 60,
      },
    });

    return response.text?.trim() || `Token #${token.tokenNumber} confirmed for ${token.doctorName} at ${token.hospitalName}. Est: ${token.estimatedTime}. Track live on HealQ.`;
  } catch (error) {
    console.error("Gemini SMS Generation Error:", error);
    return `Token #${token.tokenNumber} confirmed for ${token.doctorName} at ${token.hospitalName}. Est: ${token.estimatedTime}. Track live on HealQ.`;
  }
};
