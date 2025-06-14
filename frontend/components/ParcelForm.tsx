"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";

export type ParcelData = {
  studentName: string;
  roomNo: string;
  trackingId: string;
  courier: string;
  status: string;
};

const ParcelForm = ({ onAddParcel }: { onAddParcel: (parcel: ParcelData) => void }) => {
  const { user } = useUser();
  const [form, setForm] = useState<ParcelData>({
    studentName: "",
    roomNo: "",
    trackingId: "",
    courier: "",
    status: "Pending",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("❌ User not authenticated.");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/students/get-id?clerk_id=${user.id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch student_id");
      }

      const student_id = data.student_id;

      const response = await fetch("http://127.0.0.1:8000/parcels/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id,
          description: `Room No: ${form.roomNo} | Tracking ID: ${form.trackingId}`,
          service: form.courier,
          status: form.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit parcel");
      }

      const result = await response.json();
      console.log("✅ Parcel saved:", result);

      onAddParcel(form);
      alert("✅ Parcel submitted successfully!");

      setForm({
        studentName: "",
        roomNo: "",
        trackingId: "",
        courier: "",
        status: "Pending",
      });
    } catch (err: any) {
      console.error("❌ Error:", err);
      alert("❌ Failed to submit parcel. " + err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center text-blue-600">Add Parcel Details</h2>

      <input
        type="text"
        name="studentName"
        placeholder="Student Name"
        value={form.studentName}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="roomNo"
        placeholder="Room Number"
        value={form.roomNo}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="trackingId"
        placeholder="Tracking ID"
        value={form.trackingId}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="courier"
        placeholder="Courier Name"
        value={form.courier}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="Pending">Pending</option>
        <option value="Delivered">Delivered</option>
      </select>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
        Submit
      </button>
    </form>
  );
};

export default ParcelForm;
