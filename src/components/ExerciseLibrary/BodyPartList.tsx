
import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface BodyPartListProps {
  bodyParts: string[];
  selectedBodyPart: string;
  isLoading: boolean;
  onSelectBodyPart: (bodyPart: string) => void;
}

const BodyPartList = ({ 
  bodyParts, 
  selectedBodyPart, 
  isLoading, 
  onSelectBodyPart 
}: BodyPartListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {bodyParts.map((bodyPart) => (
        <Button
          key={bodyPart}
          variant={selectedBodyPart === bodyPart ? "secondary" : "ghost"}
          className="justify-start w-full font-normal"
          onClick={() => onSelectBodyPart(bodyPart)}
        >
          {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
        </Button>
      ))}
    </div>
  );
};

export default BodyPartList;
