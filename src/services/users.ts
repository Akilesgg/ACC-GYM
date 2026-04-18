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
    console.log(`[FIRESTORE] Syncing profile for ${uid}. Array fields detected:`, {
      sports: updates.sports?.length,
      diets: updates.diets?.length
    });

    const hasArrayFields = updates.sports !== undefined || updates.diets !== undefined;
    if (hasArrayFields) {
      // Obtener doc actual y mergear manualmente para no perder otros campos
      const snap = await getDoc(docRef);
      const current = snap.exists() ? snap.data() : {};
      const finalPayload = { ...current, ...updates };
      
      console.log(`[FIRESTORE] Performing full replace (no merge) for arrays. Final sports count: ${finalPayload.sports?.length}`);
      await setDoc(docRef, finalPayload);
    } else {
      console.log(`[FIRESTORE] Performing partial update (merge).`);
      await setDoc(docRef, updates, { merge: true });
    }
    console.log(`[FIRESTORE] Update completed successfully for ${uid}`);
  } catch (error: any) {
    console.error(`[FIRESTORE] Error updating profile for ${uid}:`, error);
    if (error.code === 'resource-exhausted') {
      throw new Error("QUOTA_EXCEEDED");
    }
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
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
