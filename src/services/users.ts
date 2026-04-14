import { db, doc, getDoc, setDoc, updateDoc, onSnapshot } from '../lib/firebase';
import { UserProfile } from '../types';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (profile: UserProfile) => {
  const docRef = doc(db, 'users', profile.uid);
  await setDoc(docRef, profile);
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', uid);
  try {
    await updateDoc(docRef, updates);
  } catch (error: any) {
    if (error.code === 'resource-exhausted') {
      console.error("[FIRESTORE] Cuota excedida. Los cambios no se guardarán hasta que se reinicie la cuota diaria.");
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
};

export const subscribeToProfile = (uid: string, callback: (profile: UserProfile | null) => void, onError?: (error: any) => void) => {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserProfile);
    } else {
      callback(null);
    }
  }, onError);
};
