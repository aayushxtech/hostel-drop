"use client";
import React from "react";

export type ParcelData = {
  studentName: string;
  roomNo: string;
  trackingId: string;
  courier: string;
  status: string;
  createdAt?: string;
  pickedUpTime?: string;
};

const formatDateTime = (datetime: string) => {
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };
  return new Date(datetime).toLocaleString("en-IN", options);
};

const ParcelCard = ({
  data,
  showStudentName = false,
}: {
  data: ParcelData;
  showStudentName?: boolean;
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-md mt-4 space-y-2">
      {showStudentName && (
        <p>👤 <strong>Name:</strong> {data.studentName || "N/A"}</p>
      )}
      <p>🏢 <strong>Room No:</strong> {data.roomNo || "N/A"}</p>
      <p>🔍 <strong>Tracking ID:</strong> {data.trackingId || "N/A"}</p>
      <p>🚚 <strong>Courier:</strong> {data.courier || "N/A"}</p>
      <p>📬 <strong>Status:</strong> {data.status || "N/A"}</p>

      {data.createdAt && (
        <p>📅 <strong>Created:</strong> {formatDateTime(data.createdAt)}</p>
      )}

      {data.status === "PICKED_UP" && data.pickedUpTime && (
        <p>✅ <strong>Picked Up:</strong> {formatDateTime(data.pickedUpTime)}</p>
      )}
    </div>
  );
};

export default ParcelCard;
