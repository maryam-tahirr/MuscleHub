import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { fetchAllBodyParts, fetchExercisesByBodyPart, Exercise } from '@/services/exerciseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Play, Pause, Clock, X, Timer } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { fetchSavedWorkouts, saveWorkoutToFirestore } from '@/services/firebaseWorkoutService';
import { updateUserWorkoutStats } from '@/services/firebaseUserStatsService';
import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

type WorkoutExercise = {
  exercise: Exercise;
  duration: number;
};

type RestPeriod = {
  duration: number;
  isRest: true;
};

type WorkoutItem = WorkoutExercise | RestPeriod;

const isRestPeriod = (item: WorkoutItem): item is RestPeriod => {
  return 'isRest' in item && item.isRest === true;
};

const WorkoutBuilder = () => {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'target' | 'equipment'>('name');
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [savedExercises, setSavedExercises] = useState<Exercise[]>([]);
  const [savedIdsMap, setSavedIdsMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('search');
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [isRunningWorkout, setIsRunningWorkout] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const whistleRef = useRef<HTMLAudioElement | null>(null);
  const countdownBeepRef = useRef<HTMLAudioElement | null>(null);
  const totalWorkoutTime = workoutItems.reduce((acc, curr) => acc + curr.duration, 0);

  const { data: bodyParts = [], isLoading: isLoadingBodyParts } = useQuery({
    queryKey: ['bodyParts'],
    queryFn: fetchAllBodyParts,
  });
  const handleSaveWorkout = async () => {
    const name = prompt('Enter a name for your workout:');
    if (!name) return;

    const timestamp = new Date().toISOString();
    const exercisesToSave = workoutItems.map((item) =>
  isRestPeriod(item)
    ? { type: 'rest', duration: item.duration }
    : {
        id: item.exercise.id,
        name: item.exercise.name,
        sets: 1,
        reps: 1,
        duration: item.duration,
        gifUrl: item.exercise.gifUrl,
        target: item.exercise.target,
        equipment: item.exercise.equipment,
        secondaryMuscles: item.exercise.secondaryMuscles || [],
        type: 'exercise',
      }
);
    const muscleSet = new Set<string>();
    exercisesToSave.forEach((ex) => {
      if (ex.type === 'exercise') {
        if (ex.target) muscleSet.add(ex.target.toLowerCase());
        if (Array.isArray(ex.secondaryMuscles)) {
          ex.secondaryMuscles.forEach((sm) => muscleSet.add(sm.toLowerCase()));
        }
      }
    });

    const musclesWorked = Array.from(muscleSet);



    const totalDuration = workoutItems.reduce((sum, item) => sum + item.duration, 0);

    try {
      await saveWorkoutToFirestore({
        name,
        description: '',
        exercises: exercisesToSave,
        duration: totalDuration,
        createdAt: timestamp,
      });

      toast.success('Workout saved successfully!');
    } catch (err) {
      console.error('Failed to save workout:', err);
      toast.error('Failed to save workout');
    }
  };
  const exercisesToSave = workoutItems.map((item) =>
  isRestPeriod(item)
    ? { type: 'rest', duration: item.duration }
    : {
        id: item.exercise.id,
        name: item.exercise.name,
        sets: 1,
        reps: 1,
        duration: item.duration,
        gifUrl: item.exercise.gifUrl,
        target: item.exercise.target,
        equipment: item.exercise.equipment,
        type: 'exercise',
      }
);
  const { 
    data: exercises = [], 
    isLoading: isLoadingExercises 
  } = useQuery({
    queryKey: ['exercises', selectedBodyPart],
    queryFn: () => fetchExercisesByBodyPart(selectedBodyPart),
    enabled: !!selectedBodyPart,
  });

  useEffect(() => {
    if (bodyParts.length > 0 && !selectedBodyPart) {
      setSelectedBodyPart(bodyParts[0]);
    }
  }, [bodyParts, selectedBodyPart]);

  useEffect(() => {
    const loadSavedExercises = async () => {
      try {
        const savedIdsStr = localStorage.getItem('savedExercises');
        if (!savedIdsStr) return;
        
        const savedIds = JSON.parse(savedIdsStr);
        const idsMap: Record<string, boolean> = {};
        savedIds.forEach((id: string) => {
          idsMap[id] = true;
        });
        setSavedIdsMap(idsMap);
        
        const allExercises = exercises.filter(ex => savedIds.includes(ex.id));
        setSavedExercises(allExercises);
      } catch (err) {
        console.error("Failed to load saved exercises:", err);
      }
    };
    
    loadSavedExercises();
  }, [exercises]);

  const filteredExercises = exercises.filter(exercise => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
  });
  


  const addExerciseToWorkout = (exercise: Exercise) => {
    setWorkoutItems([...workoutItems, { exercise, duration: 45 }]);
  };

  const addRestPeriod = () => {
    setWorkoutItems([...workoutItems, { duration: 30, isRest: true }]);
    toast.success("Rest period added");
  };

  const removeWorkoutItem = (index: number) => {
    const updatedWorkout = [...workoutItems];
    updatedWorkout.splice(index, 1);
    setWorkoutItems(updatedWorkout);
  };

  const updateItemDuration = (index: number, duration: number) => {
    const updatedWorkout = [...workoutItems];
    updatedWorkout[index].duration = duration;
    setWorkoutItems(updatedWorkout);
  };

  const startWorkout = () => {
    if (workoutItems.length === 0) return;
    
    setIsCountingDown(true);
    setCountdown(3);
  };

  const startActualWorkout = () => {
    setIsRunningWorkout(true);
    setCurrentItemIndex(0);
    setTimeRemaining(workoutItems[0].duration);
    setIsPaused(false);
    
    if (whistleRef.current) {
      whistleRef.current.play().catch(e => console.error("Failed to play whistle:", e));
    }
  };

  const togglePauseWorkout = () => {
    setIsPaused(prev => !prev);
  };
  
  const stopWorkout = () => {
    setIsRunningWorkout(false);
    setCurrentItemIndex(0);
    setTimeRemaining(0);
    setIsPaused(false);
  };

  useEffect(() => {
    if (!isCountingDown) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (countdownBeepRef.current && prev > 0) {
          countdownBeepRef.current.play().catch(e => console.error("Failed to play countdown beep:", e));
        }
        
        if (prev <= 1) {
          clearInterval(interval);
          setIsCountingDown(false);
          startActualWorkout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountingDown]);

useEffect(() => {
  if (!isRunningWorkout || isPaused || isCountingDown) return;

  const interval = setInterval(() => {
    setTimeRemaining((prevTime) => {
      if (prevTime <= 1) {
        if (whistleRef.current) {
          whistleRef.current.play().catch((e) =>
            console.error("Failed to play audio:", e)
          );
        }

        if (currentItemIndex < workoutItems.length - 1) {
          setCurrentItemIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            setTimeRemaining(workoutItems[nextIndex].duration);
            return nextIndex;
          });
        } else {
          clearInterval(interval);
          setIsRunningWorkout(false);

          (async () => {
            try {
              await updateUserWorkoutStats({
                name: "Custom Workout",
                duration: totalWorkoutTime,
                exercises: exercisesToSave,
              });
              toast.success("Workout complete! Great job!");
            } catch (err) {
              console.error("Failed to update user stats:", err);
              toast.error("Failed to update workout stats");
            }
          })();
        }
        return 0;
      }

      return prevTime - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [
  isRunningWorkout,
  isPaused,
  currentItemIndex,
  workoutItems,
  isCountingDown,
  totalWorkoutTime,
  exercisesToSave,
]);

  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getCurrentItem = () => {
    return workoutItems[currentItemIndex];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <audio ref={whistleRef} src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" />
      <audio ref={countdownBeepRef} src="https://www.soundjay.com/misc/sounds/beep-07.mp3" />
      
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="py-6">
            <h1 className="text-3xl font-bold mb-2">Custom Workout Builder</h1>
            <p className="text-muted-foreground">
              Create your own custom workout by adding exercises and rest periods
            </p>
          </div>
          
          {isCountingDown ? (
            <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-6xl font-bold mb-8">{countdown}</h2>
                <p className="text-xl text-muted-foreground">Get Ready!</p>
              </div>
            </div>
          ) : null}
          
          {isRunningWorkout ? (
            <div className="max-w-lg mx-auto">
              <Card className="bg-card/95 backdrop-blur">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    {currentItemIndex + 1}/{workoutItems.length}: {
                      isRestPeriod(getCurrentItem()) 
                        ? "Rest Period" 
                        : (getCurrentItem() as WorkoutExercise).exercise.name
                    }
                  </CardTitle>
                  {!isRestPeriod(getCurrentItem()) && (
                    <CardDescription className="capitalize">
                      Target: {(getCurrentItem() as WorkoutExercise).exercise.target}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="relative h-64 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {isRestPeriod(getCurrentItem()) ? (
                      <Timer className="h-24 w-24 text-primary/50" />
                    ) : (
                      <img 
                        src={(getCurrentItem() as WorkoutExercise).exercise.gifUrl} 
                        alt={(getCurrentItem() as WorkoutExercise).exercise.name} 
                        className="h-full w-auto object-contain"
                      />
                    )}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold">{formatTime(timeRemaining)}</div>
                    <p className="text-muted-foreground mt-1">Time remaining</p>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={togglePauseWorkout}
                  >
                    {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={stopWorkout}
                  >
                    End Workout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Exercises</CardTitle>
                    <CardDescription>Search or choose from your saved exercises</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="w-full mb-4">
                        <TabsTrigger value="search" className="flex-1">Search</TabsTrigger>
                        <TabsTrigger value="saved" className="flex-1">Saved Exercises</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="search">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="search"
                                placeholder="Search exercises..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {bodyParts.map((bodyPart) => (
                              <Button
                                key={bodyPart}
                                variant={selectedBodyPart === bodyPart ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setSelectedBodyPart(bodyPart)}
                              >
                                {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                              </Button>
                            ))}
                          </div>
                          
                          {isLoadingExercises ? (
                            <div className="text-center py-8">Loading exercises...</div>
                          ) : filteredExercises.length === 0 ? (
                            <div className="text-center py-8">No exercises found matching your search.</div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {filteredExercises.slice(0, 9).map((exercise) => (
                                <Card 
                                  key={exercise.id} 
                                  className="overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
                                >
                                  <div className="relative h-36 bg-muted flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={exercise.gifUrl} 
                                      alt={exercise.name} 
                                      className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 hover:opacity-100 transition-opacity">
                                      <Button 
                                        variant="secondary" 
                                        size="sm"
                                        onClick={() => setDetailExercise(exercise)}
                                      >
                                        View
                                      </Button>
                                      <Button 
                                        variant="default" 
                                        size="sm"
                                        onClick={() => addExerciseToWorkout(exercise)}
                                      >
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                      </Button>
                                    </div>
                                  </div>
                                  <CardContent className="p-3">
                                    <h3 className="font-medium line-clamp-1 text-sm capitalize">{exercise.name}</h3>
                                    <p className="text-xs text-muted-foreground capitalize">{exercise.target}</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="saved">
                        {savedExercises.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">You haven't saved any exercises yet.</p>
                            <Button asChild>
                              <a href="/exercise-library">Browse Exercise Library</a>
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {savedExercises.map((exercise) => (
                              <Card 
                                key={exercise.id} 
                                className="overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
                              >
                                <div className="relative h-36 bg-muted flex items-center justify-center overflow-hidden">
                                  <img 
                                    src={exercise.gifUrl} 
                                    alt={exercise.name} 
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 hover:opacity-100 transition-opacity">
                                    <Button 
                                      variant="secondary" 
                                      size="sm"
                                      onClick={() => setDetailExercise(exercise)}
                                    >
                                      View
                                    </Button>
                                    <Button 
                                      variant="default" 
                                      size="sm"
                                      onClick={() => addExerciseToWorkout(exercise)}
                                    >
                                      <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                  </div>
                                </div>
                                <CardContent className="p-3">
                                  <h3 className="font-medium line-clamp-1 text-sm capitalize">{exercise.name}</h3>
                                  <p className="text-xs text-muted-foreground capitalize">{exercise.target}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Your Workout</CardTitle>
                        <CardDescription>
                          {workoutItems.length} items • {formatTime(totalWorkoutTime)} total
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addRestPeriod}
                        disabled={workoutItems.length === 0}
                      >
                        <Timer className="h-4 w-4 mr-2" />
                        Add Rest
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {workoutItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="font-medium">No exercises yet</p>
                        <p className="text-muted-foreground mt-1">
                          Add exercises from the left panel
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {workoutItems.map((item, index) => (
                          <Card key={index} className={`bg-card/50 ${isRestPeriod(item) ? 'border-dashed border-primary/30' : ''}`}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {isRestPeriod(item) ? (
                                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                                      <Timer className="h-6 w-6 text-primary/70" />
                                    </div>
                                  ) : (
                                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                      <img 
                                        src={(item as WorkoutExercise).exercise.gifUrl} 
                                        alt={(item as WorkoutExercise).exercise.name} 
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-medium text-sm capitalize line-clamp-1">
                                      {isRestPeriod(item) ? "Rest Period" : (item as WorkoutExercise).exercise.name}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{formatTime(item.duration)}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                  onClick={() => removeWorkoutItem(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Duration</span>
                                  <span>{formatTime(item.duration)}</span>
                                </div>
                                <Slider
                                  defaultValue={[item.duration]}
                                  min={5}
                                  max={300}
                                  step={5}
                                  onValueChange={(value) => updateItemDuration(index, value[0])}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-2">
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={workoutItems.length === 0}
                      onClick={startWorkout}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Workout
                    </Button>

                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={workoutItems.length === 0}
                    onClick={handleSaveWorkout}
                  >
                    Save Workout
                  </Button>

                  </CardFooter>

                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={!!detailExercise} onOpenChange={() => setDetailExercise(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="capitalize">{detailExercise?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-muted rounded-md h-64 flex items-center justify-center overflow-hidden">
                {detailExercise && (
                  <img 
                    src={detailExercise.gifUrl} 
                    alt={detailExercise.name} 
                    className="h-full object-contain"
                  />
                )}
              </div>
              
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="font-medium">Target Muscle</h4>
                  <Badge variant="secondary" className="mt-1 capitalize">{detailExercise?.target}</Badge>
                </div>
                
                <div>
                  <h4 className="font-medium">Equipment</h4>
                  <Badge variant="outline" className="mt-1 capitalize">{detailExercise?.equipment}</Badge>
                </div>
                
                <div>
                  <h4 className="font-medium">Secondary Muscles</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detailExercise?.secondaryMuscles?.map((muscle, i) => (
                      <Badge key={i} variant="outline" className="capitalize">{muscle}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Instructions</h4>
              {detailExercise?.instructions?.length ? (
                <ol className="list-decimal list-inside space-y-2">
                  {detailExercise.instructions.map((step, i) => (
                    <li key={i} className="text-sm">{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground">No detailed instructions available.</p>
              )}
              
              <div className="mt-6">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    if (detailExercise) {
                      addExerciseToWorkout(detailExercise);
                      setDetailExercise(null);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Workout
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

export default WorkoutBuilder;
