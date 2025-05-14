import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Box, Clock, Layers, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EnvironmentalCard from '../../components/common/EnvironmentalCard';
import RequestCard from '../../components/common/RequestCard';
import Loading from '../../components/common/Loading';
import { subscribeToData, createData } from '../../firebase';
import { EnvironmentalMetric, BorrowRequest, InventoryItem } from '../../utils/types';

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
    const requestToUpdate = requests.find((req) => req.id === requestId);
    if (requestToUpdate && user) {
      setError(null);
      try {
        const updatedRequest: BorrowRequest = {
          ...requestToUpdate,
          status: action === 'approve' ? 'approved' : 'rejected',
          approvedBy: user.name,
          approvalDate: new Date().toISOString(),
        };

        // Update request in Firebase
        await createData(`borrowRequests/${requestId}`, updatedRequest);
        console.log(`Borrow request ${requestId} ${action}ed`);

        // If approved, update inventory item quantity
        if (action === 'approve') {
          const item = inventoryItems.find((item) => item.id === requestToUpdate.itemId);
          if (item) {
            const updatedItem: InventoryItem = {
              ...item,
              // No longer decreasing availableQuantity on approval
            };
            await createData(`inventoryItems/${item.id}`, updatedItem);
            console.log(`Inventory item ${item.id} updated: availableQuantity = ${updatedItem.availableQuantity}`);
          }
        }

        // Update local state
        const updatedRequests = requests.map((req) =>
          req.id === requestId ? updatedRequest : req
        );
        setRequests(updatedRequests);
      } catch (err: any) {
        console.error(`Error updating request ${requestId}:`, err);
        setError(`Failed to ${action} request: ${err.message || 'Unknown error'}`);
      }
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