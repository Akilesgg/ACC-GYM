import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TrainingPlan, SportConfig, NutritionPlan, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Función helper para obtener imagen por keywords de ingredientes
const getDietImage = (query: string): string => {
  const q = (query || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar acentos

  const map: [string, string][] = [
    // Pollo / Chicken
    ['pechuga pollo arroz brocoli', 'photo-1598515214211-89d3c73ae83b'],
    ['chicken rice broccoli', 'photo-1598515214211-89d3c73ae83b'],
    ['pollo asado patatas ensalada', 'photo-1532550907401-a500c9a57435'],
    ['chicken potatoes salad', 'photo-1532550907401-a500c9a57435'],
    ['pollo curry arroz coco', 'photo-1588166524941-3bf61a9c41db'],
    ['pavo quinoa espinacas tomate', 'photo-1512621776951-a57141f2eefd'],
    ['pollo', 'photo-1598103442097-8b74394b95c3'],
    // Pescado / Fish
    ['salmon esparragos limon patatas', 'photo-1467003909585-2f8a72700288'],
    ['salmon asparagus lemon', 'photo-1467003909585-2f8a72700288'],
    ['atun aguacate huevo tomate', 'photo-1523049673857-eb18f1d7b578'],
    ['merluza patatas judias verdes', 'photo-1519708227418-c8fd9a32b7a2'],
    ['pescado blanco', 'photo-1519708227418-c8fd9a32b7a2'],
    ['sushi sashimi pescado crudo', 'photo-1553621042-f6e147245754'],
    ['atun aguacate', 'photo-1523049673857-eb18f1d7b578'],
    ['pescado', 'photo-1467003909585-2f8a72700288'],
    // Carne / Beef
    ['filete ternera patatas pimientos', 'photo-1546833999-b9f581a1996d'],
    ['steak potatoes peppers', 'photo-1546833999-b9f581a1996d'],
    ['ternera brocoli arroz integral', 'photo-1504674900247-0877df9cc836'],
    ['hamburguesa casera lechuga tomate', 'photo-1568901346375-23c9450c58cd'],
    ['entrecot verduras parrilla', 'photo-1546833999-b9f581a1996d'],
    ['ternera', 'photo-1546833999-b9f581a1996d'],
    // Huevos / Eggs
    ['huevos revueltos aguacate tostada', 'photo-1525351484163-7529414344d8'],
    ['scrambled eggs avocado toast', 'photo-1525351484163-7529414344d8'],
    ['tortilla espinacas queso champiñones', 'photo-1482049016688-2d3e1b311543'],
    ['huevos cocidos esparragos cherry', 'photo-1516100882582-96c3a05fe590'],
    ['huevos', 'photo-1525351484163-7529414344d8'],
    // Desayuno
    ['avena arandanos platano nueces', 'photo-1494859814609-3fbd77c95bc1'],
    ['oatmeal berries banana nuts', 'photo-1494859814609-3fbd77c95bc1'],
    ['yogur griego nueces miel chia', 'photo-1511690656952-34342bb7c2f2'],
    ['greek yogurt nuts honey', 'photo-1511690656952-34342bb7c2f2'],
    ['tostada aguacate salmon huevo', 'photo-1525351484163-7529414344d8'],
    ['panqueques avena platano arandanos', 'photo-1528207776546-365bb710ee93'],
    ['fruta variada piña sandia', 'photo-1490474418585-ba9bad8fd0ea'],
    ['batido proteinas fresa platano', 'photo-1502741224143-90386d7f8c82'],
    ['avena', 'photo-1494859814609-3fbd77c95bc1'],
    // Pasta / Arroz
    ['espaguetis bolonera ternera tomate', 'photo-1551183053-bf91a1d81141'],
    ['pasta integral verduras atun', 'photo-1473093295043-cdd812d0e601'],
    ['arroz integral verduras tofu', 'photo-1512621776951-a57141f2eefd'],
    ['lasaña verduras calabacin berenjena', 'photo-1574894709066-1102214a6680'],
    ['arroz blanco', 'photo-1536304929831-ee1ca9d44906'],
    // Legumbres / Ensaladas
    ['lentejas arroz verduras zanahoria', 'photo-1514327605112-b887c0e61c0a'],
    ['garbanzos espinacas huevo duro', 'photo-1514327605112-b887c0e61c0a'],
    ['ensalada mixta atun huevo', 'photo-1512621776951-a57141f2eefd'],
    ['quinoa pollo pimientos pepino', 'photo-1490645935967-10de6ba17051'],
    ['tofu verduras soja sesamo', 'photo-1546069901-ba9599a7e63c'],
    // High-Density / Ingredient-Rich fallbacks (Clinical/Lab style)
    ['ingredientes', 'photo-1490645935967-10de6ba17051'],
    ['ingredients', 'photo-1490645935967-10de6ba17051'],
    ['preparacion', 'photo-1547592166-23ac45744acd'],
    ['bowl', 'photo-1494314671902-399b18174975'],
    ['superfoods', 'photo-1490645935967-10de6ba17051'],
  ];

  // Try to find the best match (more specific/long matches first)
  const sortedMap = [...map].sort((a, b) => b[0].length - a[0].length);
  const match = sortedMap.find(([k]) => q.includes(k));
  
  if (match) {
    return `https://images.unsplash.com/${match[1]}?w=800&auto=format&fit=crop&q=80`;
  }

  // Si no hay match, generamos una imagen de comida variada usando la propia query para que Unsplash intente buscar algo (vía el ID si podemos, pero aquí solo tenemos el mapeo)
  // Como fallback real, usamos una semilla basada en el texto para que al menos sea determinista pero diferente entre platos
  const seed = q.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackPhotos = [
    'photo-1546069901-ba9599a7e63c',
    'photo-1504674900247-0877df9cc836',
    'photo-1512621776951-a57141f2eefd',
    'photo-1473093295043-cdd812d0e601',
    'photo-1547592166-23ac45744acd',
    'photo-1532550907401-a500c9a57435'
  ];
  return `https://images.unsplash.com/${fallbackPhotos[seed % fallbackPhotos.length]}?w=800&auto=format&fit=crop&q=80`;
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
        1. Detailed scientific reasoning based on the user's metabolism.
        2. A catalog of meals (at least 6 different options).
        3. For each meal: a catchy name, ALL main ingredients (minimum 9 key components when possible for richness), exact preparation steps (chef-level detail), and macros.
        4. A WEEKLY CALENDAR.
        5. For each meal, an 'imageSearchQuery' that combines the three most visual ingredients (e.g., "grilled salmon with avocado and asparagus").
        
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
          { 
            id: 'm1', 
            type: "Desayuno", 
            name: "Bowl Energético de Avena y Superalimentos", 
            imageSearchQuery: "oatmeal berries banana nuts chia honey", 
            ingredients: ["Avena integral", "Leche de almendras", "Arándanos frescos", "Medio plátano", "Nueces pecanas", "Semillas de chía", "Canela en polvo", "Miel orgánica", "Frambuesas"], 
            preparation: "1. Cocinar la avena con la leche. 2. Añadir canela. 3. Cubrir con frutas y semillas. 4. Endulzar con miel.", 
            macros: { p: 18, c: 55, f: 12, kcal: 420 } 
          },
          { 
            id: 'm2', 
            type: "Almuerzo", 
            name: "Pechuga de Pollo al Limón con Cuscús y Vegetales", 
            imageSearchQuery: "grilled chicken lemon couscous vegetables", 
            ingredients: ["Pechuga de pollo", "Cuscús integral", "Cebolla roja", "Pimiento rojo", "Calabacín", "Zumo de limón", "Aceite de oliva virgen extra", "Pimienta negra", "Perejil fresco"], 
            preparation: "1. Marinar pollo en limón. 2. Saltear vegetales. 3. Preparar cuscús. 4. Combinar y servir.", 
            macros: { p: 42, c: 45, f: 14, kcal: 510 } 
          },
          { 
            id: 'm3', 
            type: "Merienda", 
            name: "Yogur de Probióticos con Mix de Frutos Secos", 
            imageSearchQuery: "greek yogurt nuts berries", 
            ingredients: ["Yogur griego 0%", "Almendras", "Avellanas", "Anacardos", "Semillas de calabaza", "Arándanos secos", "Sésamo", "Fofos de coco", "Hojas de menta"], 
            preparation: "Mezclar el yogur con todos los ingredientes secos en un bol.", 
            macros: { p: 22, c: 18, f: 18, kcal: 320 } 
          },
          { 
            id: 'm4', 
            type: "Cena", 
            name: "Lomo de Salmón con Espárragos y Batata", 
            imageSearchQuery: "salmon asparagus sweet potato avocado", 
            ingredients: ["Salmón noruego", "Espárragos trigueros", "Batata asada", "Aguacate", "Tomates cherry", "Rúcula", "Vinagre balsámico", "Ajo", "Sal rosa del Himalaya"], 
            preparation: "1. Hornear salmón y batata a 200°C. 2. Hacer espárragos a la plancha con ajo. 3. Servir con aguacate fresco.", 
            macros: { p: 35, c: 25, f: 22, kcal: 480 } 
          }
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
