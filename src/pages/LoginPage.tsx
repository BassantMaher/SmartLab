import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, AlertCircle } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role === "admin" ? "admin" : "student";
      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect is handled by the useEffect above
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      // Handle specific Firebase auth errors
      const errorMessage = err?.message || "An error occurred during login";
      if (
        errorMessage.includes("user-not-found") ||
        errorMessage.includes("wrong-password")
      ) {
        setError("Invalid email or password");
      } else if (errorMessage.includes("too-many-requests")) {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("An error occurred during login");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fill credentials and login for demo
  const fillCredentials = async (userType: "student" | "admin") => {
    setError("");
    let demoEmail = "";
    let demoPassword = "";

    if (userType === "student") {
      demoEmail = "student@student.com";
      demoPassword = "student123";
    } else {
      demoEmail = "admin@admin.smartlab.com";
      demoPassword = "admin123";
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3B945E] bg-opacity-90">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#3B945E]">Smart Lab</h1>
              <p className="text-gray-600 mt-2">
                Inventory & Monitoring System
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#3B945E] hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E] transition-colors duration-150 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-4">
              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setIsLoading(true);
                  try {
                    const success = await loginWithMicrosoft();
                    if (!success) {
                      setError("Failed to login with Microsoft");
                    }
                  } catch (err) {
                    console.error(err);
                    setError("An error occurred during Microsoft login");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.4 2H2V11.4H11.4V2Z" fill="#F25022"/>
                  <path d="M22 2H12.6V11.4H22V2Z" fill="#7FBA00"/>
                  <path d="M11.4 12.6H2V22H11.4V12.6Z" fill="#00A4EF"/>
                  <path d="M22 12.6H12.6V22H22V12.6Z" fill="#FFB900"/>
                </svg>
                Sign in with Microsoft
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
              <span>or</span>
            </div>

            <div className="mt-4">
              <p className="text-center text-sm text-gray-600">Demo Accounts</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => fillCredentials("student")}
                  className="py-2 px-4 border border-[#A8D5BA] rounded-lg text-sm font-medium text-[#3B945E] hover:bg-[#DFF5E1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E] transition-colors duration-150"
                >
                  Student Demo
                </button>
                <button
                  onClick={() => fillCredentials("admin")}
                  className="py-2 px-4 border border-[#A8D5BA] rounded-lg text-sm font-medium text-[#3B945E] hover:bg-[#DFF5E1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E] transition-colors duration-150"
                >
                  Admin Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
