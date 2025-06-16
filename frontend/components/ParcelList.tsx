"use client";

import React from "react";
import ParcelCard from "./ParcelCard";

interface ParcelData {
  id?: number;
  studentName: string;
  roomNo: string;
  block?: string;
  trackingId: string;
  courier: string;
  status: string;
  createdAt?: string;
  pickedUpTime?: string;
}

interface ParcelListProps {
  parcels: ParcelData[];
  showStudentName?: boolean;
  onMarkAsPickedUp?: (parcelId: number) => void;
}

const ParcelList: React.FC<ParcelListProps> = ({
  parcels,
  showStudentName = false,
  onMarkAsPickedUp,
}) => {
  if (parcels.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No parcels to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parcels.map((parcel) => (
        <ParcelCard
          key={parcel.id || `${parcel.trackingId}-${parcel.createdAt}`}
          data={parcel}
          showStudentName={showStudentName}
          onMarkAsPickedUp={onMarkAsPickedUp}
        />
      ))}
    </div>
  );
};

export default ParcelList;
