
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
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('metric');
  const [bmi, setBmi] = useState<number | null>(null);
  
  const calculateBMI = () => {
    if (!height || !weight) return;
    
    let bmiValue: number;
    
    if (unit === 'metric') {
      const heightInMeters = parseFloat(height) / 100;
      bmiValue = parseFloat(weight) / (heightInMeters * heightInMeters);
    } else {
      bmiValue = (parseFloat(weight) * 703) / (parseFloat(height) * parseFloat(height));
    }
    
    setBmi(parseFloat(bmiValue.toFixed(1)));
  };

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: "Underweight", color: "bg-blue-500" };
    if (bmi < 25) return { category: "Healthy Weight", color: "bg-green-500" };
    if (bmi < 30) return { category: "Overweight", color: "bg-yellow-500" };
    return { category: "Obesity", color: "bg-red-500" };
  };

  const getProgressValue = (bmi: number | null): number => {
    if (bmi === null) return 0;
    return Math.min(Math.max(((bmi - 15) / 25) * 100, 0), 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>BMI Calculator</CardTitle>
        <CardDescription>
          Calculate your Body Mass Index (BMI) to check if your weight is healthy for your height.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          defaultValue="metric"
          value={unit}
          onValueChange={setUnit}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="metric" id="metric" />
            <Label htmlFor="metric">Metric (cm, kg)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="imperial" id="imperial" />
            <Label htmlFor="imperial">Imperial (in, lbs)</Label>
          </div>
        </RadioGroup>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="height">
              Height {unit === 'metric' ? '(cm)' : '(inches)'}
            </Label>
            <Input 
              id="height" 
              type="number" 
              placeholder={unit === 'metric' ? "e.g., 175" : "e.g., 69"} 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">
              Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
            </Label>
            <Input 
              id="weight" 
              type="number" 
              placeholder={unit === 'metric' ? "e.g., 70" : "e.g., 154"} 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
        
        <Button onClick={calculateBMI} className="w-full">Calculate BMI</Button>
        
        {bmi !== null && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Your BMI: {bmi}</span>
              <span className="text-sm font-medium">{getBMICategory(bmi).category}</span>
            </div>
            <Progress className="h-2" value={getProgressValue(bmi)} />
            <div className="grid grid-cols-4 text-xs text-center">
              <div className="text-blue-500">Underweight</div>
              <div className="text-green-500">Healthy</div>
              <div className="text-yellow-500">Overweight</div>
              <div className="text-red-500">Obesity</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BMICalculator;
