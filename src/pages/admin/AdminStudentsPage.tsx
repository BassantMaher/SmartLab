import React, { useState, useEffect } from 'react';
import { Plus, User as UserIcon, Search, ArrowUpDown, X } from 'lucide-react';
import SearchFilter from '../../components/common/SearchFilter';
import Loading from '../../components/common/Loading';
import { subscribeToData, readData, createData, deleteData, auth } from '../../firebase';
import { User, BorrowRequest } from '../../utils/types';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load students and their request stats
  useEffect(() => {
    const unsubscribe = subscribeToData<Record<string, any>>(
      'users',
      async (data) => {
        try {
          console.log('Raw users data:', data);
          if (data) {
            // Flatten nested user objects
            const allUsers = Object.values(data).flatMap((userObj) => {
              if (typeof userObj === 'object' && !userObj.role) {
                return Object.values(userObj);
              }
              return userObj;
            });
            console.log('Flattened users:', allUsers);

            // Filter for students
            const studentUsers = allUsers.filter((user) => user.role === 'student');
            console.log('Filtered student users:', studentUsers);

            // Get request stats for each student
            const studentsWithStats = await Promise.all(
              studentUsers.map(async (student) => {
                const requests = await readData<Record<string, BorrowRequest>>(
                  `borrowRequests`
                );
                console.log(`Borrow requests for ${student.id}:`, requests);
                const userRequests = requests
                  ? Object.values(requests).filter((req) => req.userId === student.id)
                  : [];
                const activeRequests = userRequests.filter(
                  (req) => req.status === 'approved'
                ).length;

                return {
                  ...student,
                  totalRequests: userRequests.length,
                  activeRequests,
                };
              })
            );
            console.log('Students with stats:', studentsWithStats);

            // Sort initially by name
            const sortedStudents = [...studentsWithStats].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
            console.log('Sorted students:', sortedStudents);

            setStudents(sortedStudents);
            setFilteredStudents(sortedStudents);
          } else {
            console.log('No users data received');
            setStudents([]);
            setFilteredStudents([]);
          }
          setIsLoading(false);
        } catch (err: any) {
          console.error('Error loading students:', err);
          setError(`Failed to load students: ${err.message || 'Unknown error'}`);
          setIsLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle search and sort
  useEffect(() => {
    let filtered = [...students];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.department &&
            student.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.studentId &&
            student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sort
    filtered = filtered.sort((a: User, b: User) => {
      const valueA = a[sortBy as keyof User];
      const valueB = b[sortBy as keyof User];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      return 0;
    });

    setFilteredStudents(filtered);
  }, [searchTerm, sortBy, sortDirection, students]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Handle view student
  const handleViewStudent = (student: User) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  // Handle remove student
  const handleRemoveStudent = (student: User) => {
    setStudentToDelete(student);
    setIsConfirmDeleteOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      // Delete user data from Realtime Database
      await deleteData(`users/${studentToDelete.id}`);
      console.log(`Student data ${studentToDelete.id} deleted from database`);

      // Note: Cannot delete Firebase Authentication user client-side without being signed in as that user.
      // Admin must manually delete the user from Firebase Console (Authentication > Users).

      // Remove from local state
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setFilteredStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      console.log(`Student ${studentToDelete.id} removed from UI`);
      setIsConfirmDeleteOpen(false);
      setStudentToDelete(null);
    } catch (err: any) {
      console.error('Error deleting student:', err);
      setError(`Failed to delete student: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
          <p className="text-gray-600 mt-1">Manage student accounts and permissions</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#3B945E] text-white rounded-lg shadow-sm hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-[#3B945E] transition-colors duration-150"
          >
            <div className="flex items-center">
              <Plus size={16} className="mr-1" />
              Add Student
            </div>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <SearchFilter onSearch={handleSearch} placeholder="Search students..." />
      </div>

      {/* Students list */}
      {filteredStudents.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Student
                      {sortBy === 'name' && (
                        <ArrowUpDown size={14} className="ml-1 text-[#3B945E]" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center">
                      Department
                      {sortBy === 'department' && (
                        <ArrowUpDown size={14} className="ml-1 text-[#3B945E]" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('studentId')}
                  >
                    <div className="flex items-center">
                      Student ID
                      {sortBy === 'studentId' && (
                        <ArrowUpDown size={14} className="ml-1 text-[#3B945E]" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalRequests')}
                  >
                    <div className="flex items-center">
                      Requests
                      {sortBy === 'totalRequests' && (
                        <ArrowUpDown size={14} className="ml-1 text-[#3B945E]" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('activeRequests')}
                  >
                    <div className="flex items-center">
                      Active Borrows
                      {sortBy === 'activeRequests' && (
                        <ArrowUpDown size={14} className="ml-1 text-[#3B945E]" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {student.profileImage ? (
                            <img
                              src={student.profileImage}
                              alt={student.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#DFF5E1] flex items-center justify-center">
                              <UserIcon size={16} className="text-[#3B945E]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.studentId || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.totalRequests}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.activeRequests > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DFF5E1] text-[#3B945E]">
                            {student.activeRequests} items
                          </span>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="text-[#3B945E] hover:text-[#74B49B] mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveStudent(student)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isDeleting}
                      >
                        {isDeleting && studentToDelete?.id === student.id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center bg-[#DFF5E1] p-3 rounded-full mb-4">
            <Search className="h-8 w-8 text-[#3B945E]" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Students Found</h3>
          <p className="text-gray-600">
            No students match your search criteria. Try adjusting your search term.
          </p>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && <AddStudentModal onClose={() => setIsAddModalOpen(false)} />}

      {/* View Student Modal */}
      {isViewModalOpen && selectedStudent && (
        <ViewStudentModal student={selectedStudent} onClose={() => setIsViewModalOpen(false)} />
      )}

      {/* Confirm Delete Modal */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium">{studentToDelete?.name}</span>? This will remove their
              data from the database. To fully delete their account, remove them from Firebase
              Authentication in the Firebase Console.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsConfirmDeleteOpen(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Component for Adding Students
const AddStudentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState<Omit<User, 'id' | 'role'>>(
    {
      name: '',
      email: '',
      department: '',
      studentId: '',
      profileImage: '',
    }
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    // Validation
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields (Name, Email).');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      console.log('Auth instance:', auth);
      console.log('Creating user with:', {
        email: formData.email,
        password: '****',
        name: formData.name,
      });

      // Create Firebase Authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password);
      const userId = userCredential.user.uid;

      // Save user data to Realtime Database
      const newUser: User = {
        id: userId,
        name: formData.name,
        email: formData.email,
        role: 'student',
        department: formData.department || undefined,
        studentId: formData.studentId || undefined,
        profileImage: formData.profileImage || undefined,
      };

      await createData(`users/${userId}`, newUser);
      console.log('Student added successfully with ID:', userId);
      onClose();
    } catch (error: any) {
      console.error('Error adding student:', error);
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('This email is already in use.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address.');
            break;
          case 'auth/operation-not-allowed':
            setError('Email/Password sign-in is not enabled in Firebase Console.');
            break;
          case 'auth/weak-password':
            setError('Password is too weak. Use a stronger password.');
            break;
          case 'auth/invalid-api-key':
            setError('Invalid Firebase API key. Check your Firebase configuration.');
            break;
          case 'auth/configuration-not-found':
            setError('Firebase Authentication is not properly configured. Verify apiKey and authDomain.');
            break;
          default:
            setError(`Failed to add student: ${error.message || 'Unknown error'}`);
        }
      } else {
        setError('An unexpected error occurred. Check Firebase configuration and network.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Add New Student</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
            />
          </div>

          {/* Student ID */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
              Student ID
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
            />
          </div>

          {/* Profile Image URL */}
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
              Profile Image URL
            </label>
            <input
              type="url"
              id="profileImage"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B945E] focus:ring-[#3B945E] sm:text-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3B945E] text-white rounded-lg hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-[#3B945E]"
            >
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Component for Viewing Student Details
const ViewStudentModal: React.FC<{ student: User; onClose: () => void }> = ({
  student,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[#DFF5E1] flex items-center justify-center">
                <UserIcon size={24} className="text-[#3B945E]" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-800">{student.name}</h3>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Student ID</label>
            <p className="mt-1 text-sm text-gray-900">{student.studentId || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <p className="mt-1 text-sm text-gray-900">{student.department || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total Requests</label>
            <p className="mt-1 text-sm text-gray-900">{student.totalRequests || 0}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Active Borrows</label>
            <p className="mt-1 text-sm text-gray-900">
              {student.activeRequests ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DFF5E1] text-[#3B945E]">
                  {student.activeRequests} items
                </span>
              ) : (
                'None'
              )}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentsPage;