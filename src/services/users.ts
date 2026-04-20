import { db, doc, getDoc, setDoc, updateDoc, onSnapshot, handleFirestoreError, OperationType } from '../lib/firebase';
import { deleteField } from 'firebase/firestore';
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

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
  const path = `users/${profile.uid}`;
  console.log(`[FIRESTORE] Attempting to create profile at ${path}...`);
  try {
    const docRef = doc(db, 'users', profile.uid);
    await setDoc(docRef, profile);
    console.log(`[FIRESTORE] Profile created for ${profile.uid}`);
  } catch (error) {
    console.error(`[FIRESTORE] Error creating profile for ${profile.uid}:`, error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  if (!uid) throw new Error("UID de usuario requerido para actualizar perfil.");
  
  const docRef = doc(db, 'users', uid);
  try {
    console.log(`[FIRESTORE] Guardando perfil en: users/${uid}`);
    
    // No usamos JSON stringify/parse agresivo para no perder datos
    const cleanUpdates = { ...updates };
    
    // Asegurar que no enviamos campos prohibidos
    if ('uid' in cleanUpdates) delete (cleanUpdates as any).id;

    await setDoc(docRef, cleanUpdates, { merge: true });
    console.log(`[FIRESTORE] ÉXITO: Perfil guardado para ${uid}`);
  } catch (error: any) {
    console.error(`[FIRESTORE] ERROR REAL AL GUARDAR:`, error);
    throw error;
  }
};

export const clearUserDiets = async (uid: string): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  try {
    await updateDoc(docRef, {
      diets: [],
      nutritionPlan: deleteField(),
      nutritionGoal: '',
      nutritionTimeframe: '',
      nutritionAutoGenerate: false,
    });
  } catch (error: any) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
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
