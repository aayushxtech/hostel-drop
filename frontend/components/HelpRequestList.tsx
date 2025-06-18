"use client";

import React, { useState } from "react";

interface HelpRequest {
  id: number;
  trackingId: string;
  issueType: string;
  message?: string;
  status: "pending" | "in_progress" | "resolved";
  created_at?: string;
}

interface HelpRequestListProps {
  helpRequests: HelpRequest[];
  loading: boolean;
  onRefresh: () => void;
}

const HelpRequestList: React.FC<HelpRequestListProps> = ({
  helpRequests,
  loading,
  onRefresh,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<
    "pending" | "in_progress" | "resolved"
  >("pending");

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/support/update/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        onRefresh(); // Refresh after status update
      }
    } catch (error) {
      console.error(`Error updating to ${status}:`, error);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/support/delete/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        onRefresh(); // Refresh after deleting
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const filteredRequests = helpRequests.filter(
    (req) => req.status === selectedStatus
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📄 My Help Requests</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? "🔄 Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["pending", "in_progress", "resolved"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status as any)}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedStatus === status
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* Requests */}
      {loading ? (
        <p className="text-center py-4">Loading help requests...</p>
      ) : filteredRequests.length === 0 ? (
        <p className="text-center py-4">No {selectedStatus} requests found.</p>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="border border-gray-300 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    🆔{" "}
                    <span className="font-semibold">
                      {req.trackingId?.trim()
                        ? req.trackingId
                        : "No ID available"}
                    </span>
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    📝 <span className="font-medium">Issue:</span>{" "}
                    {req.message?.trim()
                      ? req.message
                      : req.issueType?.trim()
                      ? req.issueType
                      : "No issue provided"}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    📅 <span className="font-medium">Submitted:</span>{" "}
                    {req.created_at
                      ? new Date(req.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      req.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : req.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {req.status.replace("_", " ").toUpperCase()}
                  </span>

                  {/* Mark as In Progress */}
                  {req.status === "pending" && (
                    <button
                      onClick={() => updateStatus(req.id, "in_progress")}
                      className="bg-yellow-500 text-white px-2 py-1 text-xs rounded hover:bg-yellow-600 transition"
                    >
                      📌 Mark as In Progress
                    </button>
                  )}

                  {/* Mark Resolved */}
                  {(req.status === "pending" ||
                    req.status === "in_progress") && (
                    <button
                      onClick={() => updateStatus(req.id, "resolved")}
                      className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600 transition"
                    >
                      ✅ Mark as Resolved
                    </button>
                  )}

                  {/* Delete */}
                  {req.status === "resolved" && (
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpRequestList;
