import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Exercise } from '@/services/exerciseService';
import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { saveExercise, removeSavedExercise, fetchSavedExercises } from '@/services/savedExerciseService';
import authService from '@/services/authService';

interface ExerciseDetailProps {
  exercise: Exercise;
  isSavedDefault?: boolean;
  onToggleSave?: (e: React.MouseEvent, exercise: Exercise) => void;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exercise, isSavedDefault, onToggleSave }) => {
  const [isSaved, setIsSaved] = useState(isSavedDefault ?? false);
  const queryClient = useQueryClient();
  const isAuthenticated = authService.isAuthenticated();
  const userId = authService.getCurrentUser()?.id;

  const { data: savedExercises } = useQuery({
    queryKey: ['savedExercises', userId],
    queryFn: fetchSavedExercises,
    enabled: isAuthenticated && typeof isSavedDefault !== 'boolean',
  });

  useEffect(() => {
    if (typeof isSavedDefault === 'boolean') {
      setIsSaved(isSavedDefault);
    } else if (savedExercises && Array.isArray(savedExercises)) {
      const found = savedExercises.some(e => e.exerciseId === exercise.id);
      setIsSaved(found);
    }
  }, [exercise.id, isSavedDefault, savedExercises]);

  const { mutate: saveExerciseMutation } = useMutation({
    mutationFn: () =>
      saveExercise({
        exerciseId: exercise.id,
        name: exercise.name,
        gifUrl: exercise.gifUrl,
        target: exercise.target,
        equipment: exercise.equipment,
        exerciseName: exercise.name,
        secondaryMuscles: exercise.secondaryMuscles || [],
        instructions: Array.isArray(exercise.instructions)
          ? exercise.instructions.join('\n')
          : exercise.instructions || '',
      }),
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries({ queryKey: ['savedExercises', userId] });
      toast.success('Exercise saved');
    },
    onError: () => {
      toast.error('Failed to save exercise');
    },
  });

  const { mutate: removeExerciseMutation } = useMutation({
    mutationFn: () => removeSavedExercise(exercise.id),
    onSuccess: () => {
      setIsSaved(false);
      queryClient.invalidateQueries({ queryKey: ['savedExercises', userId] });
      toast.success('Exercise removed');
    },
    onError: () => {
      toast.error('Failed to remove exercise');
    },
  });

const toggleSave = (e: React.MouseEvent) => {
  e.stopPropagation();

  if (onToggleSave) {
    onToggleSave(e, exercise);
    return;
  }

  if (!isAuthenticated) {
    try {
      const savedIdsStr = localStorage.getItem('savedExercises');
      let savedIds: string[] = savedIdsStr ? JSON.parse(savedIdsStr) : [];

      if (savedIds.includes(exercise.id)) {
        savedIds = savedIds.filter(id => id !== exercise.id);
        toast.success('Exercise removed from favorites');
        setIsSaved(false);
      } else {
        savedIds.push(exercise.id);
        toast.success('Exercise saved to favorites');
        setIsSaved(true);
      }

      localStorage.setItem('savedExercises', JSON.stringify(savedIds));
    } catch (err) {
      console.error('Error toggling save status:', err);
      toast.error('Failed to update favorites');
    }
  }
};

  const shareExercise = () => {
    if (navigator.share) {
      navigator
        .share({
          title: exercise.name,
          text: `Check out this exercise: ${exercise.name}`,
          url: window.location.href,
        })
        .catch(error => console.log('Error sharing', error));
    } else {
      toast.success('Link copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2 h-[300px] md:h-[400px] bg-muted flex items-center justify-center">
          <img 
            src={exercise.gifUrl} 
            alt={exercise.name} 
            className="h-full w-full object-contain"
          />
        </div>

        <div className="p-6 md:w-1/2">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold capitalize">{exercise.name}</h1>
            <div className="flex gap-2">
              <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSave}
              aria-label={isSaved ? 'Unsave Exercise' : 'Save Exercise'}
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} 
              />
            </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={shareExercise} 
                aria-label="Share Exercise"
              >
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Target Muscle</h3>
              <Badge variant="secondary" className="capitalize">{exercise.target}</Badge>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Equipment</h3>
              <Badge variant="outline" className="capitalize">{exercise.equipment}</Badge>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Secondary Muscles</h3>
              <div className="flex flex-wrap gap-1">
                {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 ? (
                  exercise.secondaryMuscles.map((muscle, index) => (
                    <Badge key={index} variant="outline" className="capitalize">{muscle}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Instructions</h3>
              {exercise.instructions && exercise.instructions.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No instructions available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;
