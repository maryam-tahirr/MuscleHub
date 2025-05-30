
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CalorieCalculator = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [unit, setUnit] = useState('metric');
  const [calories, setCalories] = useState<number | null>(null);
  
  const calculateCalories = () => {
    if (!age || !height || !weight) return;
    
    let heightInCm = parseFloat(height);
    let weightInKg = parseFloat(weight);
    
    if (unit === 'imperial') {
      heightInCm = parseFloat(height) * 2.54;
      weightInKg = parseFloat(weight) * 0.453592;
    }
    
    let bmr: number;
    
    if (gender === 'male') {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * parseInt(age) + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * parseInt(age) - 161;
    }
    
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,     
      light: 1.375,      
      moderate: 1.55,
      active: 1.725, 
      veryActive: 1.9
    };
    
    const totalCalories = Math.round(bmr * activityMultipliers[activity]);
    setCalories(totalCalories);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calorie Calculator</CardTitle>
        <CardDescription>
          Estimate daily calorie needs based on your stats and activity level.
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
            <RadioGroupItem value="metric" id="calorie-metric" />
            <Label htmlFor="calorie-metric">Metric (cm, kg)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="imperial" id="calorie-imperial" />
            <Label htmlFor="calorie-imperial">Imperial (in, lbs)</Label>
          </div>
        </RadioGroup>
        
        <RadioGroup
          defaultValue="male"
          value={gender}
          onValueChange={setGender}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
        </RadioGroup>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input 
              id="age" 
              type="number" 
              placeholder="e.g., 30" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calorie-height">
              Height {unit === 'metric' ? '(cm)' : '(inches)'}
            </Label>
            <Input 
              id="calorie-height" 
              type="number" 
              placeholder={unit === 'metric' ? "e.g., 175" : "e.g., 69"} 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calorie-weight">
              Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
            </Label>
            <Input 
              id="calorie-weight" 
              type="number" 
              placeholder={unit === 'metric' ? "e.g., 70" : "e.g., 154"} 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="activity">Activity Level</Label>
          <Select value={activity} onValueChange={setActivity}>
            <SelectTrigger id="activity">
              <SelectValue placeholder="Select activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
              <SelectItem value="light">Lightly active (light exercise 1-3 days/week)</SelectItem>
              <SelectItem value="moderate">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
              <SelectItem value="active">Very active (hard exercise 6-7 days/week)</SelectItem>
              <SelectItem value="veryActive">Extremely active (very hard exercise, physical job, or training twice a day)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={calculateCalories} className="w-full">Calculate Calories</Button>
        
        {calories !== null && (
          <div className="mt-6 text-center space-y-4">
            <p className="text-lg">Your estimated daily calorie needs:</p>
            <div className="text-3xl font-bold text-primary">{calories} calories</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-card border border-border rounded-lg">
                <div className="font-medium">Weight Loss</div>
                <div className="text-lg">{calories - 500} cal</div>
              </div>
              <div className="p-2 bg-card border border-border rounded-lg">
                <div className="font-medium">Maintenance</div>
                <div className="text-lg">{calories} cal</div>
              </div>
              <div className="p-2 bg-card border border-border rounded-lg">
                <div className="font-medium">Weight Gain</div>
                <div className="text-lg">{calories + 500} cal</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalorieCalculator;
