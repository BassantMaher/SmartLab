import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../utils/types';
import { subscribeToData, updateData } from '../firebase';
import { formatDate } from '../utils/helpers';

const NotificationsPage: React.FC = () => {
  const handleNotificationClick = async (id: string) => {
    try {
      await updateData(`notifications/${id}`, { read: true });
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/admin/dashboard';
      return;
    }

    setIsLoading(true);

    // Subscribe to all notifications for admin
    const unsubscribeNotifications = subscribeToData<Record<string, Notification>>(
      'notifications',
      (data) => {
        if (data) {
          const allNotifications = Object.keys(data)
            .map((key) => ({
              ...data[key],
              id: key,
            }))
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

          setNotifications(allNotifications);
        } else {
          setNotifications([]);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeNotifications();
    };
  }, [user]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800';
      case 'error':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-blue-50 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B945E]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-600 mt-1">
          Stay updated with your lab activities and requests
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg cursor-pointer relative transition-all duration-300 ease-in-out ${getNotificationColor(
                notification.type
              )} ${!notification.read ? 'border-l-4 border-current' : 'opacity-75'}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="flex items-start">
                {notification.read && (
                  <div className="absolute top-4 right-4 text-green-600 bg-white bg-opacity-75 rounded-full p-1 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="flex-shrink-0">
                  <span className="text-xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium">{notification.title}</h3>
                  <p className="mt-1 text-sm">{notification.message}</p>
                  <p className="mt-1 text-xs opacity-75">
                    {formatDate(notification.date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;