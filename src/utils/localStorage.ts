import { User, EnvironmentalMetric, InventoryItem, BorrowRequest, Notification } from './types';

// Helper functions to work with localStorage

// Get data from localStorage
export const getLocalStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Set data to localStorage
export const setLocalStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Users
export const getUsers = (): User[] => getLocalStorage<User>('users');
export const setUsers = (users: User[]): void => setLocalStorage('users', users);
export const getUserById = (id: string): User | undefined => {
  return getUsers().find(user => user.id === id);
};

// Environmental Metrics
export const getEnvironmentalMetrics = (): EnvironmentalMetric[] => 
  getLocalStorage<EnvironmentalMetric>('environmentalMetrics');
export const setEnvironmentalMetrics = (metrics: EnvironmentalMetric[]): void => 
  setLocalStorage('environmentalMetrics', metrics);
export const updateEnvironmentalMetric = (updatedMetric: EnvironmentalMetric): void => {
  const metrics = getEnvironmentalMetrics();
  const index = metrics.findIndex(metric => metric.id === updatedMetric.id);
  if (index !== -1) {
    metrics[index] = updatedMetric;
    setEnvironmentalMetrics(metrics);
  }
};

// Inventory Items
export const getInventoryItems = (): InventoryItem[] => 
  getLocalStorage<InventoryItem>('inventoryItems');
export const setInventoryItems = (items: InventoryItem[]): void => 
  setLocalStorage('inventoryItems', items);
export const getInventoryItemById = (id: string): InventoryItem | undefined => {
  return getInventoryItems().find(item => item.id === id);
};
export const updateInventoryItem = (updatedItem: InventoryItem): void => {
  const items = getInventoryItems();
  const index = items.findIndex(item => item.id === updatedItem.id);
  if (index !== -1) {
    items[index] = updatedItem;
    setInventoryItems(items);
  }
};

// Borrow Requests
export const getBorrowRequests = (): BorrowRequest[] => 
  getLocalStorage<BorrowRequest>('borrowRequests');
export const setBorrowRequests = (requests: BorrowRequest[]): void => 
  setLocalStorage('borrowRequests', requests);
export const getBorrowRequestById = (id: string): BorrowRequest | undefined => {
  return getBorrowRequests().find(request => request.id === id);
};
export const getUserBorrowRequests = (userId: string): BorrowRequest[] => {
  return getBorrowRequests().filter(request => request.userId === userId);
};
export const addBorrowRequest = (request: BorrowRequest): void => {
  const requests = getBorrowRequests();
  requests.push(request);
  setBorrowRequests(requests);
};
export const updateBorrowRequest = (updatedRequest: BorrowRequest): void => {
  const requests = getBorrowRequests();
  const index = requests.findIndex(request => request.id === updatedRequest.id);
  if (index !== -1) {
    requests[index] = updatedRequest;
    setBorrowRequests(requests);
  }
};

// Notifications
export const getNotifications = (): Notification[] => 
  getLocalStorage<Notification>('notifications');
export const setNotifications = (notifications: Notification[]): void => 
  setLocalStorage('notifications', notifications);
export const getUserNotifications = (userId: string): Notification[] => {
  return getNotifications().filter(notification => notification.userId === userId);
};
export const addNotification = (notification: Notification): void => {
  const notifications = getNotifications();
  notifications.push(notification);
  setNotifications(notifications);
};
export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(notification => notification.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    setNotifications(notifications);
  }
};