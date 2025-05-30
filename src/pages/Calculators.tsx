
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
    </div>
  );
};

export default Calculators;
