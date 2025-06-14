"use client";

import React, { useState } from "react";

export type ParcelData = {
  studentName: string;
  roomNo: string;
  trackingId: string;
  courier: string;
  status: string;
};

const ParcelForm = ({ onAddParcel }: { onAddParcel: (parcel: ParcelData) => void }) => {
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

    try {
      const response = await fetch("http://127.0.0.1:8000/parcels/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: form.studentName,
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

      // Add to dashboard state
      onAddParcel(form);

      alert("✅ Parcel submitted successfully!");

      // Reset form
      setForm({
        studentName: "",
        roomNo: "",
        trackingId: "",
        courier: "",
        status: "Pending",
      });

    } catch (err) {
      console.error("❌ Error submitting parcel:", err);
      alert("❌ Failed to submit parcel. Please try again.");
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
