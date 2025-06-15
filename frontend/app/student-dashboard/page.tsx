"use client";

import React, { useEffect, useState, useCallback } from "react";
import ParcelList from "@/components/ParcelList";
import StudentProfile from "@/components/UpdateProfile";
import { useUser } from "@clerk/nextjs";
import { useSyncClerkUser } from "@/lib/useSyncClerkUser";

// ✅ Simplified ParcelData type (no form needed)
export type ParcelData = {
  id?: number;
  studentName: string;
  roomNo: string;
  block?: string;
  trackingId: string;
  courier: string;
  status: string;
  createdAt?: string;
  pickedUpTime?: string;
};

export default function StudentDashboardPage() {
  const { user, isLoaded } = useUser();
  const synced = useSyncClerkUser();
  const [parcels, setParcels] = useState<ParcelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<
    "Profile" | "Pending" | "Picked Up"
  >("Profile");

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const fetchParcels = useCallback(async () => {
    if (!user?.id || !synced || !isLoaded) {
      console.log("⏸️ Skipping fetch - user not ready:", {
        userId: user?.id,
        synced,
        isLoaded,
      });
      return;
    }

    const now = Date.now();
    const FETCH_COOLDOWN = 5000; // 5 seconds

    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log("⏸️ Skipping fetch - too recent (cooldown)");
      return;
    }

    try {
      console.log("🔄 Fetching parcels for user:", user.id);
      setLoading(true);
      setLastFetchTime(now);

      const response = await fetch(
        `${baseUrl}/parcels/my/?clerk_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch parcels`);
      }

      const data = await response.json();
      console.log("📦 My parcels:", data);

      const mappedParcels = data.map((p: any) => {
        let roomNo = "N/A";
        let block = "N/A";

        if (p.description) {
          const roomMatch = p.description.match(/Room No:\s*([^|]+)/);
          const blockMatch = p.description.match(/Block:\s*([^|]+)/);

          if (roomMatch) roomNo = roomMatch[1].trim();
          if (blockMatch) block = blockMatch[1].trim();
        }

        return {
          id: p.id,
          studentName: p.student?.name || p.student || "You",
          roomNo,
          block,
          trackingId: p.tracking_id || "N/A", // ✅ Use backend tracking_id
          courier: p.service,
          status: p.status,
          createdAt: p.created_at,
          pickedUpTime: p.picked_up_time,
        };
      });

      setParcels(mappedParcels);
      console.log("✅ Parcels updated:", mappedParcels.length);
    } catch (err) {
      console.error("❌ Error fetching student parcels:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, synced, isLoaded, baseUrl, lastFetchTime]);

  useEffect(() => {
    if (isLoaded && user?.id && synced) {
      console.log("🚀 Initial fetch trigger");
      fetchParcels();
    }
  }, [isLoaded, user?.id, synced]);

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    setLastFetchTime(0);
    fetchParcels();
  };

  const filteredParcels = parcels.filter((parcel) =>
    activeTab === "Pending"
      ? parcel.status === "PENDING"
      : activeTab === "Picked Up"
      ? parcel.status === "PICKED_UP"
      : false
  );

  const pendingCount = parcels.filter((p) => p.status === "PENDING").length;
  const pickedUpCount = parcels.filter((p) => p.status === "PICKED_UP").length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👤 Student Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName || user?.fullName || "Student"}!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              📬 Guards will register your parcels when they arrive at the
              hostel
            </p>

            {/* Debug info - Remove in production */}
            <div className="mt-2 text-xs text-gray-400">
              Sync Status: {synced ? "✅ Synced" : "⏳ Syncing..."} | Parcels:{" "}
              {parcels.length} | Last Fetch:{" "}
              {lastFetchTime
                ? new Date(lastFetchTime).toLocaleTimeString()
                : "Never"}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("Profile")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "Profile"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab("Pending")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "Pending"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ⏳ Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab("Picked Up")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "Picked Up"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ✅ Picked Up ({pickedUpCount})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Profile Tab */}
            {activeTab === "Profile" && (
              <div>
                <StudentProfile />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      ⏳ {pendingCount}
                    </div>
                    <div className="text-gray-600">Pending Parcels</div>
                    {pendingCount > 0 && (
                      <button
                        onClick={() => setActiveTab("Pending")}
                        className="mt-2 text-blue-600 text-sm hover:underline"
                      >
                        View Pending &rarr;
                      </button>
                    )}
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ✅ {pickedUpCount}
                    </div>
                    <div className="text-gray-600">Picked Up</div>
                    {pickedUpCount > 0 && (
                      <button
                        onClick={() => setActiveTab("Picked Up")}
                        className="mt-2 text-blue-600 text-sm hover:underline"
                      >
                        View History &rarr;
                      </button>
                    )}
                  </div>
                </div>

                {/* ✅ Information Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    📋 How It Works
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Guards register your parcels when they arrive at the
                      hostel
                    </li>
                    <li>• You'll see them appear in your "Pending" tab</li>
                    <li>
                      • Visit the guard desk with your ID to collect your parcel
                    </li>
                    <li>• Parcels move to "Picked Up" once collected</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Parcels Tabs */}
            {(activeTab === "Pending" || activeTab === "Picked Up") && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {activeTab === "Pending"
                      ? "⏳ Pending Parcels"
                      : "✅ Picked Up Parcels"}
                  </h2>

                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? "🔄 Loading..." : "🔄 Refresh"}
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading parcels...</p>
                  </div>
                ) : !synced ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      🔄 Syncing user with backend...
                    </p>
                  </div>
                ) : filteredParcels.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">
                      {activeTab === "Pending" ? "📭" : "🎉"}
                    </div>
                    <p className="text-gray-500 text-lg">
                      {activeTab === "Pending"
                        ? "No pending parcels"
                        : "No picked up parcels yet"}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      {activeTab === "Pending"
                        ? "Your parcels will appear here when guards register them"
                        : "Completed deliveries will show up here"}
                    </p>
                  </div>
                ) : (
                  <ParcelList
                    parcels={filteredParcels}
                    showStudentName={false}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
