"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface ParcelData {
  id?: number;
  studentName: string;
  roomNo: string;
  block?: string;
  trackingId: string;
  courier: string;
  status: string;
  createdAt?: string;
  pickedUpTime?: string;
}

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
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleHelpSubmit = async () => {
    if (!issueType || !data.id) {
      toast.error("Please select an issue.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/support/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_type: "student", 
          parcel: data.id,
          issue_type: issueType,
          message: message.trim() === "" ? "No message provided" : message, 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server Error Response:", errorText);
        toast.error("Failed to submit help request.");
        return;
      }

      toast.success("Help request submitted successfully!");
      setShowHelpForm(false);
      setIssueType("");
      setMessage("");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit request. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow mb-4">
      {/* Parcel info */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-gray-900">{data.trackingId}</div>
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

      {/* Admin action */}
      {onMarkAsPickedUp && data.status === "PENDING" && data.id && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onMarkAsPickedUp(data.id!)}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
          >
            Mark as Picked Up
          </button>
        </div>
      )}

      {/* Need Help button */}
      <div className="mt-3">
        <button
          onClick={() => setShowHelpForm(!showHelpForm)}
          className="w-full text-blue-600 hover:underline text-sm text-center"
        >
          {showHelpForm ? "Cancel Help Request" : "Need Help with this Parcel?"}
        </button>
      </div>

      {/* Inline Help Form */}
      {showHelpForm && (
        <div className="mt-4 p-3 border border-blue-200 rounded-lg bg-blue-50">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Issue Type
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            >
              <option value="">Select an issue</option>
              <option value="wrong-courier">Wrong courier assigned</option>
              <option value="delayed">Parcel delayed</option>
              <option value="not-mine">Not my parcel</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Add details here..."
            />
          </div>

          <button
            onClick={handleHelpSubmit}
            disabled={!issueType || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md font-medium transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Help Request"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ParcelCard;
