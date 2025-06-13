"use client";

import React from "react";
import { useSyncClerkUser } from "@/lib/useSyncClerkUser";

const Home = () => {
  const synced = useSyncClerkUser();

  return (
    <div>
      <h1>Home</h1>
      <p>{synced ? "✅ User synced to backend" : "🔄 Syncing user..."}</p>
    </div>
  );
};

export default Home;
