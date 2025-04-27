// Helper functions for the application

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format date string to readable format
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format date without time
export const formatDateOnly = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Get status color class based on status
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'normal':
    case 'approved':
    case 'returned':
    case 'success':
      return 'bg-green-500';
    case 'warning':
    case 'pending':
      return 'bg-yellow-500';
    case 'critical':
    case 'rejected':
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Get status text color class based on status
export const getStatusTextColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'normal':
    case 'approved':
    case 'returned':
    case 'success':
      return 'text-green-700';
    case 'warning':
    case 'pending':
      return 'text-yellow-700';
    case 'critical':
    case 'rejected':
    case 'error':
      return 'text-red-700';
    default:
      return 'text-gray-700';
  }
};

// Get status background color class based on status
export const getStatusBgColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'normal':
    case 'approved':
    case 'returned':
    case 'success':
      return 'bg-green-100';
    case 'warning':
    case 'pending':
      return 'bg-yellow-100';
    case 'critical':
    case 'rejected':
    case 'error':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

// Calculate days remaining until due date
export const getDaysRemaining = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Truncate text if longer than maxLength
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};