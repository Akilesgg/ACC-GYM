import { db, collection, getDocs, addDoc, query, where, onSnapshot, doc, updateDoc } from '../lib/firebase';
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
    const existing = await getSports();
    console.log(`[SEED] Found ${existing.length} existing sports in DB.`);
    const existingMap = new Map(existing.map(s => [s.name, s]));

    let addedCount = 0;
    let updatedCount = 0;

    for (const sport of sports) {
      const existingSport = existingMap.get(sport.name);
      if (!existingSport) {
        await addDoc(sportsRef, sport);
        addedCount++;
      } else if (!existingSport.imageUrl && sport.imageUrl) {
        const sportDoc = doc(db, 'sports', existingSport.id);
        await updateDoc(sportDoc, { imageUrl: sport.imageUrl });
        updatedCount++;
      }
    }
    console.log(`[SEED] Seeding finished. Added: ${addedCount}, Updated: ${updatedCount}`);
  } catch (error) {
    console.error("[SEED] Error during seeding:", error);
    throw error;
  }
};
