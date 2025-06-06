import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import {
  fetchAllBodyParts,
  fetchExercisesByBodyPart,
  Exercise,
} from '@/services/exerciseService';
import { toast } from '@/components/ui/sonner';
import ExerciseDetail from '@/components/ExerciseDetail';
import SearchBar from '@/components/ExerciseLibrary/SearchBar';
import BodyPartList from '@/components/ExerciseLibrary/BodyPartList';
import ExerciseGrid from '@/components/ExerciseLibrary/ExerciseGrid';
import { Button } from '@/components/ui/button';
import {
  fetchSavedExercises,
  saveExercise,
  removeSavedExercise,
} from '@/services/savedExerciseService';
import { useAuth } from '@/auth/useAuth';
import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExerciseLibrary = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'target' | 'equipment'>('name');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [savedExercises, setSavedExercises] = useState<string[]>([]);

  const { data: bodyParts = [], isLoading: isLoadingBodyParts } = useQuery({
    queryKey: ['bodyParts'],
    queryFn: fetchAllBodyParts,
  });

  const { data: exercises = [], isLoading: isLoadingExercises } = useQuery({
    queryKey: ['exercises', selectedBodyPart],
    queryFn: () => fetchExercisesByBodyPart(selectedBodyPart),
    enabled: !!selectedBodyPart,
  });

  useEffect(() => {
    const loadSavedExercises = async () => {
      try {
        const data = await fetchSavedExercises();
        const savedIds = data.map((e) => e.exerciseId);
        setSavedExercises(savedIds);
      } catch (error) {
        toast.error('Failed to load saved exercises.');
      }
    };
    if (user) loadSavedExercises();
  }, [user]);

  const toggleSaveExercise = async (e: React.MouseEvent, exercise: Exercise) => {
    e.stopPropagation();
    if (!user) {
      toast.error('You must be signed in to save exercises.');
      return;
    }

    const isAlreadySaved = savedExercises.includes(exercise.id);

    try {
      if (isAlreadySaved) {
        const success = await removeSavedExercise(exercise.id);
        if (success) {
          setSavedExercises((prev) => prev.filter((id) => id !== exercise.id));
          toast.success('Removed from saved exercises');
        }
      } else {
        const success = await saveExercise({
          exerciseId: exercise.id,
          name: exercise.name,
          gifUrl: exercise.gifUrl,
          target: exercise.target,
          equipment: exercise.equipment,
          exerciseName: exercise.name,
          secondaryMuscles: exercise.secondaryMuscles || [],
          instructions: Array.isArray(exercise.instructions)
            ? exercise.instructions.join('\n')
            : exercise.instructions || 'No instructions provided.',
        });
        if (success) {
          setSavedExercises((prev) => [...prev, exercise.id]);
          toast.success('Saved exercise');
        }
      }
    } catch (err) {
      toast.error('Error updating saved exercises.');
    }
  };

  useEffect(() => {
    if (bodyParts.length > 0 && !selectedBodyPart) {
      setSelectedBodyPart(bodyParts[0]);
    }
  }, [bodyParts, selectedBodyPart]);

return (
  <div className="min-h-screen flex flex-col">
    <Navbar />

    <main className="flex-1 pt-20 pb-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="py-6">
          <h1 className="text-3xl font-bold mb-2">Exercise Library</h1>
          <p className="text-muted-foreground">
            Browse exercises by body part or search for specific exercises
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-24">
              <div className="mb-6">
                <SearchBar 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  searchType={searchType}
                  setSearchType={setSearchType}
                />
              </div>

              <h3 className="font-medium mb-2">Body Parts</h3>
              <BodyPartList 
                bodyParts={bodyParts}
                selectedBodyPart={selectedBodyPart}
                isLoading={isLoadingBodyParts}
                onSelectBodyPart={setSelectedBodyPart}
              />
            </div>
          </div>

          <div className="flex-1">
            {selectedExercise ? (
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedExercise(null)}
                  className="mb-4"
                >
                  ← Back to exercises
                </Button>
                <ExerciseDetail 
                  exercise={selectedExercise} 
                  isSavedDefault={savedExercises.includes(selectedExercise.id)}
                  onToggleSave={toggleSaveExercise}
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold mb-4 capitalize">
                  {selectedBodyPart} Exercises
                </h2>

                <ExerciseGrid 
                  exercises={exercises}
                  searchTerm={searchTerm}
                  searchType={searchType}
                  isLoading={isLoadingExercises}
                  savedExercises={savedExercises}
                  onSelectExercise={setSelectedExercise}
                  onToggleSave={toggleSaveExercise}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
          <footer className="py-8 px-4 border-t border-border bg-background">
                <div className="container mx-auto max-w-6xl">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">Muscle Hub</span>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
                      <Link to="/exercise-library" className="text-sm text-muted-foreground hover:text-foreground">Exercise Library</Link>
                      <Link to="/workout-builder" className="text-sm text-muted-foreground hover:text-foreground">Workout Builder</Link>
                      <Link to="/calculators" className="text-sm text-muted-foreground hover:text-foreground">Calculators</Link>
                      <Link to="/nutrition" className="text-sm text-muted-foreground hover:text-foreground">Nutrition</Link>
                      <Link to="/yoga" className="text-sm text-muted-foreground hover:text-foreground">Yoga</Link>
      
                    </div>
                  </div>
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} MuscleHub. All rights reserved.
                  </div>
                </div>
              </footer>
  </div>
);
}
export default ExerciseLibrary;
