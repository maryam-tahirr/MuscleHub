
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { PlusCircle, Trash2, Save, Clock, List, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkoutExercise {
  id: string;
  name: string;
  description?: string;
  sets: number;
  reps: number;
  rest: number;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  restBetweenExercises: number;
}

const DEFAULT_REST_TIME = 60;

const presetWorkouts: WorkoutTemplate[] = [
  {
    id: "upper-body",
    name: "Upper Body Strength",
    description: "Focus on chest, arms, shoulders, and back",
    exercises: [
      { id: "ub-1", name: "Push-ups", sets: 3, reps: 15, rest: 60 },
      { id: "ub-2", name: "Pull-ups", sets: 3, reps: 10, rest: 90 },
      { id: "ub-3", name: "Bench Press", sets: 4, reps: 8, rest: 120 },
      { id: "ub-4", name: "Bicep Curls", sets: 3, reps: 12, rest: 60 }
    ],
    restBetweenExercises: 60
  },
  {
    id: "lower-body",
    name: "Lower Body Power",
    description: "Focus on legs, glutes, and core",
    exercises: [
      { id: "lb-1", name: "Squats", sets: 4, reps: 12, rest: 90 },
      { id: "lb-2", name: "Lunges", sets: 3, reps: 10, rest: 60 },
      { id: "lb-3", name: "Deadlifts", sets: 4, reps: 8, rest: 120 },
      { id: "lb-4", name: "Plank", sets: 3, reps: 30, rest: 60 }
    ],
    restBetweenExercises: 90
  },
  {
    id: "full-body",
    name: "Full Body Circuit",
    description: "Balanced workout for the entire body",
    exercises: [
      { id: "fb-1", name: "Push-ups", sets: 3, reps: 12, rest: 45 },
      { id: "fb-2", name: "Squats", sets: 3, reps: 15, rest: 45 },
      { id: "fb-3", name: "Pull-ups", sets: 3, reps: 8, rest: 45 },
      { id: "fb-4", name: "Lunges", sets: 3, reps: 10, rest: 45 },
      { id: "fb-5", name: "Plank", sets: 3, reps: 30, rest: 45 }
    ],
    restBetweenExercises: 45
  }
];

const WorkoutBuilder = () => {
  const [workoutName, setWorkoutName] = useState("My Custom Workout");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    { id: "1", name: "Push-ups", sets: 3, reps: 12, rest: 60 },
    { id: "2", name: "Squats", sets: 4, reps: 15, rest: 90 }
  ]);
  const [restBetweenExercises, setRestBetweenExercises] = useState(DEFAULT_REST_TIME);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      name: "New Exercise",
      sets: 3,
      reps: 10,
      rest: 60
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const updateExercise = (id: string, field: keyof WorkoutExercise, value: any) => {
    setExercises(
      exercises.map(exercise => 
        exercise.id === id ? { ...exercise, [field]: value } : exercise
      )
    );
  };

  const loadPresetWorkout = (preset: WorkoutTemplate) => {
    setWorkoutName(preset.name);
    setExercises([...preset.exercises]);
    setRestBetweenExercises(preset.restBetweenExercises);
    setShowPresetDialog(false);
    toast.success(`Loaded "${preset.name}" workout template`);
  };

  const saveWorkout = () => {
    toast.success("Workout saved successfully!");
  };

  const getTotalTime = () => {
    let totalSeconds = 0;
    
    exercises.forEach(exercise => {
      totalSeconds += exercise.sets * (exercise.rest + 30);
    });
    
    if (exercises.length > 1) {
      totalSeconds += (exercises.length - 1) * restBetweenExercises;
    }
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  return (
    <Card className="bg-card/50 backdrop-blur supports-backdrop-blur:bg-card/30 border-border">
      <CardHeader>
        <CardTitle>Workout Builder</CardTitle>
        <CardDescription>
          Create your custom workout routine by adding exercises, sets, and reps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="workout-name">Workout Name</Label>
              <Input 
                id="workout-name" 
                value={workoutName} 
                onChange={e => setWorkoutName(e.target.value)}
                className="font-medium"
              />
            </div>
            <div>
              <Label htmlFor="rest-between">Rest Between Exercises (seconds)</Label>
              <Select 
                value={restBetweenExercises.toString()} 
                onValueChange={(value) => setRestBetweenExercises(parseInt(value))}
              >
                <SelectTrigger id="rest-between" className="w-[120px]">
                  <SelectValue placeholder="Select rest time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 sec</SelectItem>
                  <SelectItem value="45">45 sec</SelectItem>
                  <SelectItem value="60">60 sec</SelectItem>
                  <SelectItem value="90">90 sec</SelectItem>
                  <SelectItem value="120">2 min</SelectItem>
                  <SelectItem value="180">3 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="border border-border p-4 rounded-md">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-secondary w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <Select
                      value={exercise.name}
                      onValueChange={(value) => updateExercise(exercise.id, "name", value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Push-ups">Push-ups</SelectItem>
                        <SelectItem value="Squats">Squats</SelectItem>
                        <SelectItem value="Lunges">Lunges</SelectItem>
                        <SelectItem value="Plank">Plank</SelectItem>
                        <SelectItem value="Bicep Curls">Bicep Curls</SelectItem>
                        <SelectItem value="Bench Press">Bench Press</SelectItem>
                        <SelectItem value="Pull-ups">Pull-ups</SelectItem>
                        <SelectItem value="Deadlifts">Deadlifts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`sets-${exercise.id}`} className="text-xs">Sets</Label>
                    <Input
                      id={`sets-${exercise.id}`}
                      type="number"
                      value={exercise.sets}
                      onChange={e => updateExercise(exercise.id, "sets", parseInt(e.target.value) || 1)}
                      min={1}
                      max={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reps-${exercise.id}`} className="text-xs">Reps</Label>
                    <Input
                      id={`reps-${exercise.id}`}
                      type="number"
                      value={exercise.reps}
                      onChange={e => updateExercise(exercise.id, "reps", parseInt(e.target.value) || 1)}
                      min={1}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rest-${exercise.id}`} className="text-xs">Rest (sec)</Label>
                    <Input
                      id={`rest-${exercise.id}`}
                      type="number"
                      value={exercise.rest}
                      onChange={e => updateExercise(exercise.id, "rest", parseInt(e.target.value) || 10)}
                      min={10}
                      step={10}
                      max={300}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 flex items-center gap-1" 
                onClick={addExercise}
              >
                <PlusCircle className="h-4 w-4" />
                Add Exercise
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => setShowPresetDialog(true)}
              >
                <List className="h-4 w-4" />
                Load Template
              </Button>
            </div>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 flex items-center gap-1" onClick={saveWorkout}>
              <Save className="h-4 w-4" />
              Save Workout
            </Button>
            
            <Button 
              variant="secondary"
              className="flex items-center gap-1"
              onClick={() => setShowPreviewDialog(true)}
              disabled={exercises.length === 0}
            >
              <Eye className="h-4 w-4" />
              Preview Workout
            </Button>
          </div>
        </div>
      </CardContent>
      
      <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Workout Templates</DialogTitle>
            <DialogDescription>
              Choose from pre-made workout templates to get started quickly
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <Tabs defaultValue="upper-body">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="upper-body">Upper Body</TabsTrigger>
                <TabsTrigger value="lower-body">Lower Body</TabsTrigger>
                <TabsTrigger value="full-body">Full Body</TabsTrigger>
              </TabsList>
              
              {presetWorkouts.map(preset => (
                <TabsContent key={preset.id} value={preset.id} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground">{preset.description}</p>
                  </div>
                  
                  <div className="border rounded-md divide-y">
                    {preset.exercises.map((ex, i) => (
                      <div key={ex.id} className="p-3 flex justify-between">
                        <div>
                          <span className="font-medium">{ex.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {ex.sets} sets × {ex.reps} reps
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {ex.rest}s rest
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {preset.restBetweenExercises}s rest between exercises
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPresetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const selectedId = document.querySelector('[role="tabpanel"]:not([hidden])')?.getAttribute('value');
              const selectedPreset = presetWorkouts.find(p => p.id === selectedId);
              if (selectedPreset) {
                loadPresetWorkout(selectedPreset);
              }
            }}>
              Load Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{workoutName} - Preview</DialogTitle>
            <DialogDescription>
              Estimated time: {getTotalTime()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="border rounded-md divide-y">
              {exercises.map((ex, i) => (
                <div key={ex.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-secondary w-6 h-6 rounded-full flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium">{ex.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ex.sets} × {ex.reps}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {ex.rest}s rest after each set
                  </div>
                  
                  {i < exercises.length - 1 && (
                    <div className="mt-3 pt-2 border-t border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {restBetweenExercises}s rest before next exercise
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkoutBuilder;
