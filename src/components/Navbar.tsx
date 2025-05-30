import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Dumbbell, Calculator, Home, Menu, BicepsFlexed, Heart } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/auth/useAuth";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/exercise-library", label: "Exercises", icon: Dumbbell },
    { path: "/workout-builder", label: "Workout Builder", icon: BicepsFlexed },
    { path: "/calculators", label: "Tools", icon: Calculator },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b shadow-sm">
      <div className="container max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition">
          Muscle Hub
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                location.pathname === path
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={
                  location.pathname.includes("/saved") ? "default" : "ghost"
                }
                className="flex items-center gap-2 text-sm"
              >
                <Heart className="w-4 h-4" />
                Saved
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/saved-exercises">Saved Exercises</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/saved-workouts">Saved Workouts</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.email}
                      className="w-8 h-8 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-muted flex items-center justify-center rounded-full text-sm font-semibold">
                      {user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 px-4 py-3 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                location.pathname === path
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          <Link
            to="/saved-exercises"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
              location.pathname.includes("/saved")
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                className="block px-3 py-2 text-sm hover:underline"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-sm hover:underline"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="block px-3 py-2 text-sm hover:underline"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md text-center"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
