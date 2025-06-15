"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ParcelForm, { ParcelData } from "@/components/ParcelForm";
import ParcelList from "@/components/ParcelList";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [parcels, setParcels] = React.useState<ParcelData[]>([]);

  // ✅ Redirect non-admins
  useEffect(() => {
    if (isLoaded && user) {
      const email = user?.primaryEmailAddress?.emailAddress;
      const isAdmin = email === "admin@gmail.com"; // Replace with your admin email

      if (!isAdmin) {
        router.push("/student-dashboard");
      }
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/parcels/all");
        if (!response.ok) throw new Error("Failed to fetch parcels");

        const data = await response.json();
        console.log("📦 Fetched parcels:", data);

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
        console.error("❌ Error fetching parcels:", err);
      }
    };

    fetchParcels();
  }, []);

  const handleAddParcel = (newParcel: ParcelData) => {
    setParcels((prev) => [...prev, newParcel]);
  };

  return (
    <div className="flex flex-col items-center space-y-10 mt-8">
      <ParcelForm onAddParcel={handleAddParcel} />
      <h2 className="text-2xl font-bold">📦 Parcel Register</h2>
      <ParcelList parcels={parcels} showStudentName />
    </div>
  );
}
