import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase/client';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            toast.success('Authentication successful');
            navigate('/');
          } else {
            setError('No user session found');
            setTimeout(() => navigate('/signin'), 2000);
          }
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed');
        toast.error('Authentication failed');
        setTimeout(() => navigate('/signin'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">{error}</h1>
          <p className="mt-2 text-muted-foreground">Redirecting to sign in page...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <h1 className="mt-4 text-2xl font-bold">Authenticating...</h1>
          <p className="mt-2 text-muted-foreground">Please wait while we log you in</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
