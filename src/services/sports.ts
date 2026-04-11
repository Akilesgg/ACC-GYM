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
  if (existing.length === 0) {
    for (const sport of sports) {
      await addDoc(sportsRef, sport);
    }
  }
};
