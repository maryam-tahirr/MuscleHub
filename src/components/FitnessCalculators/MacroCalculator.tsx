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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

const MacroCalculator = () => {
  const [calories, setCalories] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [macroRatio, setMacroRatio] = useState<number[]>([30, 40, 30]);
  const [result, setResult] = useState<MacroResult | null>(null);
  
  const calculateMacros = () => {
    if (!calories) return;
    
    const caloriesNum = parseFloat(calories);
    
    let adjustedCalories = caloriesNum;
    if (goal === 'lose') {
      adjustedCalories = caloriesNum * 0.8;
    } else if (goal === 'gain') {
      adjustedCalories = caloriesNum * 1.15;
    }
    
    const proteinCalories = adjustedCalories * (macroRatio[0] / 100);
    const carbsCalories = adjustedCalories * (macroRatio[1] / 100);
    const fatCalories = adjustedCalories * (macroRatio[2] / 100);
    
    const proteinGrams = Math.round(proteinCalories / 4);
    const carbsGrams = Math.round(carbsCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);
    
    setResult({
      calories: Math.round(adjustedCalories),
      protein: macroRatio[0],
      carbs: macroRatio[1],
      fat: macroRatio[2],
      proteinGrams,
      carbsGrams,
      fatGrams
    });
  };
  
  const handleProteinSliderChange = (newValue: number[]) => {
    const protein = newValue[0];
    const remainingPercentage = 100 - protein;
    const currentCarbFatRatio = macroRatio[1] / (macroRatio[1] + macroRatio[2]);
    
    const newCarbs = Math.round(remainingPercentage * currentCarbFatRatio);
    const newFat = 100 - protein - newCarbs;
    
    setMacroRatio([protein, newCarbs, newFat]);
  };
  
  const handleCarbsSliderChange = (newValue: number[]) => {
    const carbs = newValue[0];
    const newFat = 100 - macroRatio[0] - carbs;
    
    if (newFat >= 0) {
      setMacroRatio([macroRatio[0], carbs, newFat]);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Macro Calculator</CardTitle>
        <CardDescription>
          Calculate your optimal macro nutrient split based on your calorie needs and goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="daily-calories">Daily Calories</Label>
          <Input 
            id="daily-calories" 
            type="number" 
            placeholder="e.g., 2000" 
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Don't know your daily calories? Use the Calorie Calculator first.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="goal">Goal</Label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger id="goal">
              <SelectValue placeholder="Select your goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose">Lose Weight</SelectItem>
              <SelectItem value="maintain">Maintain Weight</SelectItem>
              <SelectItem value="gain">Gain Muscle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="protein-slider">Protein: {macroRatio[0]}%</Label>
              <span className="text-sm text-muted-foreground">(recommended: 25-35%)</span>
            </div>
            <Slider 
              id="protein-slider"
              value={[macroRatio[0]]} 
              min={10} 
              max={60} 
              step={1}
              onValueChange={handleProteinSliderChange}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="carbs-slider">Carbs: {macroRatio[1]}%</Label>
              <span className="text-sm text-muted-foreground">(recommended: 30-50%)</span>
            </div>
            <Slider 
              id="carbs-slider"
              value={[macroRatio[1]]} 
              min={10} 
              max={70} 
              step={1}
              onValueChange={handleCarbsSliderChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fat-percentage">Fat: {macroRatio[2]}%</Label>
            <div className="h-5 w-full rounded-full bg-secondary">
              <div 
                className="h-full rounded-full bg-primary"
                style={{ width: `${macroRatio[2]}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              (recommended: 20-35%)
            </p>
          </div>
        </div>
        
        <Button onClick={calculateMacros} className="w-full">Calculate Macros</Button>
        
        {result && (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-lg">Your daily calorie target:</p>
              <div className="text-2xl font-bold text-primary">{result.calories} calories</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-primary/50">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base">Protein</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-xl font-bold">{result.proteinGrams}g</div>
                  <p className="text-xs text-muted-foreground">{result.protein}% of calories</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base">Carbs</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-xl font-bold">{result.carbsGrams}g</div>
                  <p className="text-xs text-muted-foreground">{result.carbs}% of calories</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base">Fat</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-xl font-bold">{result.fatGrams}g</div>
                  <p className="text-xs text-muted-foreground">{result.fat}% of calories</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MacroCalculator;
