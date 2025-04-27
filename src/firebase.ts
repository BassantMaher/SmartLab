// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

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
  measurementId: "G-NDSZKL3VDP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db: Firestore = getFirestore(app);

export { db };
