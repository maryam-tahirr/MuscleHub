import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { fetchWorkoutLogs } from '@/services/firebaseUserStatsService';
import { fetchSavedExercises } from '@/services/savedExerciseService';
import { format } from 'date-fns';
import { useAuth } from '@/auth/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

const fetchUserProfile = async (userId: string) => {
  const profileRef = doc(db, 'profiles', userId);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    throw new Error('Profile not found');
  }

  return profileSnap.data();
};

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();

  const { data: workoutLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['workoutLogs'],
    queryFn: fetchWorkoutLogs,
    enabled: isAuthenticated,
  });

  const { data: savedExercises = [], isLoading: isLoadingSaved } = useQuery({
    queryKey: ['savedExercises'],
    queryFn: fetchSavedExercises,
    enabled: isAuthenticated,
  });

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: () => fetchUserProfile(user!.uid),
    enabled: !!user?.uid,
  });

  const formatDuration = (durationSeconds: number) => {
    if (!durationSeconds || durationSeconds <= 0) return '0 seconds';
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return seconds === 0
      ? `${minutes} minute${minutes === 1 ? '' : 's'}`
      : `${minutes} minute${minutes === 1 ? '' : 's'} ${seconds} second${seconds === 1 ? '' : 's'}`;
  };

  const workoutChartData = React.useMemo(() => {
    return workoutLogs.slice(0, 14).reverse().map(log => ({
      date: log?.completedDate ? format(new Date(log.completedDate), 'MMM dd') : '',
      duration: ((log?.duration || 0) / 60).toFixed(1),
      exercises: log?.exercisesCompleted || 0,
      name: log?.workoutName || 'Workout',
    }));
  }, [workoutLogs]);

  const workoutDistribution = React.useMemo(() => {
    const muscleCountMap: Record<string, number> = {};
    workoutLogs.forEach(log => {
      const muscles = Array.isArray(log.musclesWorked) ? log.musclesWorked : [];
      muscles.forEach(muscle => {
        muscleCountMap[muscle] = (muscleCountMap[muscle] || 0) + 1;
      });
    });
    return Object.entries(muscleCountMap).map(([name, count]) => ({ name, count }));
  }, [workoutLogs]);

  const totalWorkoutTime = React.useMemo(() => {
    return Math.floor(workoutLogs.reduce((total, log) => total + (log.duration || 0), 0) / 60);
  }, [workoutLogs]);

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-8">
          <div className="container mx-auto max-w-6xl px-4 text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to view your profile</p>
            <Button asChild><a href="/signin">Sign In</a></Button>
          </div>
        </main>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive text-center">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start py-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                (profile?.name?.[0] || user?.displayName?.[0] || 'U')
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{profile?.name || user?.displayName || 'User'}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card><CardHeader className="pb-2"><CardTitle className="text-lg">Workouts Completed</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{workoutLogs.length}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-lg">Saved Exercises</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{savedExercises.length}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-lg">Total Workout Time</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totalWorkoutTime} min</p></CardContent></Card>
          </div>

          <Tabs defaultValue="progress">
            <TabsList className="mb-6">
              <TabsTrigger value="progress">Workout Progress</TabsTrigger>
              <TabsTrigger value="history">Workout History</TabsTrigger>
            </TabsList>

            <TabsContent value="progress">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Workout Duration</CardTitle></CardHeader>
                  <CardContent>
                    {isLoadingLogs ? (
                      <Skeleton className="h-64 w-full" />
                    ) : workoutChartData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={workoutChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="duration" stroke="#4f46e5" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-center py-10 text-muted-foreground">No workout data available yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Workout Distribution</CardTitle></CardHeader>
                  <CardContent>
                    {isLoadingLogs ? (
                      <Skeleton className="h-64 w-full" />
                    ) : workoutDistribution.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={workoutDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4f46e5" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-center py-10 text-muted-foreground">No workout data available yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader><CardTitle>Recent Workouts</CardTitle></CardHeader>
                <CardContent>
                  {isLoadingLogs ? (
                    <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : workoutLogs.length > 0 ? (
                    <div className="space-y-4">
                      {workoutLogs.map((log, i) => {
                        const muscles = Array.isArray(log.musclesWorked) ? log.musclesWorked : [];
                        return (
                          <div key={log._id || `${log.completedDate}-${i}`} className="p-4 border rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{log?.workoutName || 'Workout'}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {log?.completedDate ? format(new Date(log.completedDate), 'PPP') : ''} •{' '}
                                  {formatDuration(log?.duration || 0)} • {log?.exercisesCompleted || 0} exercise{(log?.exercisesCompleted || 0) === 1 ? '' : 's'}{' '}
                                  {muscles.length > 0 && `• ${muscles.join(', ')}`}
                                </p>
                              </div>
                            </div>
                            {log?.notes && (
                              <p className="text-sm mt-2 bg-muted p-2 rounded">{log.notes}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-10 text-muted-foreground">No workouts logged yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;
