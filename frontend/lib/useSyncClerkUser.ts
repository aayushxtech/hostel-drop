"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface Student {
  id: string;
  clerk_id: string;
  name: string;
  email: string;
  profile_image?: string;
  phone?: string;
  hostel_block?: string;
  room_number?: string;
  date_joined: string;
  is_active: boolean;
}

interface SyncResponse {
  student: Student;
  created: boolean;
  message: string;
}

export function useSyncClerkUser() {
  const { user, isSignedIn } = useUser();
  const [synced, setSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user || synced || loading) return;

    const sync = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/sync-clerk/`,
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
          const data: SyncResponse = await response.json();
          console.log(
            `✅ Student ${data.created ? "created" : "updated"}:`,
            data.student
          );
          setStudent(data.student);
          setSynced(true);
        } else {
          const errorText = await response.text();
          console.error("❌ Clerk sync failed:", errorText);
          setError(errorText);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Clerk sync failed:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    sync();
  }, [user, isSignedIn, synced, loading]);

  const updateProfile = async (profileData: {
    phone?: string;
    hostel_block?: string;
    room_number?: string;
  }) => {
    if (!user) return null;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/update-profile/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id: user.id,
            ...profileData,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudent(data.student);
        return data.student;
      } else {
        const errorText = await response.text();
        setError(errorText);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    synced,
    loading,
    student,
    error,
    updateProfile,
  };
}
