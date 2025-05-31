import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Trash } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { fetchSavedExercises, removeSavedExercise } from '@/services/savedExerciseService';
import { Exercise } from '@/services/exerciseService';
import ExerciseDetail from '@/components/ExerciseDetail';
import { useAuth } from '@/auth/useAuth';
import type { SavedExercise } from '@/services/savedExerciseService';
import { auth, db } from '../firebase/client'; 
import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedExercisesPage = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading } = useAuth();
  

  const {
    data: savedExercises = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['savedExercises', user?.uid],
    queryFn: fetchSavedExercises,
    enabled: !!user,
  });

  const { mutate: removeExercise } = useMutation({
    mutationFn: removeSavedExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedExercises', user?.uid] });
      toast.success("Exercise removed from saved list");
    },
    onError: () => {
      toast.error("Failed to remove exercise.");
    },
  });

  const handleRemoveExercise = (exerciseId: string) => {
    removeExercise(exerciseId);
  };

  const handleSelectExercise = (savedExercise: SavedExercise) => {
    const exercise: Exercise = {
      id: savedExercise.exerciseId,
      name: savedExercise.name,
      gifUrl: savedExercise.gifUrl,
      target: savedExercise.target || '',
      equipment: savedExercise.equipment || '',
      bodyPart: '', 
      secondaryMuscles: savedExercise.secondaryMuscles || [],
      instructions: Array.isArray(savedExercise.instructions)
      ? savedExercise.instructions.flatMap((instr: string) =>
        instr
          .split('.')
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => s.endsWith('.') ? s : s + '.')
        ).flat()
      : savedExercise.instructions
      ? savedExercise.instructions
        .split('.')
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((s: string) => s.endsWith('.') ? s : s + '.')
      : [],
    };
    setSelectedExercise(exercise);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-8">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">Please Sign In</h2>
              <p className="text-muted-foreground mb-6">
                You need to be signed in to view your saved exercises
              </p>
              <Button asChild>
                <a href="/signin">Sign In</a>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="py-6">
            <h1 className="text-3xl font-bold mb-2">Saved Exercises</h1>
            <p className="text-muted-foreground">View and manage your favorite exercises</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-500">
                {error instanceof Error ? error.message : 'An error occurred loading your saved exercises'}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['savedExercises'] })} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : savedExercises.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No saved exercises yet</h2>
              <p className="text-muted-foreground mb-6">
                Start saving your favorite exercises by clicking the heart icon
              </p>
              <Button asChild>
                <a href="/exercise-library">Browse Exercise Library</a>
              </Button>
            </div>
          ) : selectedExercise ? (
            <div className="mb-6">
              <Button variant="ghost" onClick={() => setSelectedExercise(null)} className="mb-4">
                ← Back to saved exercises
              </Button>
              <ExerciseDetail 
                exercise={selectedExercise} 
                isSavedDefault={true}
                onToggleSave={() => handleRemoveExercise(selectedExercise.id)}
              />

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedExercises.map((exercise) => (
                <Card key={exercise.exerciseId || `${exercise.name}-${exercise.gifUrl}`} className="overflow-hidden">
                  <div
                    className="h-48 bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => handleSelectExercise(exercise)}
                  >
                    <img src={exercise.gifUrl} alt={exercise.name} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium capitalize">{exercise.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{exercise.target}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => handleRemoveExercise(exercise.exerciseId)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
};

export default SavedExercisesPage;
