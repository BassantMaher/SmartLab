import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import RequestCard from "../../components/common/RequestCard";
import SearchFilter from "../../components/common/SearchFilter";
import Loading from "../../components/common/Loading";
import { subscribeToData, updateData, createData, generateId, readData } from "../../firebase";
import { BorrowRequest, InventoryItem, Notification } from "../../utils/types";

const BorrowHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BorrowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (user) {
      // Subscribe to borrow requests
      const unsubscribe = subscribeToData<Record<string, BorrowRequest>>(
        "borrowRequests",
        (data) => {
          if (data) {
            const userRequests = Object.values(data)
              .filter((req) => req.userId === user.id)
              .sort(
                (a, b) =>
                  new Date(b.requestDate).getTime() -
                  new Date(a.requestDate).getTime()
              );
            setRequests(userRequests);
            setFilteredRequests(userRequests);
          } else {
            setRequests([]);
            setFilteredRequests([]);
          }
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  // Handle search and filter
  useEffect(() => {
    let filtered = requests;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Mark item as returned
  const handleMarkAsReturned = async (action: "approve" | "reject" | "return", requestId: string) => {
    if (action !== "return") return;
    
    const requestToUpdate = requests.find((req) => req.id === requestId);
    if (requestToUpdate && requestToUpdate.status === "approved") {
      try {
        const updatedRequest: BorrowRequest = {
          ...requestToUpdate,
          status: "returned",
          returnDate: new Date().toISOString(),
        };

        // Update request in Firebase
        await updateData(`borrowRequests/${requestId}`, updatedRequest);

        // Get the inventory item (using readData instead of subscribeToData to avoid infinite loop)
        const itemData = await readData<InventoryItem>(`inventoryItems/${requestToUpdate.itemId}`);
        if (itemData) {
          // Update inventory quantity
          const updatedItem: InventoryItem = {
            ...itemData,
            availableQuantity: itemData.availableQuantity + requestToUpdate.quantity,
          };
          await updateData(`inventoryItems/${requestToUpdate.itemId}`, updatedItem);
          
          // Create return notification for admin
          const returnNotificationId = generateId('notifications');
          const returnNotification: Notification = {
            id: returnNotificationId,
            userId: 'admin',
            title: 'Item Returned',
            message: `${user?.name} has returned ${requestToUpdate.quantity} ${updatedItem.name}(s).`,
            read: false,
            date: new Date().toISOString(),
            type: 'info'
          };
          await createData(`notifications/${returnNotificationId}`, returnNotification);

          // Check if availableQuantity matches physicalQuantity
          if (updatedItem.availableQuantity !== updatedItem.physicalQuantity) {
            // Create discrepancy notification for admin
            const discrepancyNotificationId = generateId('notifications');
            const discrepancyNotification: Notification = {
              id: discrepancyNotificationId,
              userId: 'admin', // Target admin users
              title: 'Inventory Discrepancy',
              message: `After ${user?.name}'s return, item ${updatedItem.name} has a discrepancy between available quantity (${updatedItem.availableQuantity}) and physical quantity (${updatedItem.physicalQuantity}).`,
              read: false,
              date: new Date().toISOString(),
              type: 'warning'
            };
            
            // Save notification to Firebase
            await createData(`notifications/${discrepancyNotificationId}`, discrepancyNotification);
          }
        }

        // Update local state
        setRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
        setFilteredRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req))
      } catch (error) {
        console.error("Error marking request as returned:", error);
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  // Filter options
  const filterOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Returned", value: "returned" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Borrow History</h1>
        <p className="text-gray-600 mt-1">
          Track your equipment requests and returns
        </p>
      </div>

      {/* Search and filter */}
      <div className="mb-8">
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          placeholder="Search requests..."
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
                request.status === "approved" && !request.returnDate
                  ? (action, requestId) => handleMarkAsReturned(action, requestId)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center bg-[#DFF5E1] p-3 rounded-full mb-4">
            <Package className="h-8 w-8 text-[#3B945E]" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No Requests Found
          </h3>
          {requests.length === 0 ? (
            <>
              <p className="text-gray-600 mb-4">
                You haven't made any borrowing requests yet.
              </p>
              <Link
                to="/borrow-request"
                className="inline-flex items-center px-4 py-2 bg-[#3B945E] text-white font-medium rounded-lg hover:bg-[#74B49B] transition-colors duration-150"
              >
                Borrow Items
              </Link>
            </>
          ) : (
            <p className="text-gray-600">
              No requests match your search criteria. Try adjusting your filters
              or search term.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BorrowHistoryPage;
