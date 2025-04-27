import React, { useState } from 'react';
import { Bell, Mail, Shield, Users, Server, Database, RefreshCw } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [notificationEmail, setNotificationEmail] = useState('admin@admin.com');
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  const [autoApproveRequests, setAutoApproveRequests] = useState(false);
  const [defaultBorrowDays, setDefaultBorrowDays] = useState(7);
  const [requirePurpose, setRequirePurpose] = useState(true);
  const [sendEmailNotifications, setSendEmailNotifications] = useState(true);
  const [allowStudentRegistration, setAllowStudentRegistration] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate saving to API/database
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure the lab inventory and monitoring system</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-4 bg-[#3B945E] text-white">
              <h2 className="font-medium">Settings</h2>
            </div>
            <div className="p-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                  activeTab === 'general' 
                    ? 'bg-[#DFF5E1] text-[#3B945E]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Server size={18} className="mr-3" />
                General Settings
              </button>
              
              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                  activeTab === 'inventory' 
                    ? 'bg-[#DFF5E1] text-[#3B945E]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Database size={18} className="mr-3" />
                Inventory Settings
              </button>
              
              <button
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                  activeTab === 'requests' 
                    ? 'bg-[#DFF5E1] text-[#3B945E]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <RefreshCw size={18} className="mr-3" />
                Request Settings
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                  activeTab === 'notifications' 
                    ? 'bg-[#DFF5E1] text-[#3B945E]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bell size={18} className="mr-3" />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                  activeTab === 'security' 
                    ? 'bg-[#DFF5E1] text-[#3B945E]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Shield size={18} className="mr-3" />
                Security
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${
                  activeTab === 'users' 
                    ? 'bg-[#DFF5E1] text-[#3B945E]' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users size={18} className="mr-3" />
                User Management
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-md p-6">
            {saveSuccess && (
              <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Settings saved successfully!
              </div>
            )}
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">General Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="systemName" className="block text-sm font-medium text-gray-700 mb-1">
                      System Name
                    </label>
                    <input
                      id="systemName"
                      type="text"
                      defaultValue="Smart Lab Inventory & Monitoring System"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Email
                    </label>
                    <input
                      id="adminEmail"
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This email will receive all system notifications
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">System Timezone</h3>
                      <p className="text-xs text-gray-500">Set the timezone for all dates and times</p>
                    </div>
                    <select className="block w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent">
                      <option>UTC (GMT+0)</option>
                      <option>America/New_York (GMT-5)</option>
                      <option>Europe/London (GMT+0)</option>
                      <option>Asia/Tokyo (GMT+9)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Send Email Notifications</h3>
                      <p className="text-xs text-gray-500">Enable email notifications for system events</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={sendEmailNotifications}
                        onChange={() => setSendEmailNotifications(!sendEmailNotifications)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                </div>
              </>
            )}
            
            {/* Inventory Settings */}
            {activeTab === 'inventory' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Inventory Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold (%)
                    </label>
                    <input
                      id="lowStockThreshold"
                      type="number"
                      min="1"
                      max="100"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Items below this percentage of availability will be marked as low stock
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Auto-restock Notifications</h3>
                      <p className="text-xs text-gray-500">Send notifications when items are low in stock</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Track Item History</h3>
                      <p className="text-xs text-gray-500">Maintain a log of all changes to inventory items</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                </div>
              </>
            )}
            
            {/* Request Settings */}
            {activeTab === 'requests' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Request Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="defaultBorrowDays" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Borrow Duration (days)
                    </label>
                    <input
                      id="defaultBorrowDays"
                      type="number"
                      min="1"
                      max="30"
                      value={defaultBorrowDays}
                      onChange={(e) => setDefaultBorrowDays(parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Auto-approve Requests</h3>
                      <p className="text-xs text-gray-500">Automatically approve borrowing requests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={autoApproveRequests}
                        onChange={() => setAutoApproveRequests(!autoApproveRequests)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Require Purpose</h3>
                      <p className="text-xs text-gray-500">Require students to provide a purpose for each request</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={requirePurpose}
                        onChange={() => setRequirePurpose(!requirePurpose)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Send Due Date Reminders</h3>
                      <p className="text-xs text-gray-500">Send reminders when items are due for return</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                </div>
              </>
            )}
            
            {/* Notifications */}
            {activeTab === 'notifications' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Notification Email
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <Mail size={16} />
                      </span>
                      <input
                        id="notificationEmail"
                        type="email"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        className="block w-full rounded-none rounded-r-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Email address for system notifications
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-800 mb-4">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">New Borrow Requests</h4>
                          <p className="text-xs text-gray-500">Notify when a student submits a new request</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Low Stock Alerts</h4>
                          <p className="text-xs text-gray-500">Notify when an item falls below the low stock threshold</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Environmental Alerts</h4>
                          <p className="text-xs text-gray-500">Notify when environmental metrics reach warning or critical levels</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Overdue Returns</h4>
                          <p className="text-xs text-gray-500">Notify when borrowed items are not returned by the due date</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Security */}
            {activeTab === 'security' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Two-Factor Authentication</h3>
                      <p className="text-xs text-gray-500">Require two-factor authentication for admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Force Password Reset</h3>
                      <p className="text-xs text-gray-500">Require password reset every 90 days</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Session Timeout</h3>
                      <p className="text-xs text-gray-500">Automatically log out inactive users after 30 minutes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor="passwordPolicy" className="block text-sm font-medium text-gray-700 mb-1">
                      Password Policy
                    </label>
                    <select
                      id="passwordPolicy"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                    >
                      <option>Basic - Minimum 8 characters</option>
                      <option>Standard - 8 chars, 1 uppercase, 1 number</option>
                      <option>Strong - 10 chars, upper, lower, number, symbol</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            
            {/* User Management */}
            {activeTab === 'users' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">User Management Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Student Self-Registration</h3>
                      <p className="text-xs text-gray-500">Allow students to create their own accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={allowStudentRegistration}
                        onChange={() => setAllowStudentRegistration(!allowStudentRegistration)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Admin Approval Required</h3>
                      <p className="text-xs text-gray-500">Require admin approval for new student accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                    </label>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-800 mb-4">Required Student Information</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input id="req-name" type="checkbox" className="h-4 w-4 text-[#3B945E] focus:ring-[#3B945E] border-gray-300 rounded" checked disabled />
                        <label htmlFor="req-name" className="ml-2 block text-sm text-gray-700">Full Name</label>
                      </div>
                      <div className="flex items-center">
                        <input id="req-email" type="checkbox" className="h-4 w-4 text-[#3B945E] focus:ring-[#3B945E] border-gray-300 rounded" checked disabled />
                        <label htmlFor="req-email" className="ml-2 block text-sm text-gray-700">Email Address</label>
                      </div>
                      <div className="flex items-center">
                        <input id="req-student-id" type="checkbox" className="h-4 w-4 text-[#3B945E] focus:ring-[#3B945E] border-gray-300 rounded" checked />
                        <label htmlFor="req-student-id" className="ml-2 block text-sm text-gray-700">Student ID</label>
                      </div>
                      <div className="flex items-center">
                        <input id="req-department" type="checkbox" className="h-4 w-4 text-[#3B945E] focus:ring-[#3B945E] border-gray-300 rounded" checked />
                        <label htmlFor="req-department" className="ml-2 block text-sm text-gray-700">Department</label>
                      </div>
                      <div className="flex items-center">
                        <input id="req-phone" type="checkbox" className="h-4 w-4 text-[#3B945E] focus:ring-[#3B945E] border-gray-300 rounded" />
                        <label htmlFor="req-phone" className="ml-2 block text-sm text-gray-700">Phone Number</label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Save button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E]"
                >
                  Reset to Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#3B945E] hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E] ${
                    isSaving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;