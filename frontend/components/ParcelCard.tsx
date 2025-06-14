"use client";
import React from "react";

type ParcelData = {
  studentName: string;
  roomNo: string;
  trackingId: string;
  courier: string;
  status: string;
};

const ParcelCard = ({ data }: { data: ParcelData }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-md mt-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{data.studentName}</h2>
      <p>📦 <strong>Tracking ID:</strong> {data.trackingId}</p>
      <p>🏢 <strong>Room No:</strong> {data.roomNo}</p>
      <p>🚚 <strong>Courier:</strong> {data.courier}</p>
      <p>📬 <strong>Status:</strong> {data.status}</p>
    </div>
  );
};

export default ParcelCard;
