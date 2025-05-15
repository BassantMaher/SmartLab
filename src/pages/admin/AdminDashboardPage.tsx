import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Box, Clock, Layers, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EnvironmentalCard from '../../components/common/EnvironmentalCard';
import RequestCard from '../../components/common/RequestCard';
import Loading from '../../components/common/Loading';
import { subscribeToData, createData, readData, updateData,generateId } from '../../firebase';
import { EnvironmentalMetric, BorrowRequest, InventoryItem, Notification } from '../../utils/types';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<EnvironmentalMetric[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Subscribe to environmental metrics
    const unsubscribeMetrics = subscribeToData<Record<string, EnvironmentalMetric>>(
      'environmentalMetrics',
      (data) => {
        if (data) {
          const metricsArray = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          setMetrics(metricsArray);
        } else {
          setMetrics([]);
        }
      }
      // (Error) => {
      //   console.error('Error fetching environmental metrics:', Error);
      //   // setError('Failed to load environmental metrics.');
      // }
    );

    // Subscribe to borrow requests
    const unsubscribeRequests = subscribeToData<Record<string, BorrowRequest>>(
      'borrowRequests',
      (data) => {
        if (data) {
          const requestsArray = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          // Sort requests by date (newest first)
          const sortedRequests = [...requestsArray].sort(
            (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
          );
          setRequests(sortedRequests.slice(0, 5)); // Show only 5 most recent
        } else {
          setRequests([]);
        }
      },
      (err: Error) => {
        console.error('Error fetching borrow requests:', err);
        setError('Failed to load borrow requests.');
      }
    );

    // Subscribe to inventory items
    const unsubscribeItems = subscribeToData<Record<string, InventoryItem>>(
      'inventoryItems',
      (data) => {
        if (data) {
          const itemsArray = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          setInventoryItems(itemsArray);
        } else {
          setInventoryItems([]);
        }
        setIsLoading(false);
      },
      (err: Error) => {
        console.error('Error fetching inventory items:', err);
        setError('Failed to load inventory items.');
      }
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeMetrics();
      unsubscribeRequests();
      unsubscribeItems();
    };
  }, []);

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

            // Create notification for admin
            const notificationId = generateId('notifications');
            const notification: Notification = {
              id: notificationId,
              userId: 'admin',
              title: 'Item Borrowed',
              message: `${requestToUpdate.quantity} ${item.name}(s) borrowed by ${requestToUpdate.userName}. New available quantity: ${updatedItem.availableQuantity}`,
              read: false,
              date: new Date().toISOString(),
              type: 'info',
            };
            await createData(`notifications/${notificationId}`, notification);

            // Update request
            const updatedRequest: BorrowRequest = {
              ...requestToUpdate,
              status: 'approved',
              approvedBy: user.name,
              approvalDate: new Date().toISOString(),
            };
            await updateData(`borrowRequests/${requestId}`, updatedRequest);
          } else {
            setError('Not enough items available to approve this request.');
            return;
          }
        } else {
          setError('Inventory item not found.');
          return;
        }
      }

      // Handle reject action
      if (action === 'reject') {
        const updatedRequest: BorrowRequest = {
          ...requestToUpdate,
          status: 'rejected',
          approvedBy: user.name,
          approvalDate: new Date().toISOString(),
        };
        await updateData(`borrowRequests/${requestId}`, updatedRequest);
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

          // Create notification for admin
          const notificationId = generateId('notifications');
          const notification: Notification = {
            id: notificationId,
            userId: 'admin',
            title: 'Item Returned',
            message: `${requestToUpdate.quantity} ${item.name}(s) returned by ${requestToUpdate.userName}. New available quantity: ${updatedItem.availableQuantity}`,
            read: false,
            date: new Date().toISOString(),
            type: 'info',
          };
          await createData(`notifications/${notificationId}`, notification);

          // Update request
          const updatedRequest: BorrowRequest = {
            ...requestToUpdate,
            status: 'returned',
            approvedBy: user.name,
            approvalDate: new Date().toISOString(),
            returnDate: new Date().toISOString(),
          };
          await updateData(`borrowRequests/${requestId}`, updatedRequest);
        } else {
          setError('Inventory item not found.');
          return;
        }
      }

      // Rely on subscribeToData for state updates
    } catch (err: any) {
      console.error('Error handling request action:', err);
      setError(err.message || 'Failed to update request. Please try again.');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  // Calculate statistics
  const pendingRequests = requests.filter((req) => req.status === 'pending').length;
  const totalInventoryItems = inventoryItems.reduce((sum, item) => sum + item.totalQuantity, 0);
  const availableItems = inventoryItems.reduce((sum, item) => sum + item.availableQuantity, 0);
  const lowStockItems = inventoryItems.filter(
    (item) => (item.availableQuantity / item.totalQuantity) < 0.2
  ).length;

  // Calculate environmental alerts
  const alerts = metrics.filter((metric) => metric.status !== 'normal').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of lab inventory and monitoring system</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Pending Requests</h3>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center">
              <div className="bg-[#DFF5E1] p-3 rounded-lg mr-4">
                <Layers className="h-6 w-6 text-[#3B945E]" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Total Inventory</h3>
                <p className="text-2xl font-bold text-gray-900">{totalInventoryItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <AlertTriangle className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Low Stock Items</h3>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Activity className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Env. Alerts</h3>
                <p className="text-2xl font-bold text-gray-900">{alerts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Monitoring Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Lab Environment</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.length > 0 ? (
            metrics.map((metric) => (
              <EnvironmentalCard key={metric.id} metric={metric} />
            ))
          ) : (
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center bg-gray-100 p-3 rounded-full mb-4">
                <Activity className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Environmental Data</h3>
              <p className="text-gray-600">
                No environmental metrics are available to display.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Requests</h2>
          <Link
            to="/admin/requests"
            className="text-sm font-medium text-[#3B945E] hover:text-[#74B49B] transition-colors duration-150"
          >
            View all
          </Link>
        </div>

        {requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAction={request.status === 'pending' ? handleRequestAction : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center bg-[#DFF5E1] p-3 rounded-full mb-4">
              <Box className="h-8 w-8 text-[#3B945E]" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Recent Requests</h3>
            <p className="text-gray-600">
              There are no recent borrowing requests to display.
            </p>
          </div>
        )}
      </div>

      {/* Inventory Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Inventory Status</h2>
          <Link
            to="/admin/inventory"
            className="text-sm font-medium text-[#3B945E] hover:text-[#74B49B] transition-colors duration-150"
          >
            Manage inventory
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Inventory Overview</h3>
              <div className="text-sm text-gray-500">
                Available: {availableItems} / {totalInventoryItems}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryItems.slice(0, 5).map((item) => {
                    const availabilityPercentage = (item.availableQuantity / item.totalQuantity) * 100;
                    let statusColor = 'bg-green-100 text-green-800';
                    if (availabilityPercentage <= 20) {
                      statusColor = 'bg-red-100 text-red-800';
                    } else if (availabilityPercentage <= 50) {
                      statusColor = 'bg-yellow-100 text-yellow-800';
                    }

                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.availableQuantity} / {item.totalQuantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                            {availabilityPercentage <= 20 ? 'Low Stock' : 
                             availabilityPercentage <= 50 ? 'Medium Stock' : 'Good Stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;