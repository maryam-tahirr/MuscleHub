import { db, auth } from '@/integrations/firebase/client';
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  Timestamp,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface WorkoutExercise {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  equipment: string;
  sets: number;
  reps: number;
  duration: number;
  type?: 'exercise';
  secondaryMuscles?: string[];
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  duration?: number;
  exercises: (WorkoutExercise | { type: 'rest'; duration: number })[];
  createdAt: string;
}

export interface WorkoutExerciseData {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration: number;
  gifUrl: string;
  target: string;
  equipment: string;
}

interface CreateWorkoutInput {
  name: string;
  description?: string;
  duration: number;
  exercises: WorkoutExerciseData[];
}
export const updateWorkout = async (id: string, updatedData: Partial<Workout>) => {
  const workoutRef = doc(db, 'workouts', id);
  await updateDoc(workoutRef, updatedData);
};

export const fetchSavedWorkouts = async (): Promise<Workout[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const q = query(collection(db, 'saved_workouts'), where('userId', '==', user.uid));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Workout[];
};

export const createWorkout = async (input: CreateWorkoutInput) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  await addDoc(collection(db, 'saved_workouts'), {
    ...input,
    userId: user.uid,
    createdAt: new Date().toISOString(),
  });
};

export const saveWorkoutToFirestore = async (workout: {
  name: string;
  description: string;
  exercises: any[];
  duration: number;
  createdAt: string;
}) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated');

  const workoutData = {
    ...workout,
    userId: user.uid,
  };

  await addDoc(collection(db, 'saved_workouts'), workoutData);
};

export const completeWorkout = async ({
  workoutId,
  workoutName,
  duration,
  exercisesCompleted,
}: {
  workoutId: string;
  workoutName: string;
  duration: number;
  exercisesCompleted: number;
}) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userId = user.uid;

  await addDoc(collection(db, 'workout_logs'), {
    userId,
    workoutId,
    workoutName,
    duration,
    exercisesCompleted,
    completedDate: Timestamp.now(),
  });

  const profileRef = doc(db, 'profiles', userId);
  await updateDoc(profileRef, {
    workoutsCompleted: increment(1),
    totalWorkoutDuration: increment(duration),
    lastWorkoutDate: Timestamp.now(),
    workoutHistory: arrayUnion({
      workoutId,
      workoutName,
      duration,
      completedDate: Timestamp.now(),
    }),
  });
};

export const deleteWorkout = async (workoutId: string) => {
  const workoutRef = doc(db, 'saved_workouts', workoutId);
  await deleteDoc(workoutRef);
};

export const updateUserWorkoutStats = async (workoutItems: any[], duration: number) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);
  
  let data = {
    workoutsCompleted: 0,
    totalWorkoutTime: 0,
    workoutHistory: [],
    muscleDistribution: {} as Record<string, number>,
  };

  if (docSnap.exists()) {
    data = { ...data, ...docSnap.data() } as typeof data;
  }

  const now = new Date().toISOString();
  data.workoutsCompleted += 1;
  data.totalWorkoutTime += duration;
  data.workoutHistory = [...(data.workoutHistory || []), now].slice(-10); 

  for (const item of workoutItems) {
    if (item.type === 'exercise') {
      const target = item.target || 'unknown';
      data.muscleDistribution[target] = (data.muscleDistribution[target] || 0) + item.duration;
    }
  }

  await setDoc(userRef, data, { merge: true });
};