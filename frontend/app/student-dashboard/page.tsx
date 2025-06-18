"use client";

import React, { useEffect, useState } from "react";
import ParcelList from "@/components/ParcelList";
import StudentProfile from "@/components/UpdateProfile";
import { useUser } from "@clerk/nextjs";
import { useSyncClerkUser } from "@/lib/useSyncClerkUser";
import HelpRequestList from "@/components/HelpRequestList";

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
    "Profile" | "Pending" | "Picked Up" | "My Requests"
  >("Profile");

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const fetchParcels = async () => {
    if (!user?.id || !synced || !isLoaded) return;

    const now = Date.now();
    if (now - lastFetchTime < 5000) return;

    try {
      setLoading(true);
      setLastFetchTime(now);

      const res = await fetch(`${baseUrl}/parcels/my/?clerk_id=${user.id}`);
      const data = await res.json();

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
          trackingId: p.tracking_id,
          courier: p.service,
          status: p.status,
          createdAt: p.created_at,
          pickedUpTime: p.picked_up_time,
        };
      });

      setParcels(mappedParcels);
    } catch (err) {
      console.error("Error fetching parcels:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Help Request State
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [helpLoading, setHelpLoading] = useState(false);

  const fetchHelpRequests = async () => {
    if (!user?.id) return;

    try {
      setHelpLoading(true);
      const email = user.emailAddresses[0].emailAddress;
      const res = await fetch(`${baseUrl}/support/my/?email=${email}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Help request response is not an array:", data);
        setHelpRequests([]);
        return;
      }

      const sorted = data.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setHelpRequests(sorted);
    } catch (err) {
      console.error("Error fetching help requests:", err);
    } finally {
      setHelpLoading(false);
    }
  };

  //  Fetch data on load
  const [hasFetched, setHasFetched] = useState(false);
  useEffect(() => {
    if (!hasFetched && isLoaded && user?.id && synced) {
      fetchParcels();
      fetchHelpRequests();
      setHasFetched(true);
    }
  }, [isLoaded, user?.id, synced, hasFetched]);

  const handleRefresh = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👤 Student Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName || "Student"}!
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
              {["Profile", "Pending", "Picked Up", "My Requests"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "Pending" && `⏳ ${tab} (${pendingCount})`}
                  {tab === "Picked Up" && `✅ ${tab} (${pickedUpCount})`}
                  {tab === "Profile" && `👤 ${tab}`}
                  {tab === "My Requests" && `📄 ${tab}`}
                </button>
              ))}
            </div>
          </div>

          {/* Profile */}
          {activeTab === "Profile" && (
            <div>
              <StudentProfile />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">
                    ⏳ {pendingCount}
                  </div>
                  <div className="text-gray-600">Pending Parcels</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    ✅ {pickedUpCount}
                  </div>
                  <div className="text-gray-600">Picked Up Parcels</div>
                </div>
              </div>
            </div>
          )}

          {/* Pending / Picked */}
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
                <p className="text-center py-4">Loading...</p>
              ) : filteredParcels.length === 0 ? (
                <p className="text-center py-4">No parcels in this category.</p>
              ) : (
                <ParcelList
                  parcels={filteredParcels}
                  showStudentName={false}
                  showQRCodes={true} // ✅ Enable QR codes for students
                />
              )}
            </div>
          )}

          {/* My Help Requests */}
          {activeTab === "My Requests" && (
            <HelpRequestList
              helpRequests={helpRequests}
              loading={helpLoading}
              onRefresh={fetchHelpRequests}
            />
          )}
        </div>
      </div>
    </div>
  );
}
