import React from 'react';
import { Link } from 'react-router-dom';
import { InventoryItem } from '../../utils/types';
import { useAuth } from '../../context/AuthContext';

interface InventoryItemCardProps {
  item: InventoryItem;
  onManage?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, onManage, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const availabilityPercentage = (item.availableQuantity / item.totalQuantity) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-40 bg-gray-200 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#DFF5E1]">
            <span className="text-[#3B945E] font-medium">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-800 mb-1">{item.name}</h3>
          <span className="px-2 py-1 bg-[#DFF5E1] text-[#3B945E] text-xs font-medium rounded-full">
            {item.category}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Availability:</span>
            <span
              className={`font-medium ${
                availabilityPercentage > 60
                  ? 'text-green-600'
                  : availabilityPercentage > 30
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {item.availableQuantity} / {item.totalQuantity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                availabilityPercentage > 60
                  ? 'bg-green-500'
                  : availabilityPercentage > 30
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${availabilityPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          {isAdmin ? (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (typeof onManage === 'function') {
                    onManage(item);
                  }
                }}
                className="text-sm font-medium text-[#3B945E] hover:text-[#74B49B] transition-colors duration-150"
              >
                Manage
              </button>
              <button
                onClick={() => {
                  if (typeof onDelete === 'function') {
                    onDelete(item);
                  }
                }}
                className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          ) : (
            <Link
              to={`/borrow-request/${item.id}`}
              className={`text-sm font-medium ${
                item.availableQuantity > 0
                  ? 'text-[#3B945E] hover:text-[#74B49B]'
                  : 'text-gray-400 cursor-not-allowed'
              } transition-colors duration-150`}
            >
              {item.availableQuantity > 0 ? 'Borrow' : 'Unavailable'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryItemCard;