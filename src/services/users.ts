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
  const docRef = doc(db, 'users', uid);
  try {
    // Usar SIEMPRE updateDoc (PATCH semántico, no replace).
    // updateDoc con merge hace un update de campos individuales respetando las reglas de Firestore,
    // sin necesidad de reemplazar el documento completo, lo que evita la validación de isValidUser.
    // Para arrays, Firestore actualiza el campo como valor, no elemento a elemento.
    
    // Serializar correctamente: eliminar undefined (Firestore los rechaza)
    const clean = JSON.parse(JSON.stringify(updates));
    
    console.log(`[FIRESTORE] updateDoc para uid=${uid}, fields:`, Object.keys(clean));
    await updateDoc(docRef, clean);
    console.log(`[FIRESTORE] updateDoc OK para uid=${uid}`);
  } catch (error: any) {
    console.error(`[FIRESTORE] ERROR en updateDoc para uid=${uid}:`, error.code, error.message);
    if (error.code === 'resource-exhausted') throw new Error('QUOTA_EXCEEDED');
    if (error.code === 'permission-denied') throw new Error('PERMISSION_DENIED: revisa las reglas de Firestore');
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    throw error; // Re-lanzar para que SportsTab.tsx lo capture y muestre el error
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
