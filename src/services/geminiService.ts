import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TrainingPlan, SportConfig, NutritionPlan, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateTrainingPlan(profile: UserProfile, sportConfig: SportConfig, language: Language): Promise<TrainingPlan> {
  return generateCombinedTrainingPlan(profile, [sportConfig], language);
}

export async function generateCombinedTrainingPlan(profile: UserProfile, configs: SportConfig[], language: Language): Promise<TrainingPlan> {
  try {
    const isSpanish = language === 'es';
    const sportsList = configs.map(c => `${c.sport} (${c.daysPerWeek} ${isSpanish ? 'días' : 'days'}, ${c.goal})`).join(", ");
    
    const prompt = isSpanish 
      ? `Genera un plan de entrenamiento COMBINADO y profesional para los siguientes deportes: ${sportsList}.
        Perfil del Usuario: 
        - Nombre: ${profile.username}
        - Peso: ${profile.weight}kg
        - Altura: ${profile.height}cm
        - Nivel de Experiencia: ${profile.experienceLevel}
        - Lesiones: ${profile.injuries || 'Ninguna'}
        
        Instrucciones:
        1. Integra todos estos deportes en un único horario semanal cohesivo de 7 días.
        2. Distribuye los días de entrenamiento de forma inteligente para evitar el sobreentrenamiento.
        3. Asegura una recuperación óptima alternando intensidades.
        4. Proporciona un razonamiento científico detallado para esta combinación.
        
        IMPORTANTE: Cada ejercicio DEBE tener un 'id' único (ej. 'ex_1', 'ex_2').`
      : `Generate a COMBINED and professional training plan for the following sports: ${sportsList}.
        User Profile: 
        - Name: ${profile.username}
        - Weight: ${profile.weight}kg
        - Height: ${profile.height}cm
        - Experience Level: ${profile.experienceLevel}
        - Injuries: ${profile.injuries || 'None'}
        
        Instructions:
        1. Integrate all these sports into a single cohesive 7-day weekly schedule.
        2. Distribute training days intelligently to avoid overtraining.
        3. Ensure optimal recovery by alternating intensities.
        4. Provide a detailed scientific reasoning for this combination.
        
        IMPORTANT: Each exercise MUST have a unique 'id' (e.g., 'ex_1', 'ex_2').`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: isSpanish 
          ? "Eres un científico deportivo y entrenador personal de élite. Crea planes de entrenamiento altamente efectivos basados en datos. Devuelve la respuesta en un formato JSON estructurado que coincida con la interfaz TrainingPlan."
          : "You are an elite sports scientist and personal trainer. Create highly effective, data-driven training plans. Return the response in a structured JSON format matching the TrainingPlan interface.",
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
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        notes: { type: Type.STRING }
                      },
                      required: ["id", "name", "sets", "reps", "notes"]
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
    const plan = JSON.parse(response.text);
    return {
      ...plan,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function generateNutritionPlan(profile: UserProfile): Promise<NutritionPlan> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera un plan de nutrición profesional y equilibrado.
      Perfil del Usuario:
      - Nombre: ${profile.username}
      - Peso: ${profile.weight}kg, Altura: ${profile.height}cm, Edad: ${profile.age}
      - Objetivo Nutricional: ${profile.nutritionGoal}
      - Plazo deseado: ${profile.nutritionTimeframe}
      - Alergias/Restricciones: ${profile.allergies || 'Ninguna'}
      - Nivel de Actividad: ${profile.experienceLevel}
      
      El plan debe incluir razonamiento científico y 4 comidas diarias (Desayuno, Almuerzo, Merienda, Cena).
      Cada comida debe tener nombre, ingredientes y macros (proteínas, carbohidratos, grasas, kcal).`,
      config: {
        systemInstruction: "Eres un nutricionista deportivo de élite. Diseñas planes de alimentación precisos, saludables y efectivos. Responde en formato JSON estructurado que coincida con la interfaz NutritionPlan.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  name: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      p: { type: Type.NUMBER },
                      c: { type: Type.NUMBER },
                      f: { type: Type.NUMBER },
                      kcal: { type: Type.NUMBER }
                    },
                    required: ["p", "c", "f", "kcal"]
                  }
                },
                required: ["type", "name", "ingredients", "macros"]
              }
            }
          },
          required: ["reasoning", "meals"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Nutrition Error:", error);
    throw error;
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
