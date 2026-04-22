import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TrainingPlan, SportConfig, NutritionPlan, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Función helper para obtener imagen por keywords de ingredientes
const getDietImage = (query: string): string => {
  const q = (query || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar acentos

  const map: [string, string][] = [
    // Pollo / Chicken
    ['pollo', 'photo-1598103442097-8b74394b95c3'],
    ['chicken', 'photo-1598103442097-8b74394b95c3'],
    ['pechuga', 'photo-1598103442097-8b74394b95c3'],
    // Pescado / Fish
    ['salmon', 'photo-1467003909585-2f8a72700288'],
    ['pescado', 'photo-1467003909585-2f8a72700288'],
    ['fish', 'photo-1467003909585-2f8a72700288'],
    ['atun', 'photo-1467003909585-2f8a72700288'],
    ['merluza', 'photo-1467003909585-2f8a72700288'],
    // Carne / Beef
    ['ternera', 'photo-1546833999-b9f581a1996d'],
    ['beef', 'photo-1546833999-b9f581a1996d'],
    ['carne', 'photo-1546833999-b9f581a1996d'],
    ['cerdo', 'photo-1546833999-b9f581a1996d'],
    ['steak', 'photo-1546833999-b9f581a1996d'],
    // Huevos / Eggs
    ['huevo', 'photo-1482049016688-2d3e1b311543'],
    ['egg', 'photo-1482049016688-2d3e1b311543'],
    ['tortilla', 'photo-1482049016688-2d3e1b311543'],
    ['omni', 'photo-1482049016688-2d3e1b311543'],
    // Desayuno / Breakfast / Avena
    ['avena', 'photo-1494859814609-3fbd77c95bc1'],
    ['oatmeal', 'photo-1494859814609-3fbd77c95bc1'],
    ['breakfast', 'photo-1494859814609-3fbd77c95bc1'],
    ['pancake', 'photo-1494859814609-3fbd77c95bc1'],
    ['tostada', 'photo-1525351484163-7529414344d8'],
    ['toast', 'photo-1525351484163-7529414344d8'],
    // Ensaladas / Verduras
    ['ensalada', 'photo-1512621776951-a57141f2eefd'],
    ['salad', 'photo-1512621776951-a57141f2eefd'],
    ['verdura', 'photo-1540420773420-3366772f4999'],
    ['vegetable', 'photo-1540420773420-3366772f4999'],
    ['quinoa', 'photo-1512621776951-a57141f2eefd'],
    // Frutas
    ['fruta', 'photo-1490474418585-ba9bad8fd0ea'],
    ['fruit', 'photo-1490474418585-ba9bad8fd0ea'],
    ['smoothie', 'photo-1502741224143-90386d7f8c82'],
    ['batido', 'photo-1502741224143-90386d7f8c82'],
    // Pasta / Arroz
    ['pasta', 'photo-1473093295043-cdd812d0e601'],
    ['espagueti', 'photo-1473093295043-cdd812d0e601'],
    ['arroz', 'photo-1536304929831-ee1ca9d44906'],
    ['rice', 'photo-1536304929831-ee1ca9d44906'],
  ];

  const match = map.find(([k]) => q.includes(k));
  const photoId = match ? match[1] : 'photo-1546069901-ba9599a7e63c';
  return `https://images.unsplash.com/${photoId}?w=800&auto=format&fit=crop&q=80`;
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
    const sportsList = configs.map(c => {
      const equipInfo = c.equipment ? ` (Recursos: ${JSON.stringify(c.equipment)})` : '';
      const subtypeInfo = c.subtype ? ` [Subtipo: ${c.subtype}]` : '';
      return `${c.sport}${subtypeInfo}${equipInfo} (${c.daysPerWeek} ${isSpanish ? 'días' : 'days'}, ${c.durationPerSession || 60} min/sesión, ${c.goal})`;
    }).join(", ");
    
    const prompt = isSpanish 
      ? `Genera un plan de entrenamiento COMBINADO, profesional y EDUCATIVO para: ${sportsList}.
        Perfil: ${profile.username}, ${profile.weight}kg, ${profile.height}cm. Objetivo: ${profile.nutritionGoal || 'Mejora general'}. Nivel: ${profile.experienceLevel}. Lesiones: ${profile.injuries || 'Ninguna'}.
        
        Instrucciones:
        1. Horario semanal de 7 días.
        2. Por cada deporte/día: 5-7 EJERCICIOS con progresión técnica (Técnica -> Potencia -> Resistencia).
        3. Identifica cada ejercicio con su 'sport'.
        4. ADAPTA AL EQUIPAMIENTO REAL: ${JSON.stringify(configs.map(c => c.equipment))}. Si no hay material específico, usa 'alternatives'.
        5. Rellena: 'muscleGroup', 'equipment' necesario, 'executionTip' (consejo pro), 'videoKeyword' (ej: "propioception drills football") y 'alternatives' (sin material).
        6. 'executionNotes': Explicación de la mentalidad semanal.`
      : `Generate a COMBINED EDUCATIONAL training plan for: ${sportsList}.
        Profile: ${profile.username}, ${profile.weight}kg, ${profile.height}cm. Goal: ${profile.nutritionGoal || 'General improvement'}. Level: ${profile.experienceLevel}. Injuries: ${profile.injuries || 'None'}.
        
        Instructions:
        1. 7-day weekly schedule.
        2. Per sport/day: 5-7 EXERCISES with technical progression.
        3. Label each exercise with its 'sport'.
        4. ADAPT TO EQUIPMENT: ${JSON.stringify(configs.map(c => c.equipment))}. Use 'alternatives' if equipment is missing.
        5. Fill: 'muscleGroup', 'equipment', 'executionTip' (pro tip), 'videoKeyword' (e.g., "boxing footwork drills") and 'alternatives' (no equipment).
        6. 'executionNotes': Weekly mindset explanation.`;

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
              executionNotes: { type: Type.STRING },
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
                          notes: { type: Type.STRING },
                          muscleGroup: { type: Type.STRING },
                          equipment: { type: Type.STRING },
                          imageSearchQuery: { type: Type.STRING },
                          executionTip: { type: Type.STRING },
                          videoKeyword: { type: Type.STRING },
                          alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                          sport: { type: Type.STRING }
                        },
                        required: ["id", "name", "sets", "reps", "notes", "muscleGroup", "equipment", "imageSearchQuery", "executionTip", "videoKeyword", "alternatives", "sport"]
                      }
                    }
                  },
                  required: ["day", "exercises"]
                }
              }
            },
            required: ["reasoning", "executionNotes", "table"]
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
        
        Each plan must include:
        1. Detailed scientific reasoning.
        2. A catalog of meals (between 4 and 6 different meals per plan).
        3. For each meal: name, ingredients with exact amounts, STEP-BY-STEP AND DETAILED PREPARATION FORMULA, and macros (p, c, f, kcal).
        4. A WEEKLY CALENDAR (Monday to Sunday) indicating which meals from the catalog to take each day (3 to 5 daily meals according to the plan).
        5. For each meal AND for the plan itself, include an 'imageSearchQuery' field with 2-3 English keywords of the main ingredients (e.g., "chicken rice broccoli", "oatmeal blueberries nuts", "salmon asparagus salad").
        
        IMPORTANT: Return an array of NutritionPlan objects.`,
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
                imageSearchQuery: { type: Type.STRING },
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
                      imageSearchQuery: { type: Type.STRING },
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
                    required: ["id", "type", "name", "ingredients", "preparation", "macros", "imageSearchQuery"]
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
              required: ["id", "name", "reasoning", "meals", "weeklySchedule", "imageSearchQuery"]
            }
          }
        }
      });
      const plans = JSON.parse(response.text);
      return plans.map((plan: any) => {
        const updatedMeals = plan.meals.map((meal: any) => ({
          ...meal,
          imageUrl: getDietImage(meal.imageSearchQuery || [meal.name, ...(meal.ingredients||[])].join(' '))
        }));
        return {
          ...plan,
          meals: updatedMeals,
          imageUrl: getDietImage(plan.imageSearchQuery || plan.name)
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
        imageSearchQuery: "healthy balanced meal",
        meals: [
          { id: 'm1', type: "Desayuno", name: "Avena con Frutas", imageSearchQuery: "oatmeal banana nuts", ingredients: ["Avena", "Leche desnatada", "Plátano", "Nueces"], preparation: "Mezclar la avena con la leche caliente, añadir rodajas de plátano y nueces picadas.", macros: { p: 15, c: 45, f: 10, kcal: 350 } },
          { id: 'm2', type: "Almuerzo", name: "Pollo con Arroz y Brócoli", imageSearchQuery: "chicken rice broccoli", ingredients: ["Pechuga de pollo", "Arroz integral", "Brócoli", "Aceite de oliva"], preparation: "Cocinar el arroz integral. Saltear el pollo con brócoli al vapor y un chorrito de aceite de oliva.", macros: { p: 35, c: 40, f: 12, kcal: 450 } },
          { id: 'm3', type: "Merienda", name: "Yogur Griego con Almendras", imageSearchQuery: "greek yogurt almonds honey", ingredients: ["Yogur griego natural", "Almendras", "Miel"], preparation: "Servir el yogur en un bol, añadir las almendras y una cucharadita de miel.", macros: { p: 20, c: 15, f: 15, kcal: 280 } },
          { id: 'm4', type: "Cena", name: "Salmón a la Plancha con Espárragos", imageSearchQuery: "salmon asparagus grill", ingredients: ["Salmón", "Espárragos", "Ensalada verde"], preparation: "Hacer el salmón a la plancha 4 min por lado. Acompañar con espárragos trigueros y ensalada.", macros: { p: 30, c: 10, f: 20, kcal: 400 } }
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

    return fallbackPlans.map(plan => {
      const updatedMeals = plan.meals.map((m: any) => ({ 
        ...m, 
        imageUrl: getDietImage(m.imageSearchQuery || [m.name, ...(m.ingredients||[])].join(' ')) 
      }));
      return {
        ...plan,
        meals: updatedMeals,
        imageUrl: getDietImage(plan.imageSearchQuery || updatedMeals[0].name)
      };
    });
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
