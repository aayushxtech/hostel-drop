"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export function useSyncClerkUser() {
  const { user, isSignedIn } = useUser();
  const [synced, setSynced] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user || synced || loading) return;

    const sync = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/sync-clerk/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clerk_id: user.id,
              name: `${user.firstName ?? ""}${
                user.lastName ? ` ${user.lastName}` : ""
              }`.trim(),
              email: user.emailAddresses[0]?.emailAddress,
              profile_image: user.imageUrl,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(
            `✅ Student ${data.created ? "created" : "updated"}:`,
            data.student
          );
          setSynced(true);
        } else {
          console.error("❌ Clerk sync failed:", await response.text());
        }
      } catch (err) {
        console.error("❌ Clerk sync failed:", err);
      } finally {
        setLoading(false);
      }
    };

    sync();
  }, [user, isSignedIn, synced, loading]);

  return { synced, loading };
}
