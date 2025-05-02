import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToData, updateData } from "../../firebase";
import { User, BorrowRequest } from "../../utils/types";
import Loading from "../../components/common/Loading";
import { Camera, Mail, User as UserIcon, Check } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<User>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Stats
  const [totalRequests, setTotalRequests] = useState(0);
  const [approvedRequests, setApprovedRequests] = useState(0);
  const [returnedItems, setReturnedItems] = useState(0);

  useEffect(() => {
    if (user) {
      // Subscribe to user profile updates
      const unsubscribeProfile = subscribeToData<User>(
        `users/${user.id}`,
        (userData) => {
          if (userData) {
            setProfileData({
              name: userData.name,
              email: userData.email,
              department: userData.department || "",
              studentId: userData.studentId || "",
              profileImage: userData.profileImage,
            });
          }
        }
      );

      // Subscribe to borrow requests
      const unsubscribeRequests = subscribeToData<
        Record<string, BorrowRequest>
      >("borrowRequests", (data) => {
        if (data) {
          const userRequests = Object.values(data).filter(
            (req) => req.userId === user.id
          );
          setTotalRequests(userRequests.length);
          setApprovedRequests(
            userRequests.filter((req) => req.status === "approved").length
          );
          setReturnedItems(
            userRequests.filter((req) => req.status === "returned").length
          );
        } else {
          setTotalRequests(0);
          setApprovedRequests(0);
          setReturnedItems(0);
        }
        setIsLoading(false);
      });

      return () => {
        unsubscribeProfile();
        unsubscribeRequests();
      };
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Update user profile in Firebase
      await updateData(`users/${user.id}`, {
        ...user,
        ...profileData,
      });

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSuccessMessage("Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#3B945E] to-[#74B49B] h-32"></div>
            <div className="px-6 pb-6">
              <div className="relative -mt-16 mb-4 flex justify-center">
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white bg-white">
                  {profileData.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#DFF5E1]">
                      <UserIcon size={40} className="text-[#3B945E]" />
                    </div>
                  )}

                  <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md">
                    <div className="p-1 rounded-full bg-[#3B945E] text-white">
                      <Camera size={14} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {profileData.name}
                </h2>
                <p className="text-sm text-gray-500 flex items-center justify-center">
                  <Mail size={14} className="mr-1" />
                  {profileData.email}
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-[#DFF5E1] text-[#3B945E] text-xs font-medium rounded-full">
                  Student
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Activity Overview
                </h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Total Requests</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {totalRequests}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Active Borrows</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {approvedRequests}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Returned Items</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {returnedItems}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Account Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 border border-[#3B945E] text-[#3B945E] text-sm font-medium rounded-lg hover:bg-[#DFF5E1] focus:outline-none focus:ring-2 focus:ring-[#3B945E] transition-colors duration-150"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {successMessage && (
              <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg text-sm flex items-center">
                <Check size={16} className="mr-2" />
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profileData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={profileData.department}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="studentId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={profileData.studentId}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank to keep current password
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#3B945E] hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Notification Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    Request Status Updates
                  </h3>
                  <p className="text-xs text-gray-500">
                    Notifications when your requests are approved or rejected
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    Return Reminders
                  </h3>
                  <p className="text-xs text-gray-500">
                    Reminders when borrowed items are due for return
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    New Equipment Alerts
                  </h3>
                  <p className="text-xs text-gray-500">
                    Notifications when new equipment is added to inventory
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    Email Notifications
                  </h3>
                  <p className="text-xs text-gray-500">
                    Receive email notifications in addition to in-app
                    notifications
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF5E1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B945E]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
