import { initializeApp } from "firebase/app";
import {
  getDatabase,
  DatabaseReference,
  DataSnapshot,
  onValue,
  push,
  off,
  update,
  ref,
  set,
  get,
  child,
} from "firebase/database";
import { getAuth } from "firebase/auth";

// Type for Firebase configuration
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyA1u11U5ODyVxmzA48ZPjlkIahRfMDbzgE",
  authDomain: "smartlab-52f5d.firebaseapp.com",
  projectId: "smartlab-52f5d",
  storageBucket: "smartlab-52f5d.firebasestorage.app",
  messagingSenderId: "35482993071",
  appId: "1:35482993071:web:843b67b98009c1ee4f2f5a",
  measurementId: "G-NDSZKL3VDP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

const auth = getAuth(app);

// Database connection status monitoring
const connectedRef = ref(database, ".info/connected");
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log("Connected to Firebase Realtime Database");
  } else {
    console.log("Disconnected from Firebase Realtime Database");
  }
});

// Function to initialize the database with the schema
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Define the initial database schema based on provided types
    const initialData = {
      users: {},
      environmentalMetrics: {},
      inventoryItems: {},
      borrowRequests: {},
      notifications: {},
    };

    // Check if the root path has data
    const rootRef = ref(database, "/");
    const snapshot = await get(rootRef);

    if (!snapshot.exists()) {
      // If no data exists, set the initial structure
      await set(rootRef, initialData);
      console.log("Database initialized with schema");
    } else {
      console.log("Database already initialized");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};
// Generate a unique ID for new items
export const generateId = (path: string): string => {
  const newRef = push(ref(database, path));
  return newRef.key!;
};

// Generic CRUD utility functions

export const readData = async <T>(path: string): Promise<T | null> => {
  try {
    const snapshot = await get(ref(database, path));
    return snapshot.val();
  } catch (error) {
    console.error(`Error reading data from ${path}:`, error);
    throw error;
  }
};
export const deleteData = async (path: string): Promise<void> => {
  try {
    await set(ref(database, path), null);
    console.log(`Data deleted at ${path}`);
  } catch (error) {
    console.error(`Error deleting data at ${path}:`, error);
    throw error;
  }
};

export const updateData = async <T>(
  path: string,
  data: Partial<T>
): Promise<void> => {
  try {
    await update(ref(database, path), data);
  } catch (error) {
    console.error(`Error updating data at ${path}:`, error);
    throw error;
  }
};

export const subscribeToData = <T>(
  path: string,
  callback: (data: T | null) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const dataRef = ref(database, path);
  const onDataChange = (snapshot: DataSnapshot) => {
    const data = snapshot.val() as T | null;
    console.log(`Subscribed data from ${path}:`, data);
    callback(data);
  };
  onValue(dataRef, onDataChange, (error) => {
    console.error(`Error subscribing to ${path}:`, error);
    if (onError) {
      onError(error);
    }
  });
  return () => off(dataRef, 'value', onDataChange);
};

export const createData = async <T>(path: string, data: T): Promise<void> => {
  try {
    await set(ref(database, path), data);
    console.log(`Data set at ${path}:`, data);
  } catch (error) {
    console.error(`Error setting data at ${path}:`, error);
    throw error;
  }
};

export { database, ref, set, get, child, auth };
export type { DatabaseReference, DataSnapshot };
