import { db, collection, getDocs, addDoc, query, where, onSnapshot, doc, updateDoc, setDoc } from '../lib/firebase';
import { Sport } from '../types';

export const getSports = async (): Promise<Sport[]> => {
  const sportsRef = collection(db, 'sports');
  const querySnapshot = await getDocs(sportsRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sport));
};

export const subscribeToSports = (callback: (sports: Sport[]) => void, onError?: (error: any) => void) => {
  const sportsRef = collection(db, 'sports');
  return onSnapshot(sportsRef, (snapshot) => {
    const sports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sport));
    callback(sports);
  }, (error) => {
    console.error("Firestore sports subscription error:", error);
    if (onError) onError(error);
  });
};

export const seedSports = async (sports: Omit<Sport, 'id'>[]) => {
  try {
    const sportsRef = collection(db, 'sports');
    
    // Usar setDoc con un ID predecible para evitar duplicados y asegurar escritura
    const promises = sports.map(sport => {
      const sportId = sport.name.toLowerCase().replace(/\s+/g, '_');
      const docRef = doc(db, 'sports', sportId);
      return setDoc(docRef, sport, { merge: true });
    });

    console.log(`[SEED] Lanzando ${promises.length} operaciones de escritura...`);
    await Promise.all(promises);
    console.log(`[SEED] Seeding completado con éxito.`);
  } catch (error) {
    console.error("[SEED] Error crítico durante seeding:", error);
    throw error;
  }
};
