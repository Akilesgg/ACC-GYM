import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TrainingPlan, SportConfig, NutritionPlan, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Función helper para obtener imagen por keywords de ingredientes
const getDietImage = (query: string): string => {
  const q = (query || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar acentos

  const map: [string, string][] = [
    // Pollo / Chicken
    ['pechuga pollo arroz', 'photo-1598515214211-89d3c73ae83b'],
    ['chicken rice', 'photo-1598515214211-89d3c73ae83b'],
    ['pollo', 'photo-1598103442097-8b74394b95c3'],
    ['chicken', 'photo-1598103442097-8b74394b95c3'],
    ['pechuga', 'photo-1598103442097-8b74394b95c3'],
    // Pescado / Fish
    ['salmon asparagus', 'photo-1467003909585-2f8a72700288'],
    ['salmon', 'photo-1467003909585-2f8a72700288'],
    ['pescado', 'photo-1467003909585-2f8a72700288'],
    ['fish', 'photo-1467003909585-2f8a72700288'],
    ['atun', 'photo-1467003909585-2f8a72700288'],
    ['merluza', 'photo-1467003909585-2f8a72700288'],
    ['bacalao', 'photo-1467003909585-2f8a72700288'],
    // Carne / Beef
    ['steak potatoes', 'photo-1546833999-b9f581a1996d'],
    ['ternera', 'photo-1546833999-b9f581a1996d'],
    ['beef', 'photo-1546833999-b9f581a1996d'],
    ['carne', 'photo-1546833999-b9f581a1996d'],
    ['cerdo', 'photo-1546833999-b9f581a1996d'],
    ['steak', 'photo-1546833999-b9f581a1996d'],
    ['solomillo', 'photo-1546833999-b9f581a1996d'],
    // Huevos / Eggs
    ['huevo aguacate', 'photo-1482049016688-2d3e1b311543'],
    ['eggs avocado', 'photo-1525351484163-7529414344d8'],
    ['huevo', 'photo-1482049016688-2d3e1b311543'],
    ['egg', 'photo-1482049016688-2d3e1b311543'],
    ['tortilla', 'photo-1482049016688-2d3e1b311543'],
    ['omni', 'photo-1482049016688-2d3e1b311543'],
    // Desayuno / Breakfast / Avena
    ['avena fruit', 'photo-1494859814609-3fbd77c95bc1'],
    ['oatmeal berries', 'photo-1494859814609-3fbd77c95bc1'],
    ['avena', 'photo-1494859814609-3fbd77c95bc1'],
    ['oatmeal', 'photo-1494859814609-3fbd77c95bc1'],
    ['breakfast', 'photo-1494859814609-3fbd77c95bc1'],
    ['pancake', 'photo-1494859814609-3fbd77c95bc1'],
    ['tostada', 'photo-1525351484163-7529414344d8'],
    ['toast', 'photo-1525351484163-7529414344d8'],
    // Ensaladas / Verduras
    ['ensalada pepino', 'photo-1512621776951-a57141f2eefd'],
    ['green salad', 'photo-1512621776951-a57141f2eefd'],
    ['ensalada', 'photo-1512621776951-a57141f2eefd'],
    ['salad', 'photo-1512621776951-a57141f2eefd'],
    ['verdura', 'photo-1540420773420-3366772f4999'],
    ['vegetable', 'photo-1540420773420-3366772f4999'],
    ['quinoa', 'photo-1512621776951-a57141f2eefd'],
    ['espinaca', 'photo-1512621776951-a57141f2eefd'],
    ['brocoli', 'photo-1512621776951-a57141f2eefd'],
    // Frutas
    ['smoothie bowl', 'photo-1502741224143-90386d7f8c82'],
    ['fruta', 'photo-1490474418585-ba9bad8fd0ea'],
    ['fruit', 'photo-1490474418585-ba9bad8fd0ea'],
    ['smoothie', 'photo-1502741224143-90386d7f8c82'],
    ['platano', 'photo-1490474418585-ba9bad8fd0ea'],
    ['apple', 'photo-1490474418585-ba9bad8fd0ea'],
    // Pasta / Arroz / Legumbres
    ['pasta bowl', 'photo-1473093295043-cdd812d0e601'],
    ['lentejas', 'photo-1514327605112-b887c0e61c0a'],
    ['garbanzos', 'photo-1514327605112-b887c0e61c0a'],
    ['lentils', 'photo-1514327605112-b887c0e61c0a'],
    ['pasta', 'photo-1473093295043-cdd812d0e601'],
    ['espagueti', 'photo-1473093295043-cdd812d0e601'],
    ['arroz', 'photo-1536304929831-ee1ca9d44906'],
    ['rice', 'photo-1536304929831-ee1ca9d44906'],
    // Postres / Yogur
    ['yogur nueces', 'photo-1511690656952-34342bb7c2f2'],
    ['yogur', 'photo-1494314671902-399b18174975'],
    ['yogurt', 'photo-1494314671902-399b18174975'],
    ['postre', 'photo-1494314671902-399b18174975'],
    ['dessert', 'photo-1494314671902-399b18174975'],
    // Frutos secos
    ['almendras', 'photo-1508061263366-9e90957f864e'],
    ['nueces', 'photo-1508061263366-9e90957f864e'],
    ['nuts', 'photo-1508061263366-9e90957f864e'],
    // Mexican / Mix
    ['taco', 'photo-1565299585-3309a4a7b0ae'],
    ['burrito', 'photo-1565299585-3309a4a7b0ae'],
    ['fajita', 'photo-1565299585-3309a4a7b0ae'],
  ];

  // Try to find the best match (multi-word matches first)
  const sortedMap = [...map].sort((a, b) => b[0].length - a[0].length);
  const match = sortedMap.find(([k]) => q.includes(k));
  const photoId = match ? match[1] : 'photo-1546069901-ba9599a7e63c';
  return `https://images.unsplash.com/${photoId}?w=800&auto=format&fit=crop&q=80`;
};

export function getRichFallbackPlan(config: SportConfig): TrainingPlan {
  const sport = config.sport.toLowerCase();
  const goal = (config.goal || '').toLowerCase();
  const days = config.daysPerWeek || 3;

  const plan: TrainingPlan = {
    id: `fallback_${sport}_${Date.now()}`,
    name: `Plan de ${config.sport}`,
    reasoning: `[Plan local] Diseño base para ${config.goal}. Optimiza tu rendimiento con esta estructura estándar.`,
    isFallback: true,
    table: [],
    createdAt: new Date().toISOString()
  };
  const exerciseBank: Record<string, Record<string, {name:string,sets:string,reps:string,notes:string,muscleGroup:string}[]>> = {
    boxeo: {
      fuerza: [
        { name: 'Jab-Cross en saco (3 rounds)', sets: '3', reps: '3 min', notes: 'Mantén los codos pegados al cuerpo. Extiende completamente el brazo al golpear.', muscleGroup: 'Hombros / Core' },
        { name: 'Hook izquierdo y derecho', sets: '3', reps: '2 min', notes: 'Gira las caderas con cada gancho. El poder viene de las piernas.', muscleGroup: 'Oblicuos / Hombros' },
        { name: 'Uppercut doble en combinación', sets: '3', reps: '2 min', notes: 'Flexiona rodillas antes de subir el golpe. No telegrafíes el movimiento.', muscleGroup: 'Tríceps / Core' },
        { name: 'Flexiones de boxeador (con rotación)', sets: '4', reps: '12', notes: 'Al subir, rotar y extender un brazo al frente simulando un jab.', muscleGroup: 'Pecho / Hombros' },
        { name: 'Saltar a la comba', sets: '5', reps: '2 min', notes: 'Mantén ritmo constante. Alterna velocidad cada 30 segundos.', muscleGroup: 'Cardiovascular / Gemelos' },
      ],
      resistencia: [
        { name: 'Shadowboxing (sombra)', sets: '6', reps: '3 min', notes: 'Visualiza un rival. Muévete constantemente, nunca estático.', muscleGroup: 'Full body' },
        { name: 'Combinaciones largas en saco', sets: '5', reps: '3 min', notes: 'Secuencias de 6-8 golpes seguidos. Respira con cada combinación.', muscleGroup: 'Brazos / Core / Piernas' },
        { name: 'Burpees con guardia', sets: '4', reps: '15', notes: 'Al subir, adoptar posición de guardia y lanzar jab-cross antes del siguiente.', muscleGroup: 'Full body' },
        { name: 'Pads de velocidad (speed bag)', sets: '4', reps: '2 min', notes: 'Golpes ligeros y rápidos. Ritmo constante, no fuerza.', muscleGroup: 'Hombros / Coordinación' },
      ],
      default: [
        { name: 'Calentamiento con comba', sets: '3', reps: '3 min', notes: 'Mantén un ritmo moderado para activar el sistema cardiovascular.', muscleGroup: 'Cardiovascular' },
        { name: 'Jab-Cross-Hook (combinación básica)', sets: '4', reps: '3 min', notes: 'Ejecuta la combinación fluidamente. Vuelve siempre a posición de guardia.', muscleGroup: 'Brazos / Core' },
        { name: 'Defensa: slip y counter', sets: '3', reps: '2 min', notes: 'Esquiva el jab imaginario girando la cabeza, responde con counter inmediato.', muscleGroup: 'Reflejos / Core' },
        { name: 'Trabajo de piernas y footwork', sets: '3', reps: '3 min', notes: 'Muévete en círculo, adelante, atrás. Nunca cruces los pies.', muscleGroup: 'Piernas / Coordinación' },
        { name: 'Abdominales de boxeador (crunch con rotación)', sets: '4', reps: '20', notes: 'Toca el codo contrario en cada repetición. Imprescindible para absorber golpes.', muscleGroup: 'Core' },
      ]
    },
    musculación: {
      fuerza: [
        { name: 'Sentadilla con barra', sets: '5', reps: '5', notes: 'Barra sobre trapecios. Espalda neutra, rodillas alineadas con pies. Bajar hasta paralelo.', muscleGroup: 'Cuádriceps / Glúteos / Core' },
        { name: 'Press de banca plano', sets: '5', reps: '5', notes: 'Agarre ligeramente más ancho que hombros. Bajar la barra al pecho controlado.', muscleGroup: 'Pecho / Tríceps / Hombros' },
        { name: 'Peso muerto convencional', sets: '4', reps: '5', notes: 'Espalda plana SIEMPRE. Empuja el suelo con los pies, no tires con la espalda.', muscleGroup: 'Isquiotibiales / Espalda / Glúteos' },
        { name: 'Press militar con barra', sets: '4', reps: '6', notes: 'De pie, core apretado. No arquees la espalda baja. Empuja hasta bloquear codos.', muscleGroup: 'Hombros / Tríceps' },
        { name: 'Dominadas con lastre', sets: '4', reps: '5', notes: 'Agarre supino para más bíceps. Bajar completamente entre repeticiones.', muscleGroup: 'Dorsal / Bíceps' },
      ],
      hipertrofia: [
        { name: 'Press banca con mancuernas', sets: '4', reps: '10-12', notes: 'Rango completo de movimiento. Pausa de 1 seg en el pecho.', muscleGroup: 'Pecho' },
        { name: 'Sentadilla goblet', sets: '4', reps: '12', notes: 'Mancuerna o kettlebell frente al pecho. Profundidad máxima.', muscleGroup: 'Cuádriceps / Glúteos' },
        { name: 'Remo con mancuerna (un brazo)', sets: '4', reps: '12 c/lado', notes: 'Codo pegado al cuerpo. Lleva la mancuerna a la cadera, no al hombro.', muscleGroup: 'Dorsal / Romboides' },
        { name: 'Curl de bíceps concentrado', sets: '3', reps: '15', notes: 'Codo apoyado en la rodilla. Sube lento (2s), baja más lento (3s).', muscleGroup: 'Bíceps' },
        { name: 'Extensión de tríceps en polea', sets: '3', reps: '15', notes: 'Codos pegados a la cabeza. Extiende completamente sin mover los codos.', muscleGroup: 'Tríceps' },
        { name: 'Elevaciones laterales con mancuernas', sets: '4', reps: '15', notes: 'Ligera inclinación hacia adelante. Sube hasta altura del hombro.', muscleGroup: 'Deltoides' },
      ],
      default: [
        { name: 'Sentadilla (peso corporal o barra)', sets: '4', reps: '10', notes: 'Pies a la anchura de los hombros. Core activo durante todo el movimiento.', muscleGroup: 'Cuádriceps / Glúteos' },
        { name: 'Flexiones (push-up)', sets: '4', reps: '12', notes: 'Cuerpo en línea recta. Baja hasta casi tocar el suelo con el pecho.', muscleGroup: 'Pecho / Tríceps' },
        { name: 'Remo invertido (en barra o mesa)', sets: '3', reps: '12', notes: 'Tira del pecho hacia la barra. Cuerpo rígido como una tabla.', muscleGroup: 'Espalda / Bíceps' },
        { name: 'Zancadas alternadas', sets: '3', reps: '10 c/lado', notes: 'Rodilla trasera casi toca el suelo. Mantén el torso erguido.', muscleGroup: 'Cuádriceps / Glúteos' },
        { name: 'Plancha', sets: '3', reps: '45 seg', notes: 'Caderas alineadas, no en alto. Aprieta glúteos y abdomen.', muscleGroup: 'Core' },
      ]
    },
    running: {
      resistencia: [
        { name: 'Rodaje suave (zona 2)', sets: '1', reps: '40 min', notes: 'Ritmo conversacional. Frecuencia cardiaca 60-70% máxima. Base aeróbica fundamental.', muscleGroup: 'Cardiovascular / Piernas' },
        { name: 'Fartlek (cambios de ritmo)', sets: '1', reps: '30 min', notes: 'Alterna 2 min suave + 1 min fuerte. Escucha tu cuerpo para los cambios.', muscleGroup: 'Cardiovascular / Core' },
        { name: 'Series 400m', sets: '8', reps: '400m', notes: 'Descanso 90 seg entre series. Ritmo 10K. Mantén consistencia en todas las series.', muscleGroup: 'Cardiovascular / Gemelos' },
        { name: 'Core para corredor (plancha lateral)', sets: '3', reps: '40 seg c/lado', notes: 'Imprescindible para economía de carrera. Cadera arriba, cuerpo rígido.', muscleGroup: 'Core / Oblicuos' },
        { name: 'Estiramientos dinámicos (cadenas musculares)', sets: '1', reps: '10 min', notes: 'Leg swings, lunges dinámicos, círculos de tobillo. Antes de correr, NO estáticos.', muscleGroup: 'Movilidad' },
      ],
      default: [
        { name: 'Rodaje suave', sets: '1', reps: '30 min', notes: 'Ritmo cómodo. Puedes mantener una conversación. Construye base aeróbica.', muscleGroup: 'Cardiovascular' },
        { name: 'Aceleraciones (strides)', sets: '6', reps: '100m', notes: 'Acelera progresivamente al 85%. Recuperación caminando de vuelta.', muscleGroup: 'Velocidad / Técnica' },
        { name: 'Sentadilla búlgara (fuerza corredores)', sets: '3', reps: '10 c/lado', notes: 'Pie trasero elevado. Fortalece el glúteo para impulso y previene lesiones.', muscleGroup: 'Glúteos / Isquiotibiales' },
        { name: 'Plancha con elevación de rodilla', sets: '3', reps: '20 c/lado', notes: 'Simula el movimiento de carrera. Core estabilizador clave para economía de carrera.', muscleGroup: 'Core / Cadera' },
      ]
    },
    ciclismo: {
      resistencia: [
        { name: 'Rodada base (Z2)', sets: '1', reps: '60 min', notes: 'Cadencia 85-95 rpm. Potencia baja, máxima duración. Construye eficiencia aeróbica.', muscleGroup: 'Cardiovascular / Cuádriceps' },
        { name: 'Intervalos 3x10 min (sweet spot)', sets: '3', reps: '10 min', notes: 'Al 88-93% FTP. Descanso 5 min entre intervalos. Máxima adaptación aeróbica.', muscleGroup: 'Cardiovascular / Piernas' },
        { name: 'Sprint out of saddle', sets: '6', reps: '15 seg', notes: 'Levántate del sillín. Máxima potencia 15 seg. Recuperación 5 min entre sprints.', muscleGroup: 'Potencia / Glúteos' },
        { name: 'Sentadilla prensa (fuerza ciclista)', sets: '4', reps: '10', notes: 'Pies a la anchura de caderas. Simula el pedaleo. Fortalece cuádriceps sin impacto.', muscleGroup: 'Cuádriceps / Glúteos' },
      ],
      default: [
        { name: 'Calentamiento en bici (progresivo)', sets: '1', reps: '15 min', notes: 'Empieza suave, aumenta cadencia cada 5 minutos. Activa articulaciones.', muscleGroup: 'Cardiovascular' },
        { name: 'Trabajo técnico en llano', sets: '1', reps: '30 min', notes: 'Cadencia alta (95+ rpm) con resistencia baja. Mejora la economía de pedaleo.', muscleGroup: 'Técnica / Cardiovascular' },
        { name: 'Subida en rampa moderada', sets: '3', reps: '5 min', notes: 'Cadencia 70-80 rpm en subida. Mantén la espalda recta, no balancees el cuerpo.', muscleGroup: 'Cuádriceps / Glúteos' },
        { name: 'Estiramiento cadena posterior', sets: '1', reps: '10 min', notes: 'Isquiotibiales, lumbares y gemelos. Fundamental tras cada sesión en bici.', muscleGroup: 'Movilidad' },
      ]
    },
    natación: {
      default: [
        { name: 'Calentamiento (200m estilo libre)', sets: '1', reps: '200m', notes: 'Ritmo suave para activar hombros y cadera. Enfócate en la técnica de brazada.', muscleGroup: 'Full body / Hombros' },
        { name: 'Series de kicking (patada)', sets: '4', reps: '50m', notes: 'Con tabla. Patada desde la cadera, no desde la rodilla. Tobillo relajado.', muscleGroup: 'Piernas / Core' },
        { name: 'Pulling (solo brazos con boya)', sets: '4', reps: '100m', notes: 'Boya entre las piernas. Enfoca toda la atención en la entrada de la mano al agua.', muscleGroup: 'Hombros / Dorsal / Tríceps' },
        { name: 'Series de velocidad (25m máximo)', sets: '8', reps: '25m', notes: 'Máxima velocidad. Descanso 30 seg. Mejora la cadencia y la potencia de brazada.', muscleGroup: 'Full body' },
        { name: 'Enfriamiento (100m espalda)', sets: '1', reps: '100m', notes: 'Suave. Desactiva el sistema nervioso y relaja los músculos del hombro.', muscleGroup: 'Recuperación' },
      ]
    },
    yoga: {
      default: [
        { name: 'Saludo al sol (Surya Namaskar)', sets: '5', reps: '5 ciclos', notes: 'Coordinación respiración-movimiento. Inspira al expandir, espira al contraer.', muscleGroup: 'Full body / Movilidad' },
        { name: 'Guerrero I y II (Virabhadrasana)', sets: '3', reps: '45 seg c/lado', notes: 'Cadera mirando al frente en Guerrero I. Cadera abierta en Guerrero II.', muscleGroup: 'Piernas / Cadera / Hombros' },
        { name: 'Perro boca abajo (Adho Mukha)', sets: '1', reps: '2 min', notes: 'Empuja el suelo con las palmas. Alarga la columna, talones hacia el suelo.', muscleGroup: 'Isquiotibiales / Hombros / Espalda' },
        { name: 'Torsión sentada', sets: '3', reps: '60 seg c/lado', notes: 'Mantén la columna erguida durante la rotación. Profundiza con cada espiración.', muscleGroup: 'Columna / Oblicuos' },
        { name: 'Savasana (relajación final)', sets: '1', reps: '5 min', notes: 'Tumbado boca arriba. Suelta completamente el cuerpo. Respiración natural.', muscleGroup: 'Recuperación / Mente' },
      ]
    },
  };

  // Seleccionar ejercicios según deporte y objetivo
  const sportKey = Object.keys(exerciseBank).find(k => sport.includes(k)) || 'default';
  const sportExercises = exerciseBank[sportKey as keyof typeof exerciseBank] || exerciseBank.musculación;
  
  const goalKey = Object.keys(sportExercises).find(k => goal.includes(k)) || 'default';
  const exercises = (sportExercises as any)[goalKey] || (sportExercises as any).default || Object.values(sportExercises)[0];

  // Distribuir ejercicios en los días de entrenamiento
  const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Días de descanso distribuidos uniformemente
  const trainingDayIndices: number[] = [];
  const gap = 7 / days;
  for (let i = 0; i < days; i++) {
    trainingDayIndices.push(Math.round(i * gap));
  }

  const table = allDays.map((day, idx) => {
    const isTrainingDay = trainingDayIndices.includes(idx);
    if (!isTrainingDay) {
      return { day, exercises: [] };
    }
    // Rotar ejercicios para variedad entre días
    const rotated = [...exercises.slice(idx % exercises.length), ...exercises.slice(0, idx % exercises.length)];
    return {
      day,
      exercises: rotated.slice(0, Math.min(5, exercises.length)).map((ex, i) => ({
        id: `${day.toLowerCase()}-${i}-${Date.now()}`,
        ...ex
      }))
    };
  });

  return {
    id: `fallback-${Date.now()}`,
    createdAt: new Date().toISOString(),
    reasoning: `Plan de ${config.sport} orientado a ${config.goal || 'rendimiento general'}. ${days} días/semana, ${config.durationPerSession || 60} min/sesión. [Plan local - regenera cuando la IA esté disponible]`,
    table,
    isFallback: true  // Marcar como fallback para mostrar aviso
  } as TrainingPlan;
}

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
        5. For each meal AND for the plan itself, include an 'imageSearchQuery' field with 4-5 English keywords describing EVERYTHING: the main protein, the sides, and the key ingredients (e.g., "grilled chicken breast with brown rice and steamed broccoli", "oatmeal with blueberries banana and walnuts", "baked salmon fillet with asparagus and lemon").
        
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
