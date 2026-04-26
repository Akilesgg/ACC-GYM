export const INITIAL_SPORTS = [
  // CONTACTO Y COMBATE
  { name: "Boxeo", icon: "Trophy", category: "Contacto", imageUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=400&auto=format&fit=crop", subtypes: ["Fitness / Cardio", "Amateur / Competición", "Muay Thai", "Kickboxing", "Solo saco"] },
  { name: "MMA", icon: "Sword", category: "Contacto", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop", subtypes: ["Principiante", "Competición", "Defensa Personal"] },
  { name: "Muay Thai", icon: "Sword", category: "Contacto", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Jiu-Jitsu Brasileño", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Karate", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Judo", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Taekwondo", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Lucha Libre", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },

  // FUERZA
  { name: "Musculación", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop", subtypes: ["Hipertrofia", "Fuerza Máxima", "Definición", "Powerlifting", "Solo mancuernas", "Sin equipamiento"] },
  { name: "Calistenia", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop", subtypes: ["Principiante", "Avanzado", "Street Workout"] },
  { name: "Halterofilia", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },
  { name: "Powerlifting", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },

  // CARDIO / HÍBRIDO
  { name: "CrossFit", icon: "Flame", category: "Híbrido", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop" },
  { name: "Running", icon: "Footprints", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=400&auto=format&fit=crop", subtypes: ["Asfalto", "Trail Running", "Pista", "Cinta", "5K", "10K", "Maratón"] },
  { name: "Ciclismo", icon: "Bike", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop", subtypes: ["Carretera", "Montaña (MTB)", "Indoor/Spinning", "Gravel", "BMX", "Pista (Velódromo)", "Ciclocross"] },
  { name: "Natación", icon: "Waves", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1530549387074-dca99938023a?q=80&w=400&auto=format&fit=crop", subtypes: ["Piscina", "Aguas Abiertas", "Sincronizada"] },
  { name: "Triatlón", icon: "Timer", category: "Híbrido", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop", subtypes: ["Sprint", "Olímpico", "Ironman"] },
  { name: "Spinning", icon: "Bike", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop" },
  { name: "Remo", icon: "Anchor", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop" },

  // BIENESTAR / FLEXIBILIDAD
  { name: "Yoga", icon: "Heart", category: "Bienestar", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop", subtypes: ["Hatha", "Vinyasa", "Ashtanga", "Yin", "Hot Yoga"] },
  { name: "Pilates", icon: "Heart", category: "Bienestar", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop", subtypes: ["Suelo", "Reformer"] },

  // DEPORTES DE EQUIPO
  { name: "Fútbol", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop", subtypes: ["11 / Campo completo", "Fútbol Sala", "Fútbol 7", "Portero"] },
  { name: "Baloncesto", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop" },
  { name: "Voleibol", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1592656670411-2918d70c6a44?q=80&w=400&auto=format&fit=crop", subtypes: ["Indoor", "Playa"] },
  { name: "Rugby", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop" },
  { name: "Balonmano", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop" },
  { name: "Hockey", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop", subtypes: ["Hierba", "Hielo", "Patines"] },

  // RAQUETA
  { name: "Tenis", icon: "Activity", category: "Raqueta", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop" },
  { name: "Pádel", icon: "Activity", category: "Raqueta", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop" },
  { name: "Squash", icon: "Activity", category: "Raqueta", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop" },
  { name: "Bádminton", icon: "Activity", category: "Raqueta", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop" },

  // AVENTURA / EXTERIOR
  { name: "Escalada", icon: "Mountain", category: "Aventura", imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=400&auto=format&fit=crop", subtypes: ["Rocódromo", "Roca", "Búlder", "Deportiva"] },
  { name: "Surf", icon: "Waves", category: "Agua", imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=400&auto=format&fit=crop", subtypes: ["Shortboard", "Longboard", "Bodyboard"] },
  { name: "Esquí", icon: "MountainSnow", category: "Invierno", imageUrl: "https://images.unsplash.com/photo-1551698618-1fed5d978044?q=80&w=400&auto=format&fit=crop", subtypes: ["Alpino", "Fondo", "Freestyle"] },
  { name: "Snowboarding", icon: "MountainSnow", category: "Invierno", imageUrl: "https://images.unsplash.com/photo-1485433592409-9018e83a1f0d?q=80&w=400&auto=format&fit=crop" },
  { name: "Paddle Surf", icon: "Anchor", category: "Agua", imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=400&auto=format&fit=crop" },

  // URBANO / SKILLS
  { name: "Skateboarding", icon: "Activity", category: "Urbano", imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=400&auto=format&fit=crop" },
  { name: "Parkour", icon: "Flame", category: "Urbano", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop" },
  { name: "Danza", icon: "Palette", category: "Arte", imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop", subtypes: ["Ballet", "Contemporáneo", "Urbana / Hip Hop", "Salsa", "Bachata"] },
  { name: "Golf", icon: "Activity", category: "Precisión", imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=400&auto=format&fit=crop" },
];
