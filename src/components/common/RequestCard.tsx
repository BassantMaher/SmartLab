import React from "react";
import { BorrowRequest } from "../../utils/types";
import {
  formatDate,
  getStatusColor,
  getStatusTextColor,
  getStatusBgColor,
} from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

interface RequestCardProps {
  request: BorrowRequest;
  onAction?: (action: "approve" | "reject" | "return", requestId: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onAction }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const statusColor = getStatusColor(request.status);
  const statusTextColor = getStatusTextColor(request.status);
  const statusBgColor = getStatusBgColor(request.status);

  const isPending = request.status === "pending";
  const dueDate = new Date(request.dueDate);
  const today = new Date();
  const isOverdue = dueDate < today && request.status === "approved";

  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-5 border-l-4 ${
        isOverdue
          ? "border-red-500"
          : request.status === "approved"
          ? "border-green-500"
          : request.status === "rejected"
          ? "border-red-500"
          : "border-yellow-500"
      } hover:shadow-lg transition-shadow duration-300`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-gray-800">
          {request.itemName}
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Qty: {request.quantity})
          </span>
        </h3>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusBgColor} ${statusTextColor}`}
        >
          {request.status}
          {isOverdue && <span className="ml-1">• Overdue</span>}
        </div>
      </div>

      <div className="mb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Requested:</p>
            <p className="font-medium">{formatDate(request.requestDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Due Date:</p>
            <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
              {formatDate(request.dueDate)}
            </p>
          </div>

          {!isAdmin && (
            <div className="col-span-2">
              <p className="text-gray-500">Purpose:</p>
              <p className="font-medium">{request.purpose}</p>
            </div>
          )}

          {isAdmin && (
            <>
              <div className="col-span-2">
                <p className="text-gray-500">Student:</p>
                <p className="font-medium">{request.userName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Purpose:</p>
                <p className="font-medium">{request.purpose}</p>
              </div>
            </>
          )}

          {request.approvalDate && (
            <div className="col-span-2">
              <p className="text-gray-500">
                {request.status === "rejected" ? "Rejected" : "Approved"} by:
              </p>
              <p className="font-medium">
                {request.approvedBy} ({formatDate(request.approvalDate)})
              </p>
            </div>
          )}
        </div>
      </div>

      {isAdmin && isPending && onAction && (
        <div className="flex justify-end space-x-2 mt-3">
          <button
            onClick={() => onAction("reject", request.id)}
            className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-full text-sm font-medium transition-colors duration-150"
          >
            Reject
          </button>
          <button
            onClick={() => onAction("approve", request.id)}
            className="px-3 py-1 bg-[#DFF5E1] text-[#3B945E] hover:bg-[#A8D5BA] rounded-full text-sm font-medium transition-colors duration-150"
          >
            Approve
          </button>
        </div>
      )}

      {!isAdmin && request.status === "approved" && !request.returnDate && (
        <div className="flex justify-end mt-3">
          <button 
            onClick={() => onAction && onAction("return", request.id)}
            className="px-3 py-1 bg-[#DFF5E1] text-[#3B945E] hover:bg-[#A8D5BA] rounded-full text-sm font-medium transition-colors duration-150"
          >
            Mark as Returned
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
