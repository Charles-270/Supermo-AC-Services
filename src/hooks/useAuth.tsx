/**
 * Authentication Hook
 * Manages Firebase Authentication state and operations
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AuthUser, AuthContextState, UserProfile, UserRole } from '@/types/user';
import { getUserProfile } from '@/services/userService';

/**
 * Authentication Context
 */
const AuthContext = createContext<AuthContextState & {
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signUp: async () => { throw new Error('Not implemented'); },
  signIn: async () => { throw new Error('Not implemented'); },
  signInWithGoogle: async () => { throw new Error('Not implemented'); },
  signOut: async () => { throw new Error('Not implemented'); },
  resetPassword: async () => { throw new Error('Not implemented'); },
  refreshProfile: async () => { throw new Error('Not implemented'); },
});

/**
 * Google OAuth Provider
 */
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userProfile = await getUserProfile(uid);
      setProfile(userProfile);
      return userProfile;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err as Error);
      return null;
    }
  };

  /**
   * Convert Firebase User to AuthUser
   */
  const convertToAuthUser = (firebaseUser: User, userProfile?: UserProfile | null): AuthUser => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      role: userProfile?.role,
      profile: userProfile || undefined,
    };
  };

  /**
   * Listen to authentication state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        // User is signed in - fetch profile
        const userProfile = await fetchUserProfile(firebaseUser.uid);
        const authUser = convertToAuthUser(firebaseUser, userProfile);
        setUser(authUser);
      } else {
        // User is signed out
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    _role: UserRole
  ): Promise<User> => {
    try {
      setError(null);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Note: User profile will be created in Firestore by userService
      // This is handled in the registration form

      return firebaseUser;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async (): Promise<User> => {
    try {
      setError(null);
      const userCredential = await signInWithPopup(auth, googleProvider);

      // Check if user profile exists in Firestore
      // If not, redirect to role selection page
      const userProfile = await getUserProfile(userCredential.user.uid);

      if (!userProfile) {
        // New Google user - needs to select role
        // This will be handled in the UI
        console.log('New Google user - role selection required');
      }

      return userCredential.user;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  /**
   * Sign out
   */
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  /**
   * Refresh user profile from Firestore
   */
  const refreshProfile = async (): Promise<void> => {
    if (user?.uid) {
      await fetchUserProfile(user.uid);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Access authentication state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Helper: Check if user has specific role
 */
export function useHasRole(role: UserRole): boolean {
  const { profile } = useAuth();
  return profile?.role === role;
}

/**
 * Helper: Check if user has any of the specified roles
 */
export function useHasAnyRole(roles: UserRole[]): boolean {
  const { profile } = useAuth();
  return profile?.role ? roles.includes(profile.role) : false;
}

/**
 * Helper: Require authentication (redirect if not authenticated)
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, loading };
}
