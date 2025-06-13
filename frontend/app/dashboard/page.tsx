"use client";
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
