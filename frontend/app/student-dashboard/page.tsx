"use client";

import React, { useEffect, useState } from "react";
import ParcelList from "@/components/ParcelList";
import { useUser } from "@clerk/nextjs";
import { useSyncClerkUser } from "@/lib/useSyncClerkUser";
import { ParcelData } from "@/components/ParcelForm";

export default function StudentDashboardPage() {
  const { user } = useUser(); // Clerk user info
  const synced = useSyncClerkUser(); // Sync with Django
  const [parcels, setParcels] = useState<ParcelData[]>([]);

  useEffect(() => {
    const fetchParcels = async () => {
      if (!user?.id || !synced) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/parcels/my?clerk_id=${user.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch parcels");

        const data = await response.json();
        console.log("📦 Student parcels:", data);

        // Map backend to ParcelData type
        const mappedParcels = data.map((p: any) => {
          let roomNo = "N/A";
          let trackingId = "N/A";

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
        console.error("❌ Error fetching student parcels:", err);
      }
    };

    fetchParcels();
  }, [user, synced]);

  return (
    <div className="flex flex-col items-center mt-8 space-y-8">
      <h2 className="text-2xl font-bold">
        👤 {user?.fullName || "Student"}'s Parcels
      </h2>
      {synced ? (
        <ParcelList parcels={parcels} />
      ) : (
        <p>🔄 Syncing user with backend...</p>
      )}
    </div>
  );
}
