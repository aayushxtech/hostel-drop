"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/Loader";
import ParcelRegistrationForm from "@/components/ParcelRegistrationForm";
import QRScanner from "@/components/QRScanner";

// Add this interface near the top with other interfaces
export type ParcelData = {
  id?: number;
  studentName: string;
  roomNo: string;
  block?: string;
  trackingId: string;
  courier: string;
  status: string;
  createdAt?: string;
  pickedUpTime?: string;
  imageUrl?: string;
};

// ✅ Filter types
interface FilterOptions {
  status: string;
  block: string;
  courier: string;
  dateRange: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// Update the ApiParcelData interface
interface ApiParcelData {
  id: number;
  student?:
    | {
        name: string;
      }
    | string;
  tracking_id?: string;
  description?: string;
  service?: string;
  status: string;
  created_at?: string;
  picked_up_time?: string;
  image?: string;
}

export default function GuardDashboardPage() {
  const { user, isLoaded } = useUser();

  // ✅ Declare ALL hooks at the top level BEFORE any conditional logic
  const [allParcels, setAllParcels] = useState<ParcelData[]>([]);
  const [parcels, setParcels] = useState<ParcelData[]>([]);
  const [filteredParcels, setFilteredParcels] = useState<ParcelData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Add QR Scanner state variables (these were missing!)
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [currentScanningParcel, setCurrentScanningParcel] = useState<{
    id: number;
    studentName: string;
  } | null>(null);
  const [verifyingQR, setVerifyingQR] = useState(false);

  // ✅ Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    status: "PENDING",
    block: "",
    courier: "",
    dateRange: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [stats, setStats] = useState({
    totalParcels: 0,
    pendingParcels: 0,
    pickedUpToday: 0,
  });

  // ✅ Available filter options
  const [filterOptions, setFilterOptions] = useState({
    blocks: [] as string[],
    couriers: [] as string[],
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // ✅ Extract unique values for filter dropdowns
  const extractFilterOptions = useCallback((parcelList: ParcelData[]) => {
    const blocks = Array.from(
      new Set(parcelList.map((p) => p.block).filter(Boolean))
    );
    const couriers = Array.from(
      new Set(parcelList.map((p) => p.courier).filter(Boolean))
    );

    setFilterOptions({
      blocks: blocks.sort(),
      couriers: couriers.sort(),
    });
  }, []);

  // ✅ Apply filters and search
  const applyFiltersAndSearch = useCallback(
    (
      parcelList: ParcelData[],
      searchTerm: string,
      filterOptions: FilterOptions
    ) => {
      let filtered = [...parcelList];

      // Apply search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (parcel) =>
            parcel.studentName.toLowerCase().includes(query) ||
            parcel.trackingId.toLowerCase().includes(query) ||
            parcel.roomNo.toLowerCase().includes(query) ||
            parcel.courier.toLowerCase().includes(query) ||
            (parcel.block && parcel.block.toLowerCase().includes(query))
        );
      }

      // Apply filters
      if (filterOptions.status && filterOptions.status !== "ALL") {
        filtered = filtered.filter(
          (parcel) => parcel.status === filterOptions.status
        );
      }

      if (filterOptions.block) {
        filtered = filtered.filter(
          (parcel) => parcel.block === filterOptions.block
        );
      }

      if (filterOptions.courier) {
        filtered = filtered.filter(
          (parcel) => parcel.courier === filterOptions.courier
        );
      }

      // Apply date range filter
      if (filterOptions.dateRange) {
        const today = new Date();
        const filterDate = new Date();

        switch (filterOptions.dateRange) {
          case "today":
            filterDate.setHours(0, 0, 0, 0);
            break;
          case "yesterday":
            filterDate.setDate(today.getDate() - 1);
            filterDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            filterDate.setDate(today.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(today.getMonth() - 1);
            break;
        }

        filtered = filtered.filter((parcel) => {
          const parcelDate = new Date(parcel.createdAt || "");
          return parcelDate >= filterDate;
        });
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (filterOptions.sortBy) {
          case "studentName":
            aValue = a.studentName.toLowerCase();
            bValue = b.studentName.toLowerCase();
            break;
          case "roomNo":
            aValue = a.roomNo;
            bValue = b.roomNo;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "createdAt":
          default:
            aValue = new Date(a.createdAt || "").getTime();
            bValue = new Date(b.createdAt || "").getTime();
            break;
        }

        if (filterOptions.sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      return filtered;
    },
    []
  );

  // ✅ Fetch ALL parcels
  const fetchParcels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${baseUrl}/parcels/all/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch parcels: ${response.statusText}`);
      }

      const data: ApiParcelData[] = await response.json();

      const transformedParcels: ParcelData[] = data.map((parcel) => ({
        id: parcel.id,
        studentName:
          typeof parcel.student === "object" && parcel.student?.name
            ? parcel.student.name
            : String(parcel.student || "Unknown"),
        roomNo: "N/A", // You might need to add this to your API
        block: "N/A", // You might need to add this to your API
        trackingId: parcel.tracking_id || "N/A",
        courier: parcel.service || "Unknown",
        status: parcel.status,
        createdAt: parcel.created_at,
        pickedUpTime: parcel.picked_up_time,
        imageUrl: parcel.image,
      }));

      setAllParcels(transformedParcels);
      extractFilterOptions(transformedParcels);

      const filtered = applyFiltersAndSearch(
        transformedParcels,
        searchQuery,
        filters
      );
      setFilteredParcels(filtered);

      // Calculate stats
      const totalParcels = transformedParcels.length;
      const pendingParcels = transformedParcels.filter(
        (p) => p.status === "PENDING"
      ).length;
      const today = new Date().toDateString();
      const pickedUpToday = transformedParcels.filter(
        (p) =>
          p.status === "PICKED_UP" &&
          p.pickedUpTime &&
          new Date(p.pickedUpTime).toDateString() === today
      ).length;

      setStats({ totalParcels, pendingParcels, pickedUpToday });
    } catch (err) {
      console.error("Error fetching parcels:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch parcels");
    } finally {
      setLoading(false);
    }
  }, [
    baseUrl,
    searchQuery,
    filters,
    applyFiltersAndSearch,
    extractFilterOptions,
  ]);

  // ✅ Handle search input changes
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);

      const filtered = applyFiltersAndSearch(allParcels, query, filters);
      setFilteredParcels(filtered);
    },
    [allParcels, filters, applyFiltersAndSearch]
  );

  // ✅ Handle filter changes
  const handleFilterChange = useCallback(
    (key: keyof FilterOptions, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      const filtered = applyFiltersAndSearch(
        allParcels,
        searchQuery,
        newFilters
      );
      setFilteredParcels(filtered);
    },
    [filters, allParcels, searchQuery, applyFiltersAndSearch]
  );

  // ✅ Handle QR scan result and verify
  const handleQRScan = useCallback(
    async (scannedData: string) => {
      if (!currentScanningParcel) return;

      try {
        setVerifyingQR(true);
        console.log("Scanned QR data:", scannedData);

        // Parse the scanned QR data (it should be a signed token)
        const response = await fetch(`${baseUrl}/parcels/verify-qr/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: scannedData.trim(),
          }),
        });

        const result = await response.json();

        if (response.ok && result.valid) {
          // Success - parcel was marked as picked up
          setShowQRScanner(false);
          setCurrentScanningParcel(null);

          // Refresh the parcels list
          fetchParcels();

          alert(
            `✅ ${result.message}\n\nParcel Details:\n` +
              `• Student: ${result.parcel.student_name}\n` +
              `• Room: ${result.parcel.student_block} - ${result.parcel.student_room}\n` +
              `• Tracking ID: ${result.parcel.tracking_id}\n` +
              `• Picked up at: ${new Date(
                result.parcel.picked_up_at
              ).toLocaleString()}`
          );
        } else {
          // Handle different error cases
          let errorMessage = result.message || "Invalid QR code";

          if (result.reason === "expired") {
            errorMessage = "⏰ QR code has expired. Please generate a new one.";
          } else if (result.reason === "already_picked") {
            errorMessage = "📦 This parcel has already been picked up.";
          } else if (result.reason === "tampered") {
            errorMessage =
              "🚫 Invalid QR code. The code may have been tampered with.";
          }

          alert(`❌ ${errorMessage}`);
        }
      } catch (err) {
        console.error("Error verifying QR code:", err);
        alert("❌ Failed to verify QR code. Please try again.");
      } finally {
        setVerifyingQR(false);
      }
    },
    [currentScanningParcel, baseUrl, fetchParcels]
  );

  // ✅ Modified handleMarkAsPickedUp to open QR scanner
  const handleMarkAsPickedUp = useCallback(
    (parcelId: number, studentName: string) => {
      setCurrentScanningParcel({ id: parcelId, studentName });
      setShowQRScanner(true);
    },
    []
  );

  // ✅ Close QR scanner
  const handleCloseQRScanner = useCallback(() => {
    setShowQRScanner(false);
    setCurrentScanningParcel(null);
    setVerifyingQR(false);
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    if (isLoaded && user) {
      fetchParcels();
    }
  }, [isLoaded, user, fetchParcels]);

  // Check authentication
  if (!isLoaded) return <LoadingSpinner />;
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🛡️ Guard Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome,{" "}
                {user.firstName || user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ➕ Register New Parcel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Parcels</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalParcels}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Pending Pickup</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingParcels}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Picked Up Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pickedUpToday}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search parcels (student name, tracking ID, room, courier)..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              🔧 {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status:
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PICKED_UP">Picked Up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block:
                </label>
                <select
                  value={filters.block}
                  onChange={(e) => handleFilterChange("block", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Blocks</option>
                  {filterOptions.blocks.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courier:
                </label>
                <select
                  value={filters.courier}
                  onChange={(e) =>
                    handleFilterChange("courier", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Couriers</option>
                  {filterOptions.couriers.map((courier) => (
                    <option key={courier} value={courier}>
                      {courier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range:
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By:
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    handleFilterChange("sortBy", sortBy);
                    handleFilterChange("sortOrder", sortOrder);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="studentName-asc">Student A-Z</option>
                  <option value="studentName-desc">Student Z-A</option>
                  <option value="status-asc">Status A-Z</option>
                  <option value="roomNo-asc">Room Number</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Parcels List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              📋 Parcels List ({filteredParcels.length})
            </h2>
            <div className="text-sm text-gray-600">
              Showing {filteredParcels.length} of {stats.totalParcels} parcels
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">❌ {error}</p>
              <button
                onClick={fetchParcels}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="space-y-4">
            {filteredParcels.map((parcel) => (
              <div
                key={parcel.id}
                className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-gray-600">Student</p>
                      <p className="font-medium">{parcel.studentName}</p>
                      <p className="text-sm text-gray-500">
                        {parcel.block} - {parcel.roomNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tracking ID</p>
                      <p className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                        {parcel.trackingId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Courier</p>
                      <p className="font-medium">{parcel.courier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          parcel.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {parcel.status === "PENDING"
                          ? "⏳ Pending"
                          : "✅ Picked Up"}
                      </span>
                    </div>
                  </div>

                  {parcel.status === "PICKED_UP" && parcel.pickedUpTime && (
                    <div className="text-sm text-gray-600">
                      <p>Picked up:</p>
                      <p>{new Date(parcel.pickedUpTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {parcel.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={parcel.imageUrl}
                      alt="Parcel"
                      className="w-32 h-24 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            ))}

            {!loading && filteredParcels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">📭 No parcels found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchQuery || Object.values(filters).some((f) => f)
                    ? "Try adjusting your search or filters"
                    : "No parcels have been registered yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <ParcelRegistrationForm
          isOpen={showRegistrationForm}
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={fetchParcels}
        />
      )}

      {/* ✅ QR Scanner Modal */}
      {showQRScanner && currentScanningParcel && (
        <QRScanner
          isOpen={showQRScanner}
          onClose={handleCloseQRScanner}
          onScan={handleQRScan}
          parcelId={currentScanningParcel.id}
          studentName={currentScanningParcel.studentName}
        />
      )}
    </div>
  );
}
