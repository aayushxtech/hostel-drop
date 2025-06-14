"use client";

import React from "react";
import Link from "next/link";
import { useSyncClerkUser } from "@/lib/useSyncClerkUser";

const Home = () => {
  const synced = useSyncClerkUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6 rounded-xl shadow-md bg-white space-y-4">
        <h1 className="text-4xl font-bold text-blue-500">Home</h1>
        <p className="text-lg">
          {synced ? "✅ User synced to backend" : "🔄 Syncing user..."}
        </p>

        {/* Staff Dashboard Button */}
        <Link href="/dashboard">
          <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Go to Parcel Register
          </button>
        </Link>

        {/* Student Dashboard Button */}
        <Link href="/student-dashboard">
          <button className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Go to My Parcels
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
