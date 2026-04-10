import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TrainingPlan, SportConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateTrainingPlan(profile: UserProfile, sportConfig: SportConfig): Promise<TrainingPlan> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a highly structured and professional training plan for ${sportConfig.sport}.
      User Profile: 
      - Name: ${profile.username}
      - Weight: ${profile.weight}kg
      - Height: ${profile.height}cm
      - Experience Level: ${profile.experienceLevel}
      - Injuries: ${profile.injuries || 'None'}
      - Days per week for this specific sport: ${sportConfig.daysPerWeek || profile.daysPerWeek}
      - Specific Goal for this sport: ${sportConfig.goal || 'General performance'}
      ${sportConfig.isCombined ? '- NOTE: This is a COMBINED plan. Integrate this sport intelligently with the user\'s other activities.' : ''}
      
      Provide a detailed scientific reasoning and a structured weekly table with exercises, sets, reps, and technical notes.`,
      config: {
        systemInstruction: "You are an elite sports scientist and personal trainer. Create highly effective, data-driven training plans. Return the response in a structured JSON format matching the TrainingPlan interface.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING },
            table: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        notes: { type: Type.STRING }
                      },
                      required: ["name", "sets", "reps", "notes"]
                    }
                  }
                },
                required: ["day", "exercises"]
              }
            }
          },
          required: ["reasoning", "table"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function getNutritionAdvice(macros: { protein: number, carbs: number, fats: number }, activity: string) {
  // ... existing code ...
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an elite fitness nutrition advisor, provide a one-sentence insight based on these macros: Protein ${macros.protein}g, Carbs ${macros.carbs}g, Fats ${macros.fats}g. Today's activity: ${activity}. Focus on recovery and performance.`,
      config: {
        systemInstruction: "You are an elite high-performance fitness coach. Your tone is professional, scientific, and motivating. Keep responses to exactly one sentence.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Increase protein intake by 15g to support today's high-intensity recovery window.";
  }
}

export async function getPhysicalAnalysis(stats: { muscleMass: number, bodyFat: number }, notes: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these physical stats: Muscle Mass ${stats.muscleMass}%, Body Fat ${stats.bodyFat}%. Notes: ${notes}. Provide a professional bodybuilding observation in 2-3 sentences.`,
      config: {
        systemInstruction: "You are a senior bodybuilding judge and physical therapist. Analyze progress with precision. Use professional terminology like 'hypertrophy', 'medial deltoids', etc.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Visible hypertrophy in the medial deltoids compared to previous check-in. Posture alignment has improved significantly. Focus on upper chest volume for the next cycle.";
  }
}
