import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export function useSyncClerkUser() {
  const { user, isSignedIn } = useUser();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user || synced) return;

    const alreadySynced = localStorage.getItem("clerk-synced") === "true";
    if (alreadySynced) {
      setSynced(true);
      return;
    }

    const sync = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sync-clerk/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id: user.id,
            name: `${user.username ?? ""}`,
            email: user.emailAddresses[0]?.emailAddress,
            profile_image: user.imageUrl,
          }),
        });
        localStorage.setItem("clerk-synced", "true");
        setSynced(true);
      } catch (err) {
        console.error("❌ Clerk sync failed:", err);
      }
    };

    sync();
  }, [user, isSignedIn, synced]);

  return synced;
}
