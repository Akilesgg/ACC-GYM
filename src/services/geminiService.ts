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
    // Salmon
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
    // Huevos / Eggs
    ['huevo', 'photo-1482049016688-2d3e1b311543'],
    ['egg', 'photo-1482049016688-2d3e1b311543'],
    ['tortilla', 'photo-1482049016688-2d3e1b311543'],
    ['revuelto', 'photo-1482049016688-2d3e1b311543'],
    // Avena / Oats
    ['avena', 'photo-1495214783159-3503fd1b572d'],
    ['oatmeal', 'photo-1495214783159-3503fd1b572d'],
    ['oat', 'photo-1495214783159-3503fd1b572d'],
    ['porridge', 'photo-1495214783159-3503fd1b572d'],
    ['cereales', 'photo-1495214783159-3503fd1b572d'],
    // Pasta
    ['pasta', 'photo-1473093295043-cdd812d0e601'],
    ['espagueti', 'photo-1473093295043-cdd812d0e601'],
    ['macarron', 'photo-1473093295043-cdd812d0e601'],
    // Arroz / Rice
    ['arroz', 'photo-1536304929831-ee1ca9d44906'],
    ['rice', 'photo-1536304929831-ee1ca9d44906'],
    // Ensalada / Salad
    ['ensalada', 'photo-1512621776951-a57141f2eefd'],
    ['salad', 'photo-1512621776951-a57141f2eefd'],
    ['lechuga', 'photo-1512621776951-a57141f2eefd'],
    // Sopa
    ['sopa', 'photo-1547592166-23ac45744acd'],
    ['soup', 'photo-1547592166-23ac45744acd'],
    ['caldo', 'photo-1547592166-23ac45744acd'],
    ['crema', 'photo-1547592166-23ac45744acd'],
    // Batido / Smoothie
    ['batido', 'photo-1502741224143-90386d7f8c82'],
    ['smoothie', 'photo-1502741224143-90386d7f8c82'],
    ['proteina', 'photo-1502741224143-90386d7f8c82'],
    ['shake', 'photo-1502741224143-90386d7f8c82'],
    // Aguacate / Avocado
    ['aguacate', 'photo-1523049673857-eb18f1d7b578'],
    ['avocado', 'photo-1523049673857-eb18f1d7b578'],
    // Fruta / Fruit
    ['fruta', 'photo-1490474418585-ba9bad8fd0ea'],
    ['fruit', 'photo-1490474418585-ba9bad8fd0ea'],
    ['platano', 'photo-1490474418585-ba9bad8fd0ea'],
    ['banana', 'photo-1490474418585-ba9bad8fd0ea'],
    ['manzana', 'photo-1490474418585-ba9bad8fd0ea'],
    ['fresa', 'photo-1490474418585-ba9bad8fd0ea'],
    ['arandano', 'photo-1490474418585-ba9bad8fd0ea'],
    // Verdura / Vegetable
    ['verdura', 'photo-1540420773420-3366772f4999'],
    ['brocoli', 'photo-1540420773420-3366772f4999'],
    ['espinaca', 'photo-1540420773420-3366772f4999'],
    ['vegetable', 'photo-1540420773420-3366772f4999'],
    ['esparragos', 'photo-1540420773420-3366772f4999'],
    ['esparrago', 'photo-1540420773420-3366772f4999'],
    ['asparagus', 'photo-1540420773420-3366772f4999'],
    // Yogur
    ['yogur', 'photo-1488477181946-6428a0291777'],
    ['yogurt', 'photo-1488477181946-6428a0291777'],
    ['queso', 'photo-1488477181946-6428a0291777'],
    // Almendras / Frutos secos
    ['almendra', 'photo-1508061253366-f7da158b6d46'],
    ['almond', 'photo-1508061253366-f7da158b6d46'],
    ['nuez', 'photo-1508061253366-f7da158b6d46'],
    ['fruto seco', 'photo-1508061253366-f7da158b6d46'],
    // Pan / Toast
    ['pan', 'photo-1509440159596-0249088772ff'],
    ['tostada', 'photo-1509440159596-0249088772ff'],
    ['toast', 'photo-1509440159596-0249088772ff'],
  ];

  const match = map.find(([k]) => q.includes(k));
  const photoId = match ? match[1] : 'photo-1512621776951-a57141f2eefd';
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
      const equipInfo = c.equipment ? ` (Equipamiento: ${c.equipment})` : '';
      return `${c.sport}${equipInfo} (${c.daysPerWeek} ${isSpanish ? 'días' : 'days'}, ${c.durationPerSession || 60} min/sesión, ${c.goal})`;
    }).join(", ");
    
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
        6. IMPORTANTE: Adapta estrictamente los ejercicios al EQUIPAMIENTO especificado para cada deporte. Si el equipamiento es limitado, busca alternativas creativas (calistenia, bandas, etc.).
        
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
        6. IMPORTANT: Strictly adapt exercises to the specified EQUIPMENT for each sport. If equipment is limited, find creative alternatives (calisthenics, bands, etc.).
        
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
