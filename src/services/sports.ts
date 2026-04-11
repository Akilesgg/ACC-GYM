import { db, collection, getDocs, addDoc, query, where } from '../lib/firebase';
import { Sport } from '../types';

export const getSports = async (): Promise<Sport[]> => {
  const sportsRef = collection(db, 'sports');
  const querySnapshot = await getDocs(sportsRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sport));
};

export const seedSports = async (sports: Omit<Sport, 'id'>[]) => {
  const sportsRef = collection(db, 'sports');
  const existing = await getSports();
  const existingNames = new Set(existing.map(s => s.name));

  for (const sport of sports) {
    if (!existingNames.has(sport.name)) {
      await addDoc(sportsRef, sport);
    }
  }
};
