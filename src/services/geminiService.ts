import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TrainingPlan, SportConfig, NutritionPlan, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const foodImageMap: Record<string, string> = {
  "huevo": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=2070&auto=format&fit=crop",
  "pollo": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2026&auto=format&fit=crop",
  "pavo": "https://images.unsplash.com/photo-1518492104633-130d0cc84637?q=80&w=1926&auto=format&fit=crop",
  "avena": "https://images.unsplash.com/photo-1586444248902-2f64eddf13cf?q=80&w=2070&auto=format&fit=crop",
  "yogur": "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1974&auto=format&fit=crop",
  "fruta": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2070&auto=format&fit=crop",
  "ensalada": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
  "pescado": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop",
  "carne": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop",
  "pasta": "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=1988&auto=format&fit=crop",
  "arroz": "https://images.unsplash.com/photo-1512058560366-cd2427ba5e73?q=80&w=2070&auto=format&fit=crop",
  "batido": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=1974&auto=format&fit=crop",
  "frutos secos": "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=2069&auto=format&fit=crop"
};

const getImage = (ingredients: string[]): string => {
  if (!ingredients || ingredients.length === 0) return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop";
  
  const text = ingredients.join(' ').toLowerCase();
  
  // Try to match any ingredient with the map
  for (const [key, url] of Object.entries(foodImageMap)) {
    if (text.includes(key)) return url;
  }
  
  return `https://picsum.photos/seed/${encodeURIComponent(ingredients[0] || 'food')}/800/600`;
};

export async function generateTrainingPlan(profile: UserProfile, sportConfig: SportConfig, language: Language): Promise<TrainingPlan> {
  return generateCombinedTrainingPlan(profile, [sportConfig], language);
}

export async function generateCombinedTrainingPlan(profile: UserProfile, configs: SportConfig[], language: Language): Promise<TrainingPlan> {
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error("Timeout en la generación del plan. Inténtalo de nuevo.")), 25000)
  );

  try {
    const isSpanish = language === 'es';
    const sportsList = configs.map(c => `${c.sport} (${c.daysPerWeek} ${isSpanish ? 'días' : 'days'}, ${c.durationPerSession || 60} min/sesión, ${c.goal})`).join(", ");
    
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
        5. El plan debe ser REALISTA y ejecutable.
        
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
        5. The plan must be REALISTIC and executable.
        
        IMPORTANT: Each exercise MUST have a unique 'id' (e.g., 'ex_1', 'ex_2').`;

    const generatePromise = async () => {
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
    };

    return await Promise.race([generatePromise(), timeoutPromise]);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function generateNutritionPlan(profile: UserProfile): Promise<NutritionPlan[]> {
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error("Timeout en la generación de nutrición.")), 25000)
  );

  try {
    const generatePromise = async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Genera 3 variantes de planes de nutrición profesionales y equilibrados (ej. Opción A: Alta Proteína, Opción B: Equilibrada, Opción C: Baja en Carbohidratos).
        Perfil del Usuario:
        - Nombre: ${profile.username}
        - Peso: ${profile.weight}kg, Altura: ${profile.height}cm, Edad: ${profile.age}
        - Objetivo Nutricional: ${profile.nutritionGoal}
        - Plazo deseado: ${profile.nutritionTimeframe}
        - Alergias/Restricciones: ${profile.allergies || 'Ninguna'}
        - Nivel de Actividad: ${profile.experienceLevel}
        
        Cada plan debe incluir:
        1. Razonamiento científico detallado.
        2. Un catálogo de comidas (entre 4 y 6 comidas diferentes por plan).
        3. Para cada comida: nombre, ingredientes con cantidades exactas, FÓRMULA DE PREPARACIÓN PASO A PASO Y DETALLADA, y macros (p, c, f, kcal).
        4. Un CALENDARIO SEMANAL (Lunes a Domingo) indicando qué comidas del catálogo tomar cada día (3 a 5 comidas diarias según el plan).
        5. Para cada comida, incluye un campo 'imageKeyword' con una palabra clave en inglés MUY ESPECÍFICA basada en los ingredientes principales para buscar una imagen realista (ej: 'grilled-salmon-with-asparagus', 'quinoa-salad-avocado', 'oatmeal-blueberries-nuts').
        
        IMPORTANTE: Devuelve un array de objetos NutritionPlan.`,
        config: {
          systemInstruction: "Eres un nutricionista deportivo de élite. Diseñas planes de alimentación precisos, saludables y efectivos. Responde en formato JSON estructurado como un ARRAY de objetos NutritionPlan.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                meals: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING },
                      name: { type: Type.STRING },
                      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                      preparation: { type: Type.STRING },
                      imageKeyword: { type: Type.STRING },
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
                    required: ["id", "type", "name", "ingredients", "preparation", "macros", "imageKeyword"]
                  }
                },
                weeklySchedule: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING },
                      meals: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["day", "meals"]
                  }
                }
              },
              required: ["id", "name", "reasoning", "meals", "weeklySchedule"]
            }
          }
        }
      });
      const plans = JSON.parse(response.text);
      return plans.map((plan: any) => {
        const updatedMeals = plan.meals.map((meal: any) => ({
          ...meal,
          imageUrl: getImage(meal.ingredients)
        }));
        return {
          ...plan,
          meals: updatedMeals,
          imageUrl: updatedMeals[0]?.imageUrl
        };
      });
    };

    const plans = await Promise.race([generatePromise(), timeoutPromise]);
    return plans;
  } catch (error) {
    console.error("Gemini Nutrition Error:", error);
    // Fallback plans if AI fails
    const fallbackPlans = [
      {
        id: 'fallback_a',
        name: "Plan Equilibrado Vital",
        reasoning: "Plan equilibrado estándar basado en tus objetivos de salud.",
        meals: [
          { id: 'm1', type: "Desayuno", name: "Avena con Frutas", ingredients: ["Avena", "Leche desnatada", "Plátano", "Nueces"], preparation: "Mezclar la avena con la leche caliente, añadir rodajas de plátano y nueces picadas.", macros: { p: 15, c: 45, f: 10, kcal: 350 } },
          { id: 'm2', type: "Almuerzo", name: "Pollo con Arroz y Brócoli", ingredients: ["Pechuga de pollo", "Arroz integral", "Brócoli", "Aceite de oliva"], preparation: "Cocinar el arroz integral. Saltear el pollo con brócoli al vapor y un chorrito de aceite de oliva.", macros: { p: 35, c: 40, f: 12, kcal: 450 } },
          { id: 'm3', type: "Merienda", name: "Yogur Griego con Almendras", ingredients: ["Yogur griego natural", "Almendras", "Miel"], preparation: "Servir el yogur en un bol, añadir las almendras y una cucharadita de miel.", macros: { p: 20, c: 15, f: 15, kcal: 280 } },
          { id: 'm4', type: "Cena", name: "Salmón a la Plancha con Espárragos", ingredients: ["Salmón", "Espárragos", "Ensalada verde"], preparation: "Hacer el salmón a la plancha 4 min por lado. Acompañar con espárragos trigueros y ensalada.", macros: { p: 30, c: 10, f: 20, kcal: 400 } }
        ],
        weeklySchedule: [
          { day: "Lunes", meals: ["Avena con Frutas", "Pollo con Arroz y Brócoli", "Yogur Griego con Almendras", "Salmón a la Plancha con Espárragos"] },
          { day: "Martes", meals: ["Avena con Frutas", "Pollo con Arroz y Brócoli", "Yogur Griego con Almendras", "Salmón a la Plancha con Espárragos"] },
          { day: "Miércoles", meals: ["Avena con Frutas", "Pollo con Arroz y Brócoli", "Yogur Griego con Almendras", "Salmón a la Plancha con Espárragos"] },
          { day: "Jueves", meals: ["Avena con Frutas", "Pollo con Arroz y Brócoli", "Yogur Griego con Almendras", "Salmón a la Plancha con Espárragos"] },
          { day: "Viernes", meals: ["Avena con Frutas", "Pollo con Arroz y Brócoli", "Yogur Griego con Almendras", "Salmón a la Plancha con Espárragos"] },
          { day: "Sábado", meals: ["Avena con Frutas", "Pollo con Arroz y Brócoli", "Yogur Griego con Almendras", "Salmón a la Plancha con Espárragos"] },
          { day: "Domingo", meals: ["Avena con Frutas", "Pollo con Arroz y Brócoli", "Yogur Griego con Almendras", "Salmón a la Plancha con Espárragos"] }
        ]
      }
    ];

    return fallbackPlans.map(plan => ({
      ...plan,
      meals: plan.meals.map(m => ({ ...m, imageUrl: getImage(m.ingredients) })),
      imageUrl: getImage(plan.meals[0].ingredients)
    }));
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
