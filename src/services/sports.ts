import { db, collection, getDocs, addDoc, query, where, onSnapshot, doc, updateDoc } from '../lib/firebase';
import { Sport } from '../types';

export const getSports = async (): Promise<Sport[]> => {
  const sportsRef = collection(db, 'sports');
  const querySnapshot = await getDocs(sportsRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sport));
};

export const subscribeToSports = (callback: (sports: Sport[]) => void) => {
  const sportsRef = collection(db, 'sports');
  return onSnapshot(sportsRef, (snapshot) => {
    const sports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sport));
    callback(sports);
  });
};

export const seedSports = async (sports: Omit<Sport, 'id'>[]) => {
  const sportsRef = collection(db, 'sports');
  const existing = await getSports();
  const existingMap = new Map(existing.map(s => [s.name, s]));

  for (const sport of sports) {
    const existingSport = existingMap.get(sport.name);
    if (!existingSport) {
      await addDoc(sportsRef, sport);
    } else if (!existingSport.imageUrl && sport.imageUrl) {
      const sportDoc = doc(db, 'sports', existingSport.id);
      await updateDoc(sportDoc, { imageUrl: sport.imageUrl });
    }
  }
};
