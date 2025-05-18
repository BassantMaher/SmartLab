import React, { createContext, useState, useEffect, useContext } from "react";
import { User, AuthContextType } from "../utils/types";
import { auth, readData, subscribeToData, googleProvider, createData } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  UserCredential
} from "firebase/auth";


// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  loginWithGoogle: async () => false,
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

  // Handle user data after successful authentication
  const handleAuthenticatedUser = async (userCredential: UserCredential, provider: 'password' | 'google'): Promise<boolean> => {
    const { uid, email, displayName } = userCredential.user;
    
    // Get existing user data or create new user
    let userData = await readData<User>(`users/${uid}`);
    
    if (!userData) {
      // Create new user data
      userData = {
        id: uid,
        name: displayName || email?.split('@')[0] || 'User',
        email: email || '',
        role: email?.endsWith('@admin.smartlab.com') ? 'admin' : 'student',
        createdAt: new Date().toISOString(),
        provider,
        ...(provider === 'google' && { googleId: uid })
      };
      await createData(`users/${uid}`, userData);
    }

    setUser(userData);
    setIsAuthenticated(true);
    return true;
  };

  // Login function using Firebase authentication
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Sign in with Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return handleAuthenticatedUser(userCredential, 'password');
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      return handleAuthenticatedUser(userCredential, 'google');
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

  // Auth context value
  const value = {
    user,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
