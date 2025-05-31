import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import BMICalculator from "@/components/FitnessCalculators/BMICalculator";
import CalorieCalculator from "@/components/FitnessCalculators/CalorieCalculator";
import MacroCalculator from "@/components/FitnessCalculators/MacroCalculator";
import OneRepMaxCalculator from "@/components/FitnessCalculators/OneRepMaxCalculator";

const Calculators = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 pb-8">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="py-8">
            <h1 className="text-3xl font-bold mb-2">Fitness Calculators</h1>
            <p className="text-muted-foreground">
              Use these tools to calculate important fitness metrics and customize your training.
            </p>
          </div>
          
          <Tabs defaultValue="bmi" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="bmi">BMI</TabsTrigger>
              <TabsTrigger value="calorie">Calorie</TabsTrigger>
              <TabsTrigger value="macro">Macro</TabsTrigger>
              <TabsTrigger value="1rm">One-Rep Max</TabsTrigger>
            </TabsList>
            <TabsContent value="bmi" className="mt-0">
              <BMICalculator />
            </TabsContent>
            <TabsContent value="calorie" className="mt-0">
              <CalorieCalculator />
            </TabsContent>
            <TabsContent value="macro" className="mt-0">
              <MacroCalculator />
            </TabsContent>
            <TabsContent value="1rm" className="mt-0">
              <OneRepMaxCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="py-8 px-4 border-t border-border bg-background">
                <div className="container mx-auto max-w-6xl">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">Muscle Hub</span>
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

export default Calculators;
