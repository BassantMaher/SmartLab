import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateData } from '../../firebase';
import { AlertCircle, Upload } from 'lucide-react';

const CompleteProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        department: '',
        studentId: '',
        profileImage: '',
        role: user?.role || 'student', // Prepopulate with user.role from AuthContext
    });

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!formData.department || !formData.studentId || !formData.role) {
            setError('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        try {
            // Update user data in Firebase
            const updatedUserData = {
                id: user.id,
                email: user.email || '',
                name: user.name || user.email?.split('@')[0] || 'User',
                role: formData.role,
                createdAt: user.createdAt || new Date().toISOString(),
                provider: user.provider || 'google',
                department: formData.department,
                studentId: formData.studentId,
                profileImage: formData.profileImage || undefined, // Avoid saving empty string
            };

            await updateData(`users/${user.id}`, updatedUserData);

            // Redirect based on role
            navigate(formData.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        } catch (err: any) {
            console.error('Error updating profile:', err);
            const errorMessage = err?.message || 'Failed to update profile';
            if (errorMessage.includes('permission-denied')) {
                setError('You do not have permission to update your profile.');
            } else {
                setError('Failed to update profile. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#3B945E] bg-opacity-90">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-[#3B945E]">
                                Complete Your Profile
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Please provide additional information to complete your registration
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
                                    htmlFor="department"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Department
                                </label>
                                <input
                                    id="department"
                                    name="department"
                                    type="text"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                                    placeholder="Enter your department"
                                    required
                                />
                            </div>

                            <div className="mb-6">
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
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                                    placeholder="Enter your student ID"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label
                                    htmlFor="profileImage"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Profile Image URL (Optional)
                                </label>
                                <div className="flex items-center">
                                    <input
                                        id="profileImage"
                                        name="profileImage"
                                        type="text"
                                        value={formData.profileImage}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                                        placeholder="Enter image URL"
                                    />
                                    <Upload className="h-5 w-5 text-gray-400 ml-2" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#3B945E] hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E] transition-colors duration-150 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
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
                                        Saving...
                                    </span>
                                ) : (
                                    'Complete Profile'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfilePage;