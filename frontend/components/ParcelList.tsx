"use client";

import React from "react";
import ParcelCard from "./ParcelCard";
import { ParcelData } from "./ParcelForm";

const ParcelList = ({
  parcels,
  showStudentName = false,
}: {
  parcels: ParcelData[];
  showStudentName?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center mt-4">
      {parcels.map((parcel, index) => (
        <ParcelCard key={index} data={parcel} showStudentName={showStudentName} />
      ))}
    </div>
  );
};

export default ParcelList;
