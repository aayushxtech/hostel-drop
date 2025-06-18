"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  parcelId: number;
  studentName: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  parcelId,
  studentName,
}) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);

  const handleScan = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);
    setScanResult(decodedText);
    onScan(decodedText);
  };

  const handleError = (error: undefined | any) => {
    // Ignore continuous scanning errors
    if (error?.name !== "NotFoundError") {
      console.warn("QR scan error:", error);
    }
  };

  const initializeScanner = () => {
    if (scannerElementRef.current && !scannerRef.current) {
      const scannerId = "qr-scanner";
      scannerElementRef.current.id = scannerId;

      scannerRef.current = new Html5QrcodeScanner(
        scannerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 1,
        },
        false
      );

      scannerRef.current.render(handleScan, handleError);
      setScanning(true);
    }
  };

  const clearScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
      setScanning(false);
    }
  };

  const restartScanner = () => {
    clearScanner();
    setScanResult(null);
    setTimeout(() => {
      initializeScanner();
    }, 500);
  };

  useEffect(() => {
    if (isOpen && !scanning) {
      setScanResult(null);
      setTimeout(() => {
        initializeScanner();
      }, 100);
    } else if (!isOpen) {
      clearScanner();
    }

    return () => {
      clearScanner();
    };
  }, [isOpen]);

  const handleClose = () => {
    clearScanner();
    setScanResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">📱 Scan QR Code for Pickup</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Parcel Info */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-1">
            <strong>📦 Parcel ID:</strong> {parcelId}
          </p>
          <p className="text-sm text-blue-800 mb-2">
            <strong>👤 Student:</strong> {studentName}
          </p>
          <p className="text-xs text-blue-600">
            📍 Position the QR code within the camera frame to scan
          </p>
        </div>

        {/* QR Scanner Container */}
        <div className="mb-4">
          <div ref={scannerElementRef} />
        </div>

        {/* Scan Result Display */}
        {scanResult && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 text-sm">
              <strong>✅ QR Code Detected:</strong>
            </p>
            <p className="text-green-700 text-xs mt-1 break-all">
              {scanResult.length > 100
                ? `${scanResult.substring(0, 100)}...`
                : scanResult}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={restartScanner}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors font-medium"
          >
            🔄 Restart Scan
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-xs">
            <strong>💡 Tips:</strong>
          </p>
          <ul className="text-yellow-700 text-xs mt-1 list-disc list-inside space-y-1">
            <li>Ensure good lighting conditions</li>
            <li>Hold the device steady</li>
            <li>Make sure the QR code is fully visible</li>
            <li>Use the torch button if available in low light</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
