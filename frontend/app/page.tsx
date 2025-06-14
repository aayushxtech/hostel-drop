"use client";

import React from "react";
<<<<<<< HEAD
import Link from "next/link";
import { useSyncClerkUser } from "@/lib/useSyncClerkUser";
=======
>>>>>>> 26bfea981fd2d7e08a7f9b7b00c97915a204975d

const Home = () => {
  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6 rounded-xl shadow-md bg-white space-y-4">
        <h1 className="text-4xl font-bold text-blue-500">Home</h1>
        <p className="text-lg">
          {synced ? "✅ User synced to backend" : "🔄 Syncing user..."}
        </p>

        {/* 🚀 Button to go to dashboard */}
        <Link href="/dashboard">
          <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Go to Parcel Register
          </button>
        </Link>
      </div>
=======
    <div>
      <h1>Home</h1>
>>>>>>> 26bfea981fd2d7e08a7f9b7b00c97915a204975d
    </div>
  );
};

export default Home;
