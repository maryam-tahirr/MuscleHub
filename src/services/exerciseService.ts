
import axios from 'axios';
import { toast } from '@/components/ui/sonner';

export interface Exercise {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  bodyPart: string;
  equipment: string;
  secondaryMuscles?: string[];
  instructions?: string[];
}

export const fetchAllBodyParts = async (): Promise<string[]> => {
  try {
    const response = await axios.get('https://exercisedb.p.rapidapi.com/exercises/bodyPartList', {
      headers: {
        'X-RapidAPI-Key': 'da15daae02mshe8622ce12016084p1847a8jsn86864670c2cf',
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching body parts:', error);
    return ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
  }
};

export const fetchExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  try {
    const response = await axios.get(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`, {
      headers: {
        'X-RapidAPI-Key': 'da15daae02mshe8622ce12016084p1847a8jsn86864670c2cf',
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for body part ${bodyPart}:`, error);
    toast.error('Failed to load exercises. Using sample data instead.');
  }
};

export const fetchExerciseById = async (id: string): Promise<Exercise | null> => {
  try {
    const response = await axios.get(`https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`, {
      headers: {
        'X-RapidAPI-Key': 'da15daae02mshe8622ce12016084p1847a8jsn86864670c2cf',
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercise with ID ${id}:`, error);
    return null;
  }
};

export const fetchExercisesByIds = async (ids: string[]): Promise<Exercise[]> => {
  if (!ids.length) return [];
  
  try {
    const exercises: Exercise[] = [];
    
    for (const id of ids) {
      const exercise = await fetchExerciseById(id);
      if (exercise) exercises.push(exercise);
    }
    
    return exercises;
  } catch (error) {
    console.error('Error fetching exercises by IDs:', error);
    return [];
  }
};
