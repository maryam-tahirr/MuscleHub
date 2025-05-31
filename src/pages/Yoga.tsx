import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

type Pose = {
  id: string;
  name: string;
  category: string;
  level: string;
  img_url: string;
  url_png: string;
  english_name: string;
  pose_benefits: string;
  pose_description: string;
};

const YogaPoses = () => {
  const [poses, setPoses] = useState<Pose[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch("https://yoga-api-nzy4.onrender.com/v1/poses")
    .then((res) => res.json())
    .then((data) => {
      console.log("Yoga API data:", data);
      setPoses(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Failed to load yoga poses", err);
      setLoading(false);
    });
}, []);


  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
        <Navbar/>
      <h1 className="text-3xl font-bold mb-6 text-center pt-8">Yoga Poses</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {poses.slice(0, 12).map((pose, index) => (
            <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                <img
                    src={pose.url_png}
                    alt={pose.english_name}
                    className="w-full h-64 object-contain rounded-lg mb-4"
                />
                <h2 className="text-xl font-semibold">{pose.english_name}</h2>
                <p className="text-sm text-muted-foreground mb-2">
                    {pose.pose_benefits}
                </p>
                <p className="text-sm text-muted-foreground italic">
                    {pose.pose_description}
                </p>
                </CardContent>
            </Card>
            ))}

      </div>
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

export default YogaPoses;
