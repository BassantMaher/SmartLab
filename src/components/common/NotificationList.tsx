import React from 'react';
import { Link } from 'react-router-dom';
import { Notification } from '../../utils/types';
import { formatDate } from '../../utils/helpers';
import { markNotificationAsRead } from '../../utils/localStorage';
import { updateData } from '../../firebase';

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
  isAdmin?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onClose,
  isAdmin = false,
}) => {
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

  const handleNotificationClick = async (id: string) => {
    try {
      // Update read status in Firebase
      await updateData(`notifications/${id}`, { read: true });
      // Also update in local storage for immediate UI feedback
      markNotificationAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50">
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <Link
            to={isAdmin ? "/admin/notifications" : "/notifications"}
            className="text-xs text-[#3B945E] hover:text-[#2D7548] font-medium"
            onClick={onClose}
          >
            See All
          </Link>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No new notifications
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer relative transition-all duration-300 ease-in-out ${!notification.read ? 'bg-gray-50' : 'opacity-75'}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start">
                  {notification.read && (
                    <div className="absolute top-2 right-2 text-green-500 bg-green-50 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;