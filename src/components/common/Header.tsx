import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications } from '../../utils/localStorage';
import { formatDate } from '../../utils/helpers';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Get user notifications
  const notifications = user 
    ? getUserNotifications(user.id).slice(0, 5)
    : [];
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close other dropdowns
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    // Close other dropdowns
    setIsProfileOpen(false);
  };

  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    // Close other dropdowns
    setIsNotificationsOpen(false);
  };

  // Get navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { title: 'Dashboard', path: '/admin/dashboard' },
        { title: 'Inventory', path: '/admin/inventory' },
        { title: 'Requests', path: '/admin/requests' },
        { title: 'Students', path: '/admin/students' },
        { title: 'Settings', path: '/admin/settings' }
      ];
    }

    return [
      { title: 'Dashboard', path: '/dashboard' },
      { title: 'Borrow', path: '/borrow-request' },
      { title: 'History', path: '/borrow-history' },
      { title: 'Profile', path: '/profile' }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-[#3B945E] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className="text-white font-bold text-xl"
              >
                SmartLab
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    location.pathname === link.path
                      ? "bg-[#74B49B] text-white"
                      : "text-white hover:bg-[#74B49B] hover:text-white"
                  } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150`}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center">
            {/* Notifications dropdown */}
            {user && (
              <div className="relative ml-3">
                <button
                  onClick={toggleNotifications}
                  className="flex items-center text-white hover:bg-[#74B49B] rounded-full p-1 focus:outline-none transition-colors duration-150"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-[10px] text-white text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown panel */}
                {isNotificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-2 px-4 bg-[#74B49B] text-white rounded-t-md flex justify-between items-center">
                      <h3 className="text-sm font-medium">Notifications</h3>
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="py-1 max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                              !notification.read ? "bg-[#DFF5E1]" : ""
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(notification.date)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                    <div className="py-1 bg-gray-50 rounded-b-md">
                      <Link
                        to="/notifications"
                        className="block px-4 py-2 text-xs text-center text-[#3B945E] hover:underline"
                        onClick={() => setIsNotificationsOpen(false)}
                      >
                        See all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile dropdown */}
            {user && (
              <div className="relative ml-3">
                <button
                  onClick={toggleProfile}
                  className="flex items-center text-white rounded-full focus:outline-none"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-[#74B49B] flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="h-8 w-8 object-cover"
                      />
                    ) : (
                      <UserIcon size={16} className="text-white" />
                    )}
                  </div>
                  <span className="ml-2 text-white text-sm">{user.name}</span>
                  <ChevronDown size={16} className="ml-1 text-white" />
                </button>

                {/* Profile dropdown panel */}
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-500">{user.role}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to={user.role === "admin" ? "/admin/profile" : "/profile"}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {user && (
              <button
                onClick={toggleNotifications}
                className="flex items-center text-white hover:bg-[#74B49B] rounded-full p-1 focus:outline-none mr-2 transition-colors duration-150"
              >
                <span className="sr-only">View notifications</span>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-14 block h-4 w-4 rounded-full bg-red-500 text-[10px] text-white text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#74B49B] focus:outline-none transition-colors duration-150"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${
                location.pathname === link.path
                  ? "bg-[#74B49B] text-white"
                  : "text-white hover:bg-[#74B49B] hover:text-white"
              } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* Mobile profile section */}
        {user && (
          <div className="pt-4 pb-3 border-t border-[#74B49B]">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#74B49B] flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="h-10 w-10 object-cover"
                  />
                ) : (
                  <UserIcon size={20} className="text-white" />
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  {user.name}
                </div>
                <div className="text-sm font-medium text-[#DFF5E1]">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                to={user.role === "admin" ? "/admin/profile" : "/profile"}
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#74B49B] transition-colors duration-150"
                onClick={() => setIsMenuOpen(false)}
              >
                Your Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#74B49B] transition-colors duration-150"
              >
                <div className="flex items-center">
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Mobile Dropdown */}
      {isNotificationsOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-16">
          <div className="bg-white w-full mx-4 rounded-md shadow-lg max-h-[80vh] flex flex-col">
            <div className="py-2 px-4 bg-[#74B49B] text-white rounded-t-md flex justify-between items-center">
              <h3 className="text-sm font-medium">Notifications</h3>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="py-1 overflow-y-auto flex-grow">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                      !notification.read ? "bg-[#DFF5E1]" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.date)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No notifications
                </div>
              )}
            </div>
            <div className="py-2 bg-gray-50 rounded-b-md">
              <Link
                to="/notifications"
                className="block px-4 py-2 text-xs text-center text-[#3B945E] hover:underline"
                onClick={() => setIsNotificationsOpen(false)}
              >
                See all notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;