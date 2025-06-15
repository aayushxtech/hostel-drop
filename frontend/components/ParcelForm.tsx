"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export type ParcelData = {
  roomNo: string;
  trackingId: string;
  courier: string;
  status: string;
};

const ParcelForm = ({ onAddParcel }: { onAddParcel: (data: ParcelData) => void }) => {
  const { user, isLoaded } = useUser();

  const [studentId, setStudentId] = useState(""); // ✅ Holds UUID from Django
  const [studentName, setStudentName] = useState(""); // Just for display
  const [formData, setFormData] = useState<ParcelData>({
    roomNo: "",
    trackingId: "",
    courier: "",
    status: "PENDING",
  });

  // Fetch student_id (UUID) using Clerk ID
  useEffect(() => {
    const fetchStudentId = async () => {
      if (isLoaded && user) {
        const clerkId = user.id;
        try {
          const res = await fetch(`http://127.0.0.1:8000/students/sync-clerk/?clerk_id=${clerkId}`);
          const data = await res.json();
          setStudentId(data.id); // UUID
          setStudentName(data.name); // Display name
        } catch (err) {
          console.error("❌ Failed to fetch student UUID:", err);
        }
      }
    };

    fetchStudentId();
  }, [isLoaded, user]);

  //  Update inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit correct payload with student_id (UUID)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const description = `Room No: ${formData.roomNo} | Tracking ID: ${formData.trackingId}`;

    const payload = {
      student_id: studentId, // Correct UUID
      service: formData.courier,
      description,
      status: formData.status,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/parcels/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit");

      onAddParcel(formData);
      setFormData({
        roomNo: "",
        trackingId: "",
        courier: "",
        status: "PENDING",
      });
    } catch (err) {
      console.error("❌ Error submitting parcel:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
    >
      <h2 className="text-xl font-bold">📬 New Parcel</h2>

      {/* Display student name (non-editable) */}
      <input
        type="text"
        value={studentName || ""}
        disabled
        className="w-full border p-2 rounded bg-gray-100 text-gray-700"
        placeholder="Student Name"
      />

      <input
        type="text"
        name="roomNo"
        placeholder="Room No"
        value={formData.roomNo}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="trackingId"
        placeholder="Tracking ID"
        value={formData.trackingId}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="courier"
        placeholder="Courier Service"
        value={formData.courier}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option value="PENDING">Pending</option>
        <option value="PICKED_UP">Picked Up</option>
      </select>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        disabled={!studentId}
      >
        Submit Parcel
      </button>
    </form>
  );
};

export default ParcelForm;
