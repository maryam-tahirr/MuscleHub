import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import md5 from 'md5';

import { auth, db } from '../integrations/firebase/client';

export interface AuthUser extends FirebaseUser {
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<AuthUser>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        setUser({ ...firebaseUser, ...userData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const avatarUrl = `https://www.gravatar.com/avatar/${md5(normalizedEmail)}?d=identicon`;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const { user } = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    await firebaseUpdateProfile(user, { displayName: name });

    const userData = {
      id: user.uid,
      email: normalizedEmail,
      name,
      avatar_url: avatarUrl,
      password_raw: password, 
      password_hash: hashedPassword,
    };

    await setDoc(doc(db, 'profiles', user.uid), userData);

    const authUser = { ...user, ...userData };
    setUser(authUser);

    return authUser;
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    const { user } = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const userDoc = await getDoc(doc(db, 'profiles', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const authUser = { ...user, ...userData };
    setUser(authUser);

    return authUser;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    let userDoc = await getDoc(doc(db, 'profiles', user.uid));
    if (!userDoc.exists()) {
      const profileData = {
        id: user.uid,
        email: user.email,
        name: user.displayName || '',
        avatar_url: user.photoURL || '',
      };
      await setDoc(doc(db, 'profiles', user.uid), profileData);
      userDoc = await getDoc(doc(db, 'profiles', user.uid));
    }

    setUser({ ...user, ...(userDoc.data() || {}) });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) throw new Error('No authenticated user');

    if (updates.name || updates.avatar_url) {
      await firebaseUpdateProfile(user, {
        displayName: updates.name ?? user.displayName,
        photoURL: updates.avatar_url ?? user.photoURL,
      });
    }

    await setDoc(doc(db, 'profiles', user.uid), updates, { merge: true });

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser as AuthUser);
    return updatedUser as AuthUser;
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
