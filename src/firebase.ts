import { initializeApp } from "firebase/app";
import {
  getDatabase,
  DatabaseReference,
  DataSnapshot,
  onValue,
  off,
  push,
  remove,
  update,
} from "firebase/database";
import { ref, set, get, child } from "firebase/database";

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
  apiKey:
    process.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyA1u11U5ODyVxmzA48ZPjlkIahRfMDbzgE",
  authDomain:
    process.env.VITE_FIREBASE_AUTH_DOMAIN || "smartlab-52f5d.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "smartlab-52f5d",
  storageBucket:
    process.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "smartlab-52f5d.firebasestorage.app",
  messagingSenderId:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "35482993071",
  appId:
    process.env.VITE_FIREBASE_APP_ID ||
    "1:35482993071:web:843b67b98009c1ee4f2f5a",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NDSZKL3VDP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Database connection status monitoring
const connectedRef = ref(database, ".info/connected");
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log("Connected to Firebase Realtime Database");
  } else {
    console.log("Disconnected from Firebase Realtime Database");
  }
});

// Generic CRUD utility functions
export const createData = async <T>(path: string, data: T): Promise<string> => {
  try {
    const newRef = push(ref(database, path));
    await set(newRef, data);
    return newRef.key || "";
  } catch (error) {
    console.error(`Error creating data at ${path}:`, error);
    throw error;
  }
};

export const readData = async <T>(path: string): Promise<T | null> => {
  try {
    const snapshot = await get(ref(database, path));
    return snapshot.val();
  } catch (error) {
    console.error(`Error reading data from ${path}:`, error);
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

export const deleteData = async (path: string): Promise<void> => {
  try {
    await remove(ref(database, path));
  } catch (error) {
    console.error(`Error deleting data at ${path}:`, error);
    throw error;
  }
};

export const subscribeToData = <T>(
  path: string,
  callback: (data: T | null) => void
): (() => void) => {
  const dataRef = ref(database, path);
  onValue(dataRef, (snapshot) => {
    callback(snapshot.val());
  });
  return () => off(dataRef);
};

export { database, ref, set, get, child };
export type { DatabaseReference, DataSnapshot };
