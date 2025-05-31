import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchMeals } from "@/services/nutrition";

import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";
interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string;
}

const DEFAULT_QUERY = "salad"; // default query on load

const Nutrition = () => {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMeals = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    setMeals(null);

    try {
      const data = await fetchMeals(searchTerm);
      setMeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch default recipes on mount
  useEffect(() => {
    loadMeals(DEFAULT_QUERY);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    loadMeals(query.trim());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Search healthy recipes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          {!loading && meals && meals.length === 0 && <p>No recipes found.</p>}

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {meals?.map((meal) => (
              <Card key={meal.idMeal} className="hover:shadow-lg transition-shadow">
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="w-full h-48 object-cover rounded-t"
                />
                <CardContent>
                  <h2 className="text-lg font-semibold">{meal.strMeal}</h2>
                  <p className="text-sm text-gray-600">
                    {meal.strCategory} | {meal.strArea}
                  </p>
                  <p className="mt-2 text-sm line-clamp-3">{meal.strInstructions}</p>
                  {meal.strYoutube && (
                    <a
                      href={meal.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Watch Video
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
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

export default Nutrition;
