import { User, EnvironmentalMetric, InventoryItem, BorrowRequest, Notification } from './types';
import { Activity, AlertTriangle, Droplets, Eye, Sun, Thermometer, Wind } from 'lucide-react';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    email: 'student@student.com',
    password: 'student',
    name: 'John Student',
    role: 'student',
    department: 'Computer Science',
    studentId: 'CS2023001',
    profileImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '2',
    email: 'admin@admin.com',
    password: 'admin',
    name: 'Admin User',
    role: 'admin',
    profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

// Mock Environmental Metrics
export const getEnvironmentalMetrics = (): EnvironmentalMetric[] => {
  return [
    {
      id: '1',
      name: 'Temperature',
      value: 23.5,
      unit: '°C',
      status: 'normal',
      timestamp: new Date().toISOString(),
      minValue: 18,
      maxValue: 28,
      icon: 'Thermometer'
    },
    {
      id: '2',
      name: 'Humidity',
      value: 45,
      unit: '%',
      status: 'normal',
      timestamp: new Date().toISOString(),
      minValue: 30,
      maxValue: 60,
      icon: 'Droplets'
    },
    {
      id: '3',
      name: 'Air Quality',
      value: 75,
      unit: 'AQI',
      status: 'warning',
      timestamp: new Date().toISOString(),
      minValue: 0,
      maxValue: 100,
      icon: 'Wind'
    },
    {
      id: '4',
      name: 'Light Level',
      value: 350,
      unit: 'lux',
      status: 'normal',
      timestamp: new Date().toISOString(),
      minValue: 300,
      maxValue: 500,
      icon: 'Sun'
    },
    {
      id: '5',
      name: 'Noise Level',
      value: 62,
      unit: 'dB',
      status: 'warning',
      timestamp: new Date().toISOString(),
      minValue: 0,
      maxValue: 85,
      icon: 'Activity'
    },
    {
      id: '6',
      name: 'CO2 Level',
      value: 950,
      unit: 'ppm',
      status: 'critical',
      timestamp: new Date().toISOString(),
      minValue: 400,
      maxValue: 1000,
      icon: 'AlertTriangle'
    }
  ];
};

// Function to get icon component based on name
export const getMetricIcon = (iconName: string) => {
  switch (iconName) {
    case 'Thermometer':
      return Thermometer;
    case 'Droplets':
      return Droplets;
    case 'Wind':
      return Wind;
    case 'Sun':
      return Sun;
    case 'Activity':
      return Activity;
    case 'AlertTriangle':
      return AlertTriangle;
    default:
      return Eye;
  }
};

// Mock Inventory Items
export const inventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Arduino Uno',
    category: 'Electronics',
    description: 'Arduino Uno R3 microcontroller board based on the ATmega328P.',
    totalQuantity: 25,
    availableQuantity: 15,
    location: 'Cabinet A, Shelf 2',
    image: 'https://images.pexels.com/photos/132700/pexels-photo-132700.jpeg?auto=compress&cs=tinysrgb&w=300',
    lastRestocked: '2023-09-15',
    specifications: {
      'Microcontroller': 'ATmega328P',
      'Operating Voltage': '5V',
      'Digital I/O Pins': '14'
    }
  },
  {
    id: '2',
    name: 'Raspberry Pi 4',
    category: 'Electronics',
    description: 'Raspberry Pi 4 Model B with 4GB RAM.',
    totalQuantity: 15,
    availableQuantity: 5,
    location: 'Cabinet A, Shelf 3',
    image: 'https://images.pexels.com/photos/4219655/pexels-photo-4219655.jpeg?auto=compress&cs=tinysrgb&w=300',
    lastRestocked: '2023-10-20',
    specifications: {
      'Processor': 'Broadcom BCM2711',
      'RAM': '4GB',
      'USB Ports': '4'
    }
  },
  {
    id: '3',
    name: 'Digital Multimeter',
    category: 'Test Equipment',
    description: 'Digital multimeter for measuring voltage, current, and resistance.',
    totalQuantity: 20,
    availableQuantity: 12,
    location: 'Cabinet B, Shelf 1',
    image: 'https://images.pexels.com/photos/6489667/pexels-photo-6489667.jpeg?auto=compress&cs=tinysrgb&w=300',
    lastRestocked: '2023-08-05'
  },
  {
    id: '4',
    name: 'Breadboard Kit',
    category: 'Electronics',
    description: 'Breadboard with jumper wires for prototyping.',
    totalQuantity: 30,
    availableQuantity: 22,
    location: 'Cabinet B, Shelf 2',
    image: 'https://images.pexels.com/photos/12714793/pexels-photo-12714793.jpeg?auto=compress&cs=tinysrgb&w=300',
    lastRestocked: '2023-11-10'
  },
  {
    id: '5',
    name: 'Oscilloscope',
    category: 'Test Equipment',
    description: 'Digital oscilloscope for visualizing electronic signals.',
    totalQuantity: 10,
    availableQuantity: 3,
    location: 'Cabinet C, Shelf 1',
    image: 'https://images.pexels.com/photos/7103/pexels-photo-7103.jpeg?auto=compress&cs=tinysrgb&w=300',
    lastRestocked: '2023-07-20',
    specifications: {
      'Bandwidth': '100MHz',
      'Channels': '2',
      'Sample Rate': '1GS/s'
    }
  },
  {
    id: '6',
    name: 'Soldering Station',
    category: 'Tools',
    description: 'Temperature-controlled soldering station for electronics work.',
    totalQuantity: 8,
    availableQuantity: 4,
    location: 'Cabinet C, Shelf 2',
    image: 'https://images.pexels.com/photos/6332241/pexels-photo-6332241.jpeg?auto=compress&cs=tinysrgb&w=300',
    lastRestocked: '2023-09-01'
  }
];

// Mock Borrow Requests
export const borrowRequests: BorrowRequest[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Student',
    itemId: '1',
    itemName: 'Arduino Uno',
    quantity: 2,
    requestDate: '2023-11-01T09:30:00Z',
    dueDate: '2023-11-08T17:00:00Z',
    status: 'approved',
    approvedBy: 'Admin User',
    approvalDate: '2023-11-01T14:20:00Z',
    purpose: 'Final year project on IoT'
  },
  {
    id: '2',
    userId: '1',
    userName: 'John Student',
    itemId: '2',
    itemName: 'Raspberry Pi 4',
    quantity: 1,
    requestDate: '2023-11-05T10:15:00Z',
    dueDate: '2023-11-12T17:00:00Z',
    status: 'pending',
    purpose: 'Machine learning project'
  },
  {
    id: '3',
    userId: '1',
    userName: 'John Student',
    itemId: '3',
    itemName: 'Digital Multimeter',
    quantity: 1,
    requestDate: '2023-10-20T13:45:00Z',
    dueDate: '2023-10-27T17:00:00Z',
    status: 'returned',
    approvedBy: 'Admin User',
    approvalDate: '2023-10-20T15:30:00Z',
    returnDate: '2023-10-27T16:20:00Z',
    purpose: 'Circuit testing for lab assignment'
  }
];

// Mock Notifications
export const notifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Borrow Request Approved',
    message: 'Your request to borrow 2 Arduino Uno has been approved.',
    read: false,
    date: '2023-11-01T14:20:00Z',
    type: 'success'
  },
  {
    id: '2',
    userId: '1',
    title: 'Item Due Soon',
    message: 'Arduino Uno is due for return in 2 days.',
    read: true,
    date: '2023-11-06T09:00:00Z',
    type: 'warning'
  },
  {
    id: '3',
    userId: '2',
    title: 'New Borrow Request',
    message: 'John Student has requested to borrow Raspberry Pi 4.',
    read: false,
    date: '2023-11-05T10:15:00Z',
    type: 'info'
  },
  {
    id: '4',
    userId: '2',
    title: 'Air Quality Alert',
    message: 'Lab air quality is below optimal levels.',
    read: false,
    date: '2023-11-07T08:30:00Z',
    type: 'error'
  }
];

// Initialize localStorage with mock data if not already present
export const initializeLocalStorage = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  if (!localStorage.getItem('environmentalMetrics')) {
    localStorage.setItem('environmentalMetrics', JSON.stringify(getEnvironmentalMetrics()));
  }
  
  if (!localStorage.getItem('inventoryItems')) {
    localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
  }
  
  if (!localStorage.getItem('borrowRequests')) {
    localStorage.setItem('borrowRequests', JSON.stringify(borrowRequests));
  }
  
  if (!localStorage.getItem('notifications')) {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }
};