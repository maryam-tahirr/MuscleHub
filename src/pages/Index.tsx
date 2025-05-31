import React, { useState , useEffect} from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import WorkoutBuilder from "@/components/WorkoutBuilder";
import { Dumbbell, ChevronRight, Calculator, User, Heart, BicepsFlexed, BookOpen, Mail, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const Index = () => {
  const [quote, setQuote] = useState<string | null>(null); 
  const [author, setAuthor] = useState<string | null>(null);
useEffect(() => {
  fetch("http://localhost:5000/api/quote")
    .then(res => res.json())
    .then(data => {
      setQuote(data.quote);
      setAuthor(data.author);
    })
    .catch(err => console.error("Failed to fetch quote", err));
}, []);


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        <section className="py-24 px-4 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Unlock Your 
                  <span className="text-primary"> Fitness</span> Potential
                </h1>
                <p className="text-xl text-muted-foreground">
                  Discover exercises, calculate your fitness metrics, and track your progress with our interactive platform.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link to="/exercises">
                      <BicepsFlexed className="mr-2 h-5 w-5" />
                      Explore Exercises
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/calculators">
                      <Calculator className="mr-2 h-5 w-5" />
                      Fitness Tools
                    </Link>
                  </Button>
                </div>
                {quote && ( // 🔥 Zen Quote Section
                  <div className="mt-6 p-4 border-l-4 border-primary bg-secondary/10 rounded">
                    <p className="text-lg italic">“{quote}”</p>
                    <p className="text-right text-sm mt-2">— {author}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <div
                className="relative w-50 h-50 md:w-[28rem] md:h-[28rem] bg-primary/10 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1652364690376-db27a1965bc0?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                >
                </div>
            </div>

            </div>
          </div>
        </section>
        
        <section className="py-16 px-4 bg-card">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            
              <div className="p-6 bg-secondary/20 rounded-lg border border-border">
                <Calculator className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fitness Calculators</h3>
                <p className="text-muted-foreground mb-4">
                  Track your BMI, calculate calories, determine macro splits, and find your one-rep max.
                </p>
                <Link to="/calculators" className="text-primary flex items-center group">
                  Use calculators 
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              
              <div className="p-6 bg-secondary/20 rounded-lg border border-border">
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Exercise Library</h3>
                <p className="text-muted-foreground mb-4">
                  Browse our comprehensive database of exercises with detailed instructions and animations.
                </p>
                <Link to="/exercise-library" className="text-primary flex items-center group">
                  Browse library
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              
              <div className="p-6 bg-secondary/20 rounded-lg border border-border">
                <Heart className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Save Favorites</h3>
                <p className="text-muted-foreground mb-4">
                  Create an account to save your favorite exercises and track your progress over time.
                </p>
                <Link to="/signup" className="text-primary flex items-center group">
                  Sign up now 
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-8">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="py-8">
              <h1 className="text-3xl font-bold mb-2">About MuscleMotionHub</h1>
              <p className="text-muted-foreground">
                Learn more about our platform and how it can help you achieve your fitness goals.
              </p>
            </div>
            
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">Our Mission</h2>
                </div>
                <p className="mb-4 text-lg">
                  MuscleMotionHub aims to make fitness knowledge accessible to everyone, regardless of experience level. Our platform provides visual, interactive tools to help you understand proper exercise techniques and plan your fitness journey.
                </p>
                
              </CardContent>
            </Card>
            
<div >
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold mb-4">Contact us!</h3>
          <form
            action="https://formspree.io/f/xjkrbgwz" // Replace with your Formspree form ID
            method="POST"
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="block mb-1 ">Name</label>
              <Input type="text" name="name" id="name" required />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 ">Email</label>
              <Input type="email" name="email" id="email" required />
            </div>
            <div>
              <label htmlFor="message" className="block mb-1 ">Message</label>
              <Textarea name="message" id="message" rows={5} required />
            </div>
            <Button type="submit">Send Message</Button>
          </form>
        </CardContent>
      </Card>
    </div>
          </div>
        </section>

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
      </main>
    </div>
  );
};

export default Index;
