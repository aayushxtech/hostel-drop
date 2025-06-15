"use client";

import React from "react";
import { ParcelData } from "./ParcelForm";

interface ParcelCardProps {
  data: ParcelData;
  showStudentName?: boolean;
  onMarkAsPickedUp?: (parcelId: number) => void;
}

const ParcelCard: React.FC<ParcelCardProps> = ({
  data,
  showStudentName = false,
  onMarkAsPickedUp,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PICKED_UP":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const handleMarkAsPickedUp = () => {
    if (data.id && onMarkAsPickedUp && data.status === "PENDING") {
      if (confirm("Mark this parcel as picked up?")) {
        onMarkAsPickedUp(data.id);
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">{data.trackingId}</span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            data.status
          )}`}
        >
          {data.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {showStudentName && (
          <div>
            <span className="font-medium text-gray-700">Student:</span>
            <p className="text-gray-900">{data.studentName}</p>
          </div>
        )}

        <div>
          <span className="font-medium text-gray-700">Room:</span>
          <p className="text-gray-900">{data.roomNo}</p>
        </div>

        <div>
          <span className="font-medium text-gray-700">Courier:</span>
          <p className="text-gray-900">{data.courier}</p>
        </div>

        <div>
          <span className="font-medium text-gray-700">Registered:</span>
          <p className="text-gray-600">{formatDate(data.createdAt)}</p>
        </div>

        {data.pickedUpTime && (
          <div className="col-span-2">
            <span className="font-medium text-gray-700">Picked up:</span>
            <p className="text-gray-600">{formatDate(data.pickedUpTime)}</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      {onMarkAsPickedUp && data.status === "PENDING" && data.id && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleMarkAsPickedUp}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
          >
            Mark as Picked Up
          </button>
        </div>
      )}
    </div>
  );
};

export default ParcelCard;
