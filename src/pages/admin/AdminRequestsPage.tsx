import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RequestCard from '../../components/common/RequestCard';
import SearchFilter from '../../components/common/SearchFilter';
import Loading from '../../components/common/Loading';
import { subscribeToData, readData, updateData } from '../../firebase';
import { BorrowRequest, InventoryItem } from '../../utils/types';

const AdminRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BorrowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load borrow requests from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToData<Record<string, BorrowRequest>>(
      'borrowRequests',
      (data) => {
        try {
          if (data) {
            const allRequests = Object.keys(data).map((key) => ({
              ...data[key],
              id: key,
            }));
            // Sort by date (newest first)
            const sortedRequests = [...allRequests].sort(
              (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
            );
            setRequests(sortedRequests);
            setFilteredRequests(sortedRequests);
          } else {
            setRequests([]);
            setFilteredRequests([]);
          }
          setIsLoading(false);
        } catch (err) {
          console.error('Error processing borrow requests:', err);
          setError('Failed to load borrow requests.');
          setIsLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle search and filter
  useEffect(() => {
    let filtered = requests;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((request) =>
        request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle filter
  const handleFilter = (filter: string) => {
    setStatusFilter(filter);
  };

  // Handle request actions (approve/reject/return)
  const handleRequestAction = async (action: 'approve' | 'reject' | 'return', requestId: string) => {
    if (!user) {
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      const requestToUpdate = requests.find((req) => req.id === requestId);
      if (!requestToUpdate) {
        setError('Request not found.');
        return;
      }

      const updatedRequest: BorrowRequest = {
        ...requestToUpdate,
        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned',
        approvedBy: user.name,
        approvalDate: new Date().toISOString(),
        ...(action === 'return' && { returnDate: new Date().toISOString() }),
      };

      // Update request in Firebase
      await updateData(`borrowRequests/${requestId}`, updatedRequest);

      // If approved, update inventory item quantity (decrease)
      if (action === 'approve') {
        const item = await readData<InventoryItem>(`inventoryItems/${requestToUpdate.itemId}`);
        if (item) {
          // Verify item is still available
          if (item.availableQuantity >= requestToUpdate.quantity) {
            const updatedItem: InventoryItem = {
              ...item,
              availableQuantity: item.availableQuantity - requestToUpdate.quantity,
            };
            await updateData(`inventoryItems/${requestToUpdate.itemId}`, updatedItem);
          } else {
            setError('Not enough items available to approve this request.');
            return;
          }
        } else {
          setError('Inventory item not found.');
          return;
        }
      }

      // If returned, update inventory item quantity (increase)
      if (action === 'return') {
        const item = await readData<InventoryItem>(`inventoryItems/${requestToUpdate.itemId}`);
        if (item) {
          const updatedItem: InventoryItem = {
            ...item,
            availableQuantity: item.availableQuantity + requestToUpdate.quantity,
          };
          await updateData(`inventoryItems/${requestToUpdate.itemId}`, updatedItem);
        } else {
          setError('Inventory item not found.');
          return;
        }
      }

      // Update local state (subscribeToData will handle real-time updates, but we update state for immediate feedback)
      const updatedRequests = requests.map((req) =>
        req.id === requestId ? updatedRequest : req
      );
      setRequests(updatedRequests);
      setFilteredRequests(
        filteredRequests.map((req) => (req.id === requestId ? updatedRequest : req))
      );
    } catch (err) {
      console.error('Error handling request action:', err);
      setError('Failed to update request. Please try again.');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  // Filter options
  const filterOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Returned', value: 'returned' },
  ];

  // Count by status
  const pendingCount = requests.filter((req) => req.status === 'pending').length;
  const approvedCount = requests.filter((req) => req.status === 'approved').length;
  const rejectedCount = requests.filter((req) => req.status === 'rejected').length;
  const returnedCount = requests.filter((req) => req.status === 'returned').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Borrow Requests</h1>
        <p className="text-gray-600 mt-1">Manage student equipment requests</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Section */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className={`p-4 rounded-2xl shadow-sm text-center ${
              statusFilter === 'pending'
                ? 'bg-[#3B945E] text-white'
                : 'bg-white hover:bg-[#DFF5E1] hover:text-[#3B945E]'
            } transition-colors duration-150`}
            onClick={() => handleFilter(statusFilter === 'pending' ? '' : 'pending')}
          >
            <div className="text-2xl font-bold mb-1">{pendingCount}</div>
            <div className="text-sm">Pending</div>
          </button>

          <button
            className={`p-4 rounded-2xl shadow-sm text-center ${
              statusFilter === 'approved'
                ? 'bg-[#3B945E] text-white'
                : 'bg-white hover:bg-[#DFF5E1] hover:text-[#3B945E]'
            } transition-colors duration-150`}
            onClick={() => handleFilter(statusFilter === 'approved' ? '' : 'approved')}
          >
            <div className="text-2xl font-bold mb-1">{approvedCount}</div>
            <div className="text-sm">Approved</div>
          </button>

          <button
            className={`p-4 rounded-2xl shadow-sm text-center ${
              statusFilter === 'rejected'
                ? 'bg-[#3B945E] text-white'
                : 'bg-white hover:bg-[#DFF5E1] hover:text-[#3B945E]'
            } transition-colors duration-150`}
            onClick={() => handleFilter(statusFilter === 'rejected' ? '' : 'rejected')}
          >
            <div className="text-2xl font-bold mb-1">{rejectedCount}</div>
            <div className="text-sm">Rejected</div>
          </button>

          <button
            className={`p-4 rounded-2xl shadow-sm text-center ${
              statusFilter === 'returned'
                ? 'bg-[#3B945E] text-white'
                : 'bg-white hover:bg-[#DFF5E1] hover:text-[#3B945E]'
            } transition-colors duration-150`}
            onClick={() => handleFilter(statusFilter === 'returned' ? '' : 'returned')}
          >
            <div className="text-2xl font-bold mb-1">{returnedCount}</div>
            <div className="text-sm">Returned</div>
          </button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="mb-8">
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          placeholder="Search by item, student, or purpose..."
          filterOptions={filterOptions}
        />
      </div>

      {/* Request list */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAction={
                request.status === 'pending' || (request.status === 'approved' && !request.returnDate)
                  ? handleRequestAction 
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center bg-[#DFF5E1] p-3 rounded-full mb-4">
            <Search className="h-8 w-8 text-[#3B945E]" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Requests Found</h3>
          {requests.length === 0 ? (
            <p className="text-gray-600">
              There are no borrowing requests in the system.
            </p>
          ) : (
            <p className="text-gray-600">
              No requests match your search criteria. Try adjusting your filters or search term.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;