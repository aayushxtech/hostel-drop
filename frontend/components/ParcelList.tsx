"use client";

import React, { useState } from "react";
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
  showQRCodes?: boolean; // ✅ New prop to control QR display
}

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const ParcelList: React.FC<ParcelListProps> = ({
  parcels,
  showStudentName = false,
  onMarkAsPickedUp,
  showQRCodes = false, // ✅ Default to false
}) => {
  const [qrImages, setQrImages] = useState<{ [key: number]: string }>({});
  const [loadingQR, setLoadingQR] = useState<{ [key: number]: boolean }>({});
  const [showQRFor, setShowQRFor] = useState<{ [key: number]: boolean }>({});

  const fetchQRCode = async (parcelId: number) => {
    if (qrImages[parcelId] || loadingQR[parcelId]) return;

    try {
      setLoadingQR((prev) => ({ ...prev, [parcelId]: true }));

      const response = await fetch(`${baseUrl}/parcels/qr/${parcelId}/base64/`);

      if (!response.ok) {
        throw new Error("Failed to fetch QR code");
      }

      const data = await response.json();
      setQrImages((prev) => ({ ...prev, [parcelId]: data.qr_code }));
    } catch (error) {
      console.error("Error fetching QR code:", error);
      alert("❌ Failed to load QR code. Please try again.");
    } finally {
      setLoadingQR((prev) => ({ ...prev, [parcelId]: false }));
    }
  };

  const toggleQRDisplay = (parcelId: number) => {
    const isCurrentlyShowing = showQRFor[parcelId];

    if (!isCurrentlyShowing) {
      fetchQRCode(parcelId);
    }

    setShowQRFor((prev) => ({ ...prev, [parcelId]: !isCurrentlyShowing }));
  };

  const downloadQR = (parcelId: number) => {
    window.open(`${baseUrl}/parcels/qr/${parcelId}/`, "_blank");
  };

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
        <div key={parcel.id || `${parcel.trackingId}-${parcel.createdAt}`}>
          {/* ✅ Original ParcelCard */}
          <ParcelCard
            data={parcel}
            showStudentName={showStudentName}
            onMarkAsPickedUp={onMarkAsPickedUp}
          />

          {/* ✅ QR Code Section - Only show for PENDING parcels and when showQRCodes is true */}
          {showQRCodes && parcel.status === "PENDING" && parcel.id && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">
                  📱 QR Code for Pickup
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleQRDisplay(parcel.id!)}
                    disabled={loadingQR[parcel.id!]}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors disabled:opacity-50"
                  >
                    {loadingQR[parcel.id!] ? (
                      <>⏳ Loading...</>
                    ) : showQRFor[parcel.id!] ? (
                      <>👁️ Hide QR</>
                    ) : (
                      <>📄 Show QR</>
                    )}
                  </button>

                  <button
                    onClick={() => downloadQR(parcel.id!, parcel.trackingId)}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                    title="Download QR Code"
                  >
                    💾 Download
                  </button>
                </div>
              </div>

              {/* ✅ QR Code Display */}
              {showQRFor[parcel.id!] && qrImages[parcel.id!] && (
                <div className="text-center">
                  <div className="inline-block p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <img
                      src={qrImages[parcel.id!]}
                      alt={`QR Code for ${parcel.trackingId}`}
                      className="w-48 h-48 mx-auto"
                    />
                    <p className="mt-2 text-xs text-gray-600">
                      Tracking ID: {parcel.trackingId}
                    </p>
                    <p className="text-xs text-gray-500">Valid for 48 hours</p>
                  </div>

                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <p>
                      <strong>💡 Instructions:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Present this QR code to the guard for pickup</li>
                      <li>Ensure good lighting when scanning</li>
                      <li>QR code expires after 48 hours</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ✅ Loading State */}
              {loadingQR[parcel.id!] && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-blue-600 text-sm mt-2">
                    Generating QR Code...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ParcelList;
