import React, { createContext, useState, useEffect, useContext } from "react";
import { User, AuthContextType } from "../utils/types";
import { auth, subscribeToData, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from "firebase/auth";

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  loginWithGoogle: async () => false,
  logout: async () => {},
  isAuthenticated: false,
  hasCompletedProfile: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean>(false);

  // Handle user data after successful authentication
  const handleAuthenticatedUser = async (provider: 'password' | 'google'): Promise<boolean> => {
    try {
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error(`Error handling ${provider} authenticated user:`, error);
      return false;
    }
  };

  // Login function using Firebase authentication
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return handleAuthenticatedUser('password');
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      await signInWithPopup(auth, googleProvider);
      return handleAuthenticatedUser('google');
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  // Logout function using Firebase authentication
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Initialize Firebase auth state and subscribe to user data
  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          unsubscribeUser = subscribeToData<User>(
            `users/${firebaseUser.uid}`,
            (userData) => {
              if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
                setHasCompletedProfile(true);
              } else {
                // For new users, set minimal user data without saving to DB
                setUser({
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  role: firebaseUser.email?.endsWith('@admin.smartlab.com') ? 'admin' : 'student',
                  createdAt: new Date().toISOString(),
                  provider: firebaseUser.providerData[0]?.providerId.includes('google') ? 'google' : 'password',
                });
                setIsAuthenticated(true);
                setHasCompletedProfile(false);
              }
            }
          );
        } catch (error) {
          console.error("Error setting up user subscription:", error);
          setUser(null);
          setIsAuthenticated(false);
          setHasCompletedProfile(false);
        }
      } else {
        if (unsubscribeUser) unsubscribeUser();
        setUser(null);
        setIsAuthenticated(false);
        setHasCompletedProfile(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  // Auth context value
  const value = {
    user,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated,
    hasCompletedProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};