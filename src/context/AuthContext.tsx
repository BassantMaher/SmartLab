import React, { createContext, useState, useEffect, useContext } from "react";
import { User, AuthContextType } from "../utils/types";
import { auth, readData, subscribeToData } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { initializeLocalStorage } from "../utils/mockData";

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: async () => {},
  isAuthenticated: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize the localStorage with mock data and check Firebase auth state
  useEffect(() => {
    initializeLocalStorage();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Subscribe to user data changes
          const unsubscribeUser = subscribeToData<User>(
            `users/${firebaseUser.uid}`,
            (userData) => {
              if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
              } else {
                console.error("User data not found in database");
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          );

          // Cleanup user subscription when auth state changes
          return () => unsubscribeUser();
        } catch (error) {
          console.error("Error setting up user subscription:", error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function using Firebase authentication
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Sign in with Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid } = userCredential.user;

      // Get user data from database
      const userData = await readData<User>(`users/${uid}`);

      if (userData) {
        // Store user in state (auth state is managed by Firebase)
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error("User authenticated but no data found in database");
        await signOut(auth); // Sign out if no user data found
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
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

  // Auth context value
  const value = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
