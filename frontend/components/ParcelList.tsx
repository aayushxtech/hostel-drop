"use client";

import React from "react";
import ParcelCard from "./ParcelCard";
import { ParcelData } from "./ParcelForm";

const ParcelList = ({ parcels }: { parcels: ParcelData[] }) => {
  return (
    <div className="flex flex-col items-center mt-4">
      {parcels.map((parcel, index) => (
        <ParcelCard key={index} data={parcel} />
      ))}
    </div>
  );
};

export default ParcelList;

