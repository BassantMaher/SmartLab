import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
// import EnvironmentalCard from '../../components/common/EnvironmentalCard';
import RequestCard from '../../components/common/RequestCard';
import Loading from '../../components/common/Loading';
import { getEnvironmentalMetrics, getUserBorrowRequests } from '../../utils/localStorage';
import { EnvironmentalMetric, BorrowRequest } from '../../utils/types';


const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<EnvironmentalMetric[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Load data
      const envMetrics = getEnvironmentalMetrics();
      const userRequests = getUserBorrowRequests(user.id);
      
      // Set state
      setMetrics(envMetrics);
      setRequests(userRequests.slice(0, 5)); // Show only 5 most recent
      setIsLoading(false);
    }
  }, [user]);



  if (isLoading) {
    return <Loading />;
  }

  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  const approvedRequests = requests.filter(req => req.status === 'approved').length;
  const rejectedRequests = requests.filter(req => req.status === 'rejected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Request Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Pending</h3>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Approved</h3>
                <p className="text-2xl font-bold text-gray-900">{approvedRequests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <AlertTriangle className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Rejected</h3>
                <p className="text-2xl font-bold text-gray-900">{rejectedRequests}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Monitoring Section */}
      {/* <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Lab Environment</h2>
          <span className="text-sm text-gray-500">Real-time monitoring</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <EnvironmentalCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div> */}

      {/* Recent Requests Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Requests</h2>
          <Link 
            to="/borrow-history" 
            className="text-sm font-medium text-[#3B945E] hover:text-[#74B49B] transition-colors duration-150"
          >
            View all
          </Link>
        </div>
        
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center bg-[#DFF5E1] p-3 rounded-full mb-4">
              <Package className="h-8 w-8 text-[#3B945E]" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Requests Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't made any borrowing requests yet.
            </p>
            <Link
              to="/borrow-request"
              className="inline-flex items-center px-4 py-2 bg-[#3B945E] text-white font-medium rounded-lg hover:bg-[#74B49B] transition-colors duration-150"
            >
              Borrow Items
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;