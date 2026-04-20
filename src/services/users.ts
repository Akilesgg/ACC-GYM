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
    // Serializar a JSON para limpiar tipos no soportados (undefined, clases complejas)
    const clean = JSON.parse(JSON.stringify(updates));
    
    // Elminar campos que NUNCA deben sobreescribirse accidentalmente o que no existen en el modelo
    delete clean.id; // Firestore usa el ID del documento
    
    console.log(`[FIRESTORE] setDoc (merge:true) -> database: ${db.app.options.projectId}, doc: users/${uid}`);
    
    // setDoc con merge:true es el método más robusto: Crea el doc si no existe o lo actualiza si existe
    await setDoc(docRef, clean, { merge: true });
    
    console.log(`[FIRESTORE] Guardado exitoso para: ${uid}`);
  } catch (error: any) {
    console.error(`[FIRESTORE] FALLO en setDoc para: ${uid}`, error);
    
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied')) {
      throw new Error('PERMISSION_DENIED');
    }
    if (error.code === 'resource-exhausted' || error.message?.includes('quota exceeded')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    
    // Usar el handler global para logging detallado
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
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
