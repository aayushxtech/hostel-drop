"use client";
<<<<<<< HEAD

import React, { useEffect, useState } from "react";
import ParcelForm, { ParcelData } from "@/components/ParcelForm";
import ParcelList from "@/components/ParcelList";

export default function DashboardPage() {
  const [parcels, setParcels] = useState<ParcelData[]>([]);

  // Fetch all parcels from backend when page loads
  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/parcels/all");
        if (!response.ok) throw new Error("Failed to fetch parcels");

        const data = await response.json();
        console.log("📦 Fetched parcels:", data);

        // Map backend fields to ParcelData type
        const mappedParcels = data.map((p: any) => {
          // Default values
          let roomNo = "N/A";
          let trackingId = "N/A";

          // Parse room number and tracking ID from description
          if (p.description) {
            const roomMatch = p.description.match(/Room No: (.*)/);
            const trackingMatch = p.description.match(/Tracking ID: ([^|]+)/);

            if (roomMatch) roomNo = roomMatch[1].trim();
            if (trackingMatch) trackingId = trackingMatch[1].trim();
          }

          return {
            studentName: p.student,
            roomNo,
            trackingId,
            courier: p.service,
            status: p.status,
          };
        });

        setParcels(mappedParcels);
      } catch (err) {
        console.error("❌ Error fetching parcels:", err); // Shows real error
      }
    };

    fetchParcels();
  }, []);

  // Update state with new parcel after form submission
  const handleAddParcel = (newParcel: ParcelData) => {
    setParcels((prev) => [...prev, newParcel]);
  };

  return (
    <div className="flex flex-col items-center space-y-10 mt-8">
      <ParcelForm onAddParcel={handleAddParcel} />
      <h2 className="text-2xl font-bold">📦 Parcel Register</h2>
      <ParcelList parcels={parcels} />
    </div>
  );
}
=======
import React from "react";
import { useSyncClerkUser } from "@/lib/useSyncClerkUser";

const Dashboard = () => {
  const synced = useSyncClerkUser();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{synced ? "✅ User synced to backend" : "🔄 Syncing user..."}</p>
    </div>
  );
};

export default Dashboard;
>>>>>>> 26bfea981fd2d7e08a7f9b7b00c97915a204975d
