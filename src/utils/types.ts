// Type definitions for the application

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional for OAuth providers
  role: string;
  department?: string;
  studentId?: string;
  profileImage?: string;
  totalRequests?: number;
  activeRequests?: number;
  createdAt: string;
  isVerifiedAdmin?: boolean;
  provider?: 'password' | 'google';
  googleId?: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
}

// Environmental metrics types
export interface EnvironmentalMetric {
  id: string;
  name: string;
  value: number | boolean;
  unit: string;
  status: "normal" | "warning" | "critical";
  timestamp: string;
  minValue: number;
  maxValue: number;
  icon: string;
}

// Inventory item types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  totalQuantity: number;
  availableQuantity: number;
  physicalQuantity: number;
  image?: string;
  specifications?: Record<string, string>;
}

// Borrow request types
export interface BorrowRequest {
  id: string;
  userId: string;
  userName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  requestDate: string;
  dueDate: string;
  status: "pending" | "approved" | "rejected" | "returned";
  approvedBy?: string;
  approvalDate?: string;
  returnDate?: string;
  purpose: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
  type: "info" | "success" | "warning" | "error";
}
