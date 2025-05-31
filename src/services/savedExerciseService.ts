import { auth, db } from '../firebase/client';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

export interface SavedExercise {
  id?: string;
  exerciseId: string;
  name: string;
  gifUrl: string;
  target: string;
  equipment: string;
  exerciseName: string;
  secondaryMuscles: string[];
  instructions: string;
  userId?: string;
}

const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const fetchSavedExercises = async (): Promise<SavedExercise[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const q = query(
    collection(db, 'saved_exercises'),
    where('userId', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as SavedExercise),
  }));
};

export const saveExercise = async (
  exercise: Omit<SavedExercise, 'id' | 'userId'>
): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  if (
    typeof exercise.exerciseName !== 'string' ||
    !Array.isArray(exercise.secondaryMuscles) ||
    typeof exercise.instructions !== 'string'
  ) {
    throw new Error("Invalid exercise format for Firestore rules");
  }

  await addDoc(collection(db, 'saved_exercises'), {
    ...exercise,
    userId: user.uid,
  });

  return true;
};

export const removeSavedExercise = async (
  exerciseId: string
): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const q = query(
    collection(db, 'saved_exercises'),
    where('exerciseId', '==', exerciseId),
    where('userId', '==', user.uid)
  );

  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((docSnap) =>
    deleteDoc(doc(db, 'saved_exercises', docSnap.id))
  );

  await Promise.all(deletePromises);
  return true;
};
