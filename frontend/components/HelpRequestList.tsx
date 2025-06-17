"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs"; // import Clerk

interface HelpRequest {
  id: number;
  trackingId: string;
  issueType: string;
  status: "pending" | "in_progress" | "resolved";
  created_at?: string;
}

const HelpRequestList: React.FC = () => {
  const { user } = useUser(); // get user from Clerk
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelpRequests = async () => {
      if (!user) return;

      try {
        const email = user.emailAddresses[0].emailAddress;

        const res = await fetch(
          `http://127.0.0.1:8000/support/my/?email=${email}`
        );
        if (!res.ok) throw new Error("Failed to fetch help requests");

        const data = await res.json();
        setHelpRequests(data);
      } catch (err) {
        console.error(err);
        toast.error("Could not load help requests");
      } finally {
        setLoading(false);
      }
    };

    fetchHelpRequests();
  }, [user]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">📋 My Help Requests</h2>

      {loading ? (
        <p className="text-gray-500">Loading help requests...</p>
      ) : helpRequests.length === 0 ? (
        <p className="text-gray-500">No help requests yet.</p>
      ) : (
        <div className="space-y-4">
          {helpRequests.map((req) => (
            <div
              key={req.id}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">
                  📦 <span className="text-gray-900">{req.trackingId}</span>
                </p>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
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
              <p className="text-sm text-gray-600">📝 Issue: {req.issueType}</p>
              <p className="text-xs text-gray-400 mt-1">
                Submitted on:{" "}
                {req.created_at
                  ? new Date(req.created_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpRequestList;
