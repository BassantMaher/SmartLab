import React, { useState, useEffect } from 'react';
import { Plus, User as UserIcon, Search, ArrowUpDown } from 'lucide-react';
import SearchFilter from '../../components/common/SearchFilter';
import Loading from '../../components/common/Loading';
import { getUsers, getUserBorrowRequests } from '../../utils/localStorage';
import { User } from '../../utils/types';

const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Load students
  useEffect(() => {
    // Get all users with role 'student'
    const allUsers = getUsers();
    const studentUsers = allUsers.filter(user => user.role === 'student');
    
    // Get request stats for each student
    const studentsWithStats = studentUsers.map(student => {
      const requests = getUserBorrowRequests(student.id);
      const activeRequests = requests.filter(req => req.status === 'approved').length;
      
      return {
        ...student,
        totalRequests: requests.length,
        activeRequests
      };
    });
    
    setStudents(studentsWithStats);
    setFilteredStudents(studentsWithStats);
    setIsLoading(false);
  }, []);
  
  // Handle search
  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.department && student.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);
  
  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
    
    // Apply sort
    const sorted = [...filteredStudents].sort((a: any, b: any) => {
      const valueA = a[column];
      const valueB = b[column];
      
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
    
    setFilteredStudents(sorted);
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
            className="px-4 py-2 bg-[#3B945E] text-white rounded-lg shadow-sm hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-[#3B945E] transition-colors duration-150"
          >
            <div className="flex items-center">
              <Plus size={16} className="mr-1" />
              Add Student
            </div>
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="mb-8">
        <SearchFilter 
          onSearch={handleSearch}
          placeholder="Search students..."
        />
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
                {filteredStudents.map((student: any) => (
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
                      <button className="text-[#3B945E] hover:text-[#74B49B] mr-3">View</button>
                      <button className="text-red-600 hover:text-red-800">Remove</button>
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
    </div>
  );
};

export default AdminStudentsPage;