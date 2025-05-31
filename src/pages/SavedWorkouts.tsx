import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { updateWorkout, deleteWorkout, fetchSavedWorkouts, Workout, WorkoutExercise } from '@/services/firebaseWorkoutService';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Timer, Play } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { updateUserWorkoutStats } from '@/services/firebaseUserStatsService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

type WorkoutItem = { type: 'rest'; duration: number } | (WorkoutExercise & { type?: 'exercise'; duration: number });
const isRestPeriod = (item: WorkoutItem): item is { type: 'rest'; duration: number } => item.type === 'rest';

const SavedWorkouts = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const whistleRef = useRef<HTMLAudioElement | null>(null);
  const itemsRef = useRef<WorkoutItem[]>([]);
  const getAllMuscles = (workout: Workout): string[] => {
  const muscleSet = new Set<string>();
  workout.exercises.forEach((ex: any) => {
    if (ex.target) muscleSet.add(ex.target);
    if (Array.isArray(ex.secondaryMuscles)) {
      ex.secondaryMuscles.forEach((m: string) => muscleSet.add(m));
    }
  });
  return Array.from(muscleSet);
};

  const { data: workouts = [], isLoading, refetch } = useQuery({
    queryKey: ['savedWorkouts'],
    queryFn: fetchSavedWorkouts,
  });

  const formatTime = (seconds: number): string =>
    `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  const getCurrentItem = (): WorkoutItem | null => {
    return itemsRef.current[currentIndex] || null;
  };

  const startWorkout = () => {
    if (!selectedWorkout) return;
    const items: WorkoutItem[] = selectedWorkout.exercises.map((ex: any) =>
      ex.type === 'rest'
        ? { type: 'rest', duration: ex.duration || 30 }
        : { ...ex, type: 'exercise', duration: ex.duration || 45 }
    );
    itemsRef.current = items;
    setCountdown(3);
    setCurrentIndex(0);
    setIsCountingDown(true);
  };

  const stopWorkout = () => {
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setIsPlaying(false);
    setCurrentIndex(0);
    setTimeRemaining(0);
    setIsCountingDown(false);
  };

  useEffect(() => {
    if (!isCountingDown) return;
    if (whistleRef.current) whistleRef.current.play().catch(() => {});
  }, [countdown]);

  useEffect(() => {
    if (!isCountingDown) return;
    const cd = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(cd);
          setIsCountingDown(false);
          playWorkout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cd);
  }, [isCountingDown]);

const playWorkout = () => {
  const items = itemsRef.current;
  if (!items.length || !selectedWorkout) return;

  setIsPlaying(true);
  setTimeRemaining(items[0].duration);

  intervalRef.current = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        if (whistleRef.current) whistleRef.current.play().catch(() => {});
        
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1;

          if (nextIndex < items.length) {
            setTimeRemaining(items[nextIndex].duration);
            return nextIndex;
          } else {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            setIsPlaying(false);

            (async () => {
              try {
                await updateUserWorkoutStats({
                  ...selectedWorkout,
                  completedDate: new Date().toISOString(),
                });
                toast.success("Workout stats saved!");
              } catch (err) {
                console.error("Stats update failed:", err);
                toast.error("Failed to save workout stats.");
              }
            })();

            toast.success("Workout complete!");
            return prevIndex;
          }
        });

        return 0;
      }

      return prev - 1;
    });
  }, 1000);
};

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <audio ref={whistleRef} src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" />
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="py-6">
            <h1 className="text-3xl font-bold mb-2">Saved Workouts</h1>
            <p className="text-muted-foreground">Play or revisit your saved workouts</p>
          </div>

          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : !selectedWorkout ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {workouts.map(workout => (
                <Card key={workout.id} className="cursor-pointer hover:ring-2 ring-offset-2 relative group">
                  <CardHeader onClick={() => setSelectedWorkout(workout)}>
                    <CardTitle className="text-lg mb-2">{workout.name}</CardTitle>
                    <CardDescription className="mb-2">
                      {formatTime(workout.duration || 0)}
                    </CardDescription>
                    {workout.exercises[0] && workout.exercises[0].type !== 'rest' && (
                      <img src={(workout.exercises[0] as WorkoutExercise).gifUrl} alt="Preview" className="rounded-md h-40 object-contain" />
                    )}
                  </CardHeader>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100">✕</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this workout?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                await deleteWorkout(workout.id);
                                toast.success('Workout deleted');
                                refetch();
                              } catch (error) {
                                toast.error('Failed to delete workout');
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          ) : isCountingDown ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <h2 className="text-4xl font-bold">Get Ready</h2>
              <div className="text-6xl font-extrabold text-primary animate-pulse">{countdown}</div>
              <p className="text-muted-foreground">Starting in {countdown}...</p>
              <Button variant="ghost" onClick={stopWorkout}>Cancel</Button>
            </div>
          ) : isPlaying ? (
            <div className="max-w-lg mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">
                    Step {currentIndex + 1} / {itemsRef.current.length}
                  </CardTitle>
                  <CardDescription>
                    {isRestPeriod(getCurrentItem()!) ? 'Rest' : (getCurrentItem() as WorkoutExercise)?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold mb-4">{formatTime(timeRemaining)}</div>
                  {!isRestPeriod(getCurrentItem()!) && (
                    <img
                      src={(getCurrentItem() as WorkoutExercise)?.gifUrl}
                      alt=""
                      className="mx-auto h-64 object-contain"
                    />
                  )}
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="destructive" onClick={stopWorkout}>End Workout</Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <Button variant="ghost" onClick={() => setSelectedWorkout(null)}>← Back</Button>
              <Card>
                <CardHeader>
                  {isEditing ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Workout name"
                        className="mb-2"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                      />
                    </>
                  ) : (
                    <>
                      <CardTitle>{selectedWorkout.name}</CardTitle>
                      <CardDescription>{selectedWorkout.description || 'No description'}</CardDescription>
                        {getAllMuscles(selectedWorkout).length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Muscles: {getAllMuscles(selectedWorkout).join(', ')}
                          </p>
                        )}

                    </>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {selectedWorkout.exercises.map((item, i) =>
                    ('type' in item && item.type === 'rest') ? (
                      <div key={i} className="p-3 border rounded-md bg-muted">
                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="h-4 w-4" /> Rest Period • {formatTime(item.duration || 30)}
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="flex items-start gap-3 p-3 border rounded-md">
                        <img src={(item as WorkoutExercise).gifUrl} alt={(item as WorkoutExercise).name} className="h-16 w-16 object-cover rounded-md" />
                        <div>
                          <h4 className="font-medium capitalize">{(item as WorkoutExercise).name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            Target: {(item as WorkoutExercise).target} | Equipment: {(item as WorkoutExercise).equipment}
                              {(item as WorkoutExercise).secondaryMuscles?.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Secondary: {(item as WorkoutExercise).secondaryMuscles.join(', ')}
                                </p>
                              )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Sets: {(item as WorkoutExercise).sets} • Reps: {(item as WorkoutExercise).reps} • Time: {formatTime(item.duration || 45)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>

                <CardFooter className="flex justify-between w-full">
                  
                  <Button onClick={startWorkout} disabled={isCountingDown}>
                    <Play className="h-4 w-4 mr-2" /> Play Workout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>
      <footer className="py-8 px-4 border-t border-border bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Dumbbell className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">MuscleMotionHub</span>
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

export default SavedWorkouts;
