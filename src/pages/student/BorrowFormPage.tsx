import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, Calendar, ChevronLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/common/Loading";
import { subscribeToData, updateData, createData } from "../../firebase";
import { InventoryItem, BorrowRequest, Notification } from "../../utils/types";
import { generateId } from "../../utils/helpers";

const BorrowFormPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemId) {
      // Subscribe to inventory item updates
      const unsubscribe = subscribeToData<InventoryItem>(
        `inventoryItems/${itemId}`,
        (inventoryItem) => {
          if (inventoryItem) {
            setItem(inventoryItem);

            // Set default due date (7 days from now)
            const defaultDueDate = new Date();
            defaultDueDate.setDate(defaultDueDate.getDate() + 7);
            setDueDate(defaultDueDate.toISOString().split("T")[0]);
          }
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!item || !user) return;
    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    if (quantity > item.availableQuantity) {
      setError(`Only ${item.availableQuantity} available`);
      return;
    }
    if (!purpose.trim()) {
      setError("Please provide a purpose for borrowing");
      return;
    }
    if (!dueDate) {
      setError("Please select a return date");
      return;
    }

    // Check if due date is in the future
    const selectedDueDate = new Date(dueDate);
    const today = new Date();
    if (selectedDueDate <= today) {
      setError("Return date must be in the future");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new borrow request
      const requestId = generateId();
      const newRequest: BorrowRequest = {
        id: requestId,
        userId: user.id,
        userName: user.name,
        itemId: item.id,
        itemName: item.name,
        quantity,
        requestDate: new Date().toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        status: "pending",
        purpose,
      };

      // Update inventory item available quantity
      const updatedItem = {
        ...item,
        availableQuantity: item.availableQuantity - quantity,
      };

      // Add notification for admin
      const notificationId = generateId();
      const notification: Notification = {
        id: notificationId,
        userId: "2", // Admin ID
        title: "New Borrow Request",
        message: `${user.name} has requested to borrow ${quantity} ${item.name}`,
        read: false,
        date: new Date().toISOString(),
        type: "info",
      };

      // Save to Firebase
      await Promise.all([
        createData(`borrowRequests/${requestId}`, newRequest),
        updateData(`inventoryItems/${item.id}`, updatedItem),
        createData(`notifications/${notificationId}`, notification),
      ]);

      // Redirect to borrow history
      navigate("/borrow-history");
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("Failed to submit request. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center bg-red-100 p-3 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Item Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The requested item does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/borrow-request")}
            className="inline-flex items-center px-4 py-2 bg-[#3B945E] text-white font-medium rounded-lg hover:bg-[#74B49B] transition-colors duration-150"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <button
          onClick={() => navigate("/borrow-request")}
          className="inline-flex items-center text-[#3B945E] hover:text-[#74B49B] transition-colors duration-150"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Inventory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Item details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#DFF5E1]">
                  <span className="text-[#3B945E] font-medium">No Image</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  {item.name}
                </h2>
                <span className="px-2 py-1 bg-[#DFF5E1] text-[#3B945E] text-xs font-medium rounded-full">
                  {item.category}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{item.description}</p>

              <div className="border-t border-gray-200 pt-4">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Available:</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {item.availableQuantity} / {item.totalQuantity}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Location:</dt>
                    {/* <dd className="text-sm font-medium text-gray-900">{item.location}</dd> */}
                  </div>
                  {/* {item.lastRestocked && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Last Restocked:</dt>
                      <dd className="text-sm font-medium text-gray-900">{new Date(item.lastRestocked).toLocaleDateString()}</dd>
                    </div>
                  )} */}
                </dl>
              </div>

              {item.specifications &&
                Object.keys(item.specifications).length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Specifications
                    </h3>
                    <dl className="space-y-2">
                      {Object.entries(item.specifications).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <dt className="text-sm text-gray-500">{key}:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {value}
                            </dd>
                          </div>
                        )
                      )}
                    </dl>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Borrow form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Borrow Request Form
            </h2>

            {error && (
              <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={item.availableQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {item.availableQuantity} available
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Return Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Standard borrowing period is 7 days
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="purpose"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Purpose
                </label>
                <textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B945E] focus:border-transparent"
                  placeholder="Please describe why you need this equipment..."
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center mb-6 bg-[#DFF5E1] p-4 rounded-lg">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-[#3B945E]" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-[#3B945E]">
                      By submitting this request, you agree to take
                      responsibility for the borrowed equipment and return it by
                      the due date.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/borrow-request")}
                    className="mr-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || item.availableQuantity === 0}
                    className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#3B945E] hover:bg-[#74B49B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B945E] ${
                      isSubmitting || item.availableQuantity === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowFormPage;
