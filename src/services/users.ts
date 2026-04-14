import { db, doc, getDoc, setDoc, updateDoc, onSnapshot, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const createUserProfile = async (profile: UserProfile) => {
  const path = `users/${profile.uid}`;
  try {
    const docRef = doc(db, 'users', profile.uid);
    await setDoc(docRef, profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  const path = `users/${uid}`;
  const docRef = doc(db, 'users', uid);
  try {
    // Usamos setDoc con merge: true para que funcione incluso si el documento no existe
    await setDoc(docRef, updates, { merge: true });
  } catch (error: any) {
    if (error.code === 'resource-exhausted') {
      console.error("[FIRESTORE] Cuota excedida. Los cambios no se guardarán hasta que se reinicie la cuota diaria.");
      throw new Error("QUOTA_EXCEEDED");
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const subscribeToProfile = (uid: string, callback: (profile: UserProfile | null) => void, onError?: (error: any) => void) => {
  const path = `users/${uid}`;
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
    if (onError) onError(error);
  });
};
