// Type definitions for the application

// User types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'admin';
  department?: string;
  studentId?: string;
  profileImage?: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Environmental metrics types
export interface EnvironmentalMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
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
  location: string;
  image?: string;
  lastRestocked?: string;
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
  status: 'pending' | 'approved' | 'rejected' | 'returned';
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
  type: 'info' | 'success' | 'warning' | 'error';
}