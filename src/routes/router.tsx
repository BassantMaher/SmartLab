import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/common/Layout";
import CompleteProfilePage from '../pages/student/CompleteProfilePage';

// Public pages
import LoginPage from "../pages/LoginPage";
import NotificationsPage from "../pages/NotificationsPage";

// Student pages
import DashboardPage from "../pages/student/DashboardPage";
import BorrowRequestPage from "../pages/student/BorrowRequestPage";
import BorrowFormPage from "../pages/student/BorrowFormPage";
import BorrowHistoryPage from "../pages/student/BorrowHistoryPage";
import ProfilePage from "../pages/student/ProfilePage";

// Admin pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminInventoryPage from "../pages/admin/AdminInventoryPage";
import AdminRequestsPage from "../pages/admin/AdminRequestsPage";
import AdminStudentsPage from "../pages/admin/AdminStudentsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import AdminCameraPage from "../pages/admin/AdminCameraPage";

// Protected routes wrapper components
const ProfileCompleteRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasCompletedProfile } = useAuth();
  if (!hasCompletedProfile) {
    return <Navigate to="/complete-profile" replace />;
  }
  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const StudentRoute: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "student") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
};

const AdminRoute: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

// Router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "complete-profile",
        element: (
          <ProtectedRoute>
            <CompleteProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <ProfileCompleteRoute>
              <StudentRoute />
            </ProfileCompleteRoute>
          </ProtectedRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "borrow-request",
            element: <BorrowRequestPage />,
          },
          {
            path: "borrow-request/:itemId",
            element: <BorrowFormPage />,
          },
          {
            path: "borrow-history",
            element: <BorrowHistoryPage />,
          },
          { path: "profile", element: <ProfilePage /> },
          { path: "notifications", element: <NotificationsPage /> },
        ],
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <ProfileCompleteRoute>
              <AdminRoute />
            </ProfileCompleteRoute>
          </ProtectedRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <AdminDashboardPage />,
          },
          {
            path: "inventory",
            element: <AdminInventoryPage />,
          },
          {
            path: "requests",
            element: <AdminRequestsPage />,
          },
          {
            path: "students",
            element: <AdminStudentsPage />,
          },
          {
            path: "settings",
            element: <AdminSettingsPage />,
          },
          {
            path: "camera",
            element: <AdminCameraPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "settings",
            element: <AdminSettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
