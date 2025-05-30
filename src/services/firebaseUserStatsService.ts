import axios from 'axios';
import { toast } from '@/components/ui/sonner';
import { Exercise } from './exerciseService';

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  gifUrl?: string;
  target?: string;
  equipment?: string;
  secondaryMuscles?: string[];
  instructions?: string[];
}

export interface Workout {
  _id?: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  category?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutLog {
  _id: string;
  workoutId: string;
  workoutName: string;
  completedDate: string;
  duration: number;
  exercisesCompleted: number;
  notes?: string;
}

export const fetchUserWorkouts = async (): Promise<Workout[]> => {
  try {
    const response = await axios.get('/api/workouts');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching workouts:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch workouts');
    return [];
  }
};

export const fetchWorkout = async (id: string): Promise<Workout | null> => {
  try {
    const response = await axios.get(`/api/workouts/${id}`);
    return response.data || [];

  } catch (error: any) {
    console.error('Error fetching workout:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch workout details');
    return null;

  }
};

export const createWorkout = async (workout: Workout): Promise<Workout | null> => {
  try {
    const response = await axios.post('/api/workouts', workout);
    toast.success('Workout created successfully');
    return response.data;
  } catch (error: any) {
    console.error('Error creating workout:', error);
    toast.error(error.response?.data?.message || 'Failed to create workout');
    return null;
  }
};

export const updateWorkout = async (id: string, workout: Workout): Promise<Workout | null> => {
  try {
    const response = await axios.put(`/api/workouts/${id}`, workout);
    toast.success('Workout updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('Error updating workout:', error);
    toast.error(error.response?.data?.message || 'Failed to update workout');
    return null;
  }
};

export const deleteWorkout = async (id: string): Promise<boolean> => {
  try {
    await axios.delete(`/api/workouts/${id}`);
    toast.success('Workout deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting workout:', error);
    toast.error(error.response?.data?.message || 'Failed to delete workout');
    return false;
  }
};

export const logCompletedWorkout = async (
  workoutId: string,
  duration: number,
  exercisesCompleted: number,
  notes?: string
): Promise<WorkoutLog | null> => {
  try {
    const response = await axios.post('/api/workouts/log', {
      workoutId,
      duration,
      exercisesCompleted,
      notes
    });
    toast.success('Workout logged successfully');
    return response.data;
  } catch (error: any) {
    console.error('Error logging workout:', error);
    toast.error(error.response?.data?.message || 'Failed to log workout');
    return null;
  }
};

export const exerciseToWorkoutExercise = (
  exercise: Exercise, 
  sets: number = 3, 
  reps: number = 10
): WorkoutExercise => {
  return {
    exerciseId: exercise.id,
    name: exercise.name,
    sets,
    reps,
    gifUrl: exercise.gifUrl,
    target: exercise.target,
    equipment: exercise.equipment
  };
};

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const fetchWorkoutLogs = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const db = getFirestore();
  const userDocRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) return [];

  const data = docSnap.data();
  const logs = data.workoutLogs;

  return Array.isArray(logs) ? logs : [];
};


export const updateUserWorkoutStats = async (workout: any) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const db = getFirestore();
  const userDocRef = doc(db, 'users', user.uid);

  const workoutDuration = workout.duration || 0;

  const muscleList: string[] = [];

  if (Array.isArray(workout.exercises)) {
    for (const ex of workout.exercises) {
      if (ex.type === 'exercise' || !ex.type) {
        const target = ex.target?.trim().toLowerCase();
        if (target) muscleList.push(target);

        if (Array.isArray(ex.secondaryMuscles)) {
          for (const sec of ex.secondaryMuscles) {
            if (typeof sec === 'string' && sec.trim()) {
              muscleList.push(sec.trim().toLowerCase());
            }
          }
        }
      }
    }
  }
  const uniqueMusclesWorked = [...new Set(muscleList)];
  const workoutLogEntry = {
    workoutName: workout.name || 'Workout',
    duration: workoutDuration,
    completedDate: new Date().toISOString(),
    exercisesCompleted: workout.exercises?.length || 0,
    notes: workout.notes || '',
    workoutId: workout.id || '',
    musclesWorked: uniqueMusclesWorked,
  };

  const newDistribution: Record<string, number> = {};
  for (const muscle of muscleList) {
    newDistribution[muscle] = (newDistribution[muscle] || 0) + 1;
  }
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    const currentData = docSnap.data();
    const existingDistribution = currentData.workoutDistribution || {};

    const mergedDistribution = { ...existingDistribution };
    for (const [muscle, count] of Object.entries(newDistribution)) {
      mergedDistribution[muscle] = (mergedDistribution[muscle] || 0) + count;
    }

    await updateDoc(userDocRef, {
      workoutsCompleted: increment(1),
      totalWorkoutTime: increment(workoutDuration / 60),
      workoutLogs: arrayUnion(workoutLogEntry),
      workoutDistribution: mergedDistribution,
    });
  } else {
    await setDoc(userDocRef, {
      workoutsCompleted: 1,
      totalWorkoutTime: workoutDuration / 60,
      workoutLogs: [workoutLogEntry],
      workoutDistribution: newDistribution,
    });
  }
};
