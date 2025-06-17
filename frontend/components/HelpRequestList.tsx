"use client";

import React from "react";

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

      {loading ? (
        <p className="text-center py-4">Loading help requests...</p>
      ) : helpRequests.length === 0 ? (
        <p className="text-center py-4">No help requests submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {helpRequests.map((req) => (
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

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                    req.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : req.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {req.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpRequestList;
