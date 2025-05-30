
import React from 'react';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Exercise } from '@/services/exerciseService';

interface ExerciseCardProps {
  exercise: Exercise;
  isSaved: boolean;
  onSelect: (exercise: Exercise) => void;
  onToggleSave: (e: React.MouseEvent, exercise: Exercise) => void;
}

const ExerciseCard = ({ exercise, isSaved, onSelect, onToggleSave }: ExerciseCardProps) => {
  return (
    <Card
      className="overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => onSelect(exercise)}
    >
      <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
        <img
          src={exercise.gifUrl}
          alt={exercise.name}
          className="h-full w-full object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
          onClick={(e) => onToggleSave(e, exercise)}
        >
          <Heart
            className="h-4 w-4"
            fill={isSaved ? "currentColor" : "none"}
          />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-1 capitalize">{exercise.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 capitalize">{exercise.target}</p>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
