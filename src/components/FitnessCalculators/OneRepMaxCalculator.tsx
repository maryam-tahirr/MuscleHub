
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OneRepMaxCalculator = () => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [unit, setUnit] = useState('kg');
  const [oneRepMax, setOneRepMax] = useState<number | null>(null);
  
  const calculateOneRepMax = () => {
    if (!weight || !reps) return;
    
    const weightNum = parseFloat(weight);
    const repsNum = parseFloat(reps);
    
    if (repsNum < 1 || repsNum > 12) {
      alert('Please enter between 1 and 12 reps for accurate calculations');
      return;
    }
    
    const orm = weightNum * (36 / (37 - repsNum));
    setOneRepMax(parseFloat(orm.toFixed(1)));
  };
  
  const getPercentageTable = (max: number): { percentage: number; weight: number }[] => {
    const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
    return percentages.map(percentage => ({
      percentage,
      weight: parseFloat((max * (percentage / 100)).toFixed(1))
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>One-Rep Max (1RM) Calculator</CardTitle>
        <CardDescription>
          Estimate your one-rep max based on weights you can lift for multiple reps.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          defaultValue="kg"
          value={unit}
          onValueChange={setUnit}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="kg" id="kg" />
            <Label htmlFor="kg">Kilograms (kg)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lb" id="lb" />
            <Label htmlFor="lb">Pounds (lb)</Label>
          </div>
        </RadioGroup>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight Lifted ({unit})</Label>
            <Input 
              id="weight" 
              type="number" 
              placeholder="e.g., 100" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps">Reps Performed</Label>
            <Input 
              id="reps" 
              type="number" 
              placeholder="e.g., 8" 
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              min="1"
              max="12"
            />
            <p className="text-xs text-muted-foreground">
              For best accuracy, enter between 1-12 reps.
            </p>
          </div>
        </div>
        
        <Button onClick={calculateOneRepMax} className="w-full">Calculate 1RM</Button>
        
        {oneRepMax !== null && (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-lg">Your estimated one-rep max:</p>
              <div className="text-3xl font-bold text-primary">
                {oneRepMax} {unit}
              </div>
            </div>
            
            <Table>
              <TableCaption>Percentage-based training recommendations.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Weight ({unit})</TableHead>
                  <TableHead className="text-right">Training Use</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPercentageTable(oneRepMax).map((row) => (
                  <TableRow key={row.percentage}>
                    <TableCell>{row.percentage}%</TableCell>
                    <TableCell>{row.weight}</TableCell>
                    <TableCell className="text-right">
                      {row.percentage >= 90 
                        ? 'Strength / Power' 
                        : row.percentage >= 75 
                          ? 'Strength / Hypertrophy' 
                          : 'Endurance / Technique'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OneRepMaxCalculator;
