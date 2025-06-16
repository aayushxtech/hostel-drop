"use client";

import React, { useCallback, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ParcelRegistrationForm from "@/components/ParcelRegisterationForm";

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

export default function GuardDashboardPage() {
  const { user, isLoaded } = useUser();
  if (user?.primaryEmailAddress?.emailAddress !== "admin@example.com") {
    return redirect("/403"); // Redirect to 403 page if not admin
  }

  const [allParcels, setAllParcels] = useState<ParcelData[]>([]); // ✅ Store all parcels
  const [parcels, setParcels] = useState<ParcelData[]>([]); // ✅ Currently displayed parcels
  const [filteredParcels, setFilteredParcels] = useState<ParcelData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // ✅ Toggle filter panel

  // ✅ Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    status: "PENDING", // Default to pending only
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

  // ✅ Available filter options (extracted from data)
  const [filterOptions, setFilterOptions] = useState({
    blocks: [] as string[],
    couriers: [] as string[],
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // ✅ Extract unique values for filter dropdowns
  const extractFilterOptions = useCallback((parcelList: ParcelData[]) => {
    const blocks = [
      ...new Set(
        parcelList.map((p) => p.block).filter((b) => b && b !== "N/A")
      ),
    ].sort();
    const couriers = [
      ...new Set(
        parcelList
          .map((p) => p.courier)
          .filter((c) => c && c !== "Unknown Service")
      ),
    ].sort();

    setFilterOptions({ blocks, couriers });
  }, []);

  // ✅ Apply filters and search
  const applyFiltersAndSearch = useCallback(
    (
      parcelList: ParcelData[],
      searchTerm: string,
      filterOptions: FilterOptions
    ) => {
      let filtered = [...parcelList];

      // Status filter
      if (filterOptions.status && filterOptions.status !== "ALL") {
        filtered = filtered.filter((p) => p.status === filterOptions.status);
      }

      // Block filter
      if (filterOptions.block) {
        filtered = filtered.filter((p) => p.block === filterOptions.block);
      }

      // Courier filter
      if (filterOptions.courier) {
        filtered = filtered.filter((p) => p.courier === filterOptions.courier);
      }

      // Date range filter
      if (filterOptions.dateRange) {
        const now = new Date();
        const startDate = new Date();

        switch (filterOptions.dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "yesterday":
            startDate.setDate(now.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
        }

        if (filterOptions.dateRange !== "") {
          filtered = filtered.filter((p) => {
            const parcelDate = new Date(p.createdAt || "");
            return parcelDate >= startDate;
          });
        }
      }

      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter((parcel) => {
          return (
            parcel.studentName.toLowerCase().includes(searchLower) ||
            parcel.trackingId.toLowerCase().includes(searchLower) ||
            parcel.roomNo.toLowerCase().includes(searchLower) ||
            (parcel.block || "").toLowerCase().includes(searchLower) ||
            parcel.courier.toLowerCase().includes(searchLower)
          );
        });
      }

      // Sorting
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filterOptions.sortBy) {
          case "studentName":
            aValue = a.studentName.toLowerCase();
            bValue = b.studentName.toLowerCase();
            break;
          case "createdAt":
            aValue = new Date(a.createdAt || "");
            bValue = new Date(b.createdAt || "");
            break;
          case "roomNo":
            aValue = a.roomNo;
            bValue = b.roomNo;
            break;
          case "block":
            aValue = a.block || "";
            bValue = b.block || "";
            break;
          case "courier":
            aValue = a.courier;
            bValue = b.courier;
            break;
          default:
            aValue = a.createdAt;
            bValue = b.createdAt;
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

  // ✅ Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = applyFiltersAndSearch(allParcels, query, filters);
    setFilteredParcels(filtered);
  };

  // ✅ Handle filter changes
  const handleFilterChange = (
    filterKey: keyof FilterOptions,
    value: string | "asc" | "desc"
  ) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);

    const filtered = applyFiltersAndSearch(allParcels, searchQuery, newFilters);
    setFilteredParcels(filtered);
  };

  // ✅ Clear all filters and search
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "PENDING",
      block: "",
      courier: "",
      dateRange: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    const pendingOnly = allParcels.filter((p) => p.status === "PENDING");
    const sorted = applyFiltersAndSearch(pendingOnly, "", {
      status: "PENDING",
      block: "",
      courier: "",
      dateRange: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setFilteredParcels(sorted);
  };

  // ✅ Fetch ALL parcels and use proper tracking_id from backend
  const fetchParcels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching all parcels...");

      const resp = await fetch(`${baseUrl}/parcels/all/`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      console.log("📦 Raw backend data:", data);

      // ✅ Updated data mapping
      const mapped: ParcelData[] = data.map((p: any) => {
        let roomNo = "N/A";
        let block = "N/A";

        if (p.description) {
          const roomMatch = p.description.match(/Room No:\s*([^|]+)/);
          const blockMatch = p.description.match(/Block:\s*([^|]+)/);

          if (roomMatch) roomNo = roomMatch[1].trim();
          if (blockMatch) block = blockMatch[1].trim();
        }

        let studentName = "Unknown Student";
        if (p.student) {
          if (typeof p.student === "string") {
            studentName = p.student;
          } else if (p.student.name) {
            studentName = p.student.name;
          }
        }

        return {
          id: p.id,
          studentName: studentName,
          roomNo: roomNo,
          block: block,
          trackingId: p.tracking_id || "N/A",
          courier: p.service || "Unknown Service",
          status: p.status,
          createdAt: p.created_at,
          pickedUpTime: p.picked_up_time,
        };
      });

      // ✅ Store all parcels
      setAllParcels(mapped);

      // ✅ Extract filter options
      extractFilterOptions(mapped);

      // ✅ Apply current filters
      const filtered = applyFiltersAndSearch(mapped, searchQuery, filters);
      setFilteredParcels(filtered);

      // ✅ Calculate stats from all parcels
      const today = new Date().toDateString();
      const pickedUpToday = mapped.filter(
        (p) =>
          p.status === "PICKED_UP" &&
          p.pickedUpTime &&
          new Date(p.pickedUpTime).toDateString() === today
      ).length;

      const pendingParcels = mapped.filter((p) => p.status === "PENDING");
      setParcels(pendingParcels); // For backward compatibility

      setStats({
        totalParcels: mapped.length,
        pendingParcels: pendingParcels.length,
        pickedUpToday: pickedUpToday,
      });

      console.log("✅ Mapped all parcels:", mapped.length);
    } catch (e) {
      console.error("❌ Error fetching parcels:", e);
      setError((e as Error).message);
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

  useEffect(() => {
    if (isLoaded) fetchParcels();
  }, [isLoaded, fetchParcels]);

  // ✅ Handle parcel pickup verification
  const handleMarkAsPickedUp = async (parcelId: number) => {
    try {
      console.log(`🔐 Marking parcel ${parcelId} as picked up...`);

      const response = await fetch(
        `${baseUrl}/parcels/${parcelId}/picked-up/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Parcel marked as picked up:", result);

      // ✅ Update all parcels and reapply filters
      const updatedAllParcels = allParcels.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              status: "PICKED_UP",
              pickedUpTime: new Date().toISOString(),
            }
          : p
      );

      setAllParcels(updatedAllParcels);

      const filtered = applyFiltersAndSearch(
        updatedAllParcels,
        searchQuery,
        filters
      );
      setFilteredParcels(filtered);

      setStats((prev) => ({
        ...prev,
        pendingParcels: prev.pendingParcels - 1,
        pickedUpToday: prev.pickedUpToday + 1,
      }));

      alert("Parcel marked as picked up successfully!");
    } catch (err) {
      console.error("❌ Error marking parcel as picked up:", err);
      alert("Failed to update parcel status");
    }
  };

  // ✅ Handle new parcel registration
  const handleParcelAdded = () => {
    console.log("📦 New parcel added, refreshing data...");
    fetchParcels();
    setShowRegistrationForm(false);
  };

  // ✅ Toggle form visibility
  const toggleRegistrationForm = () => {
    setShowRegistrationForm(!showRegistrationForm);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🛡️ Guard Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome, {user?.firstName || user?.fullName || "Guard"}! Register
              new parcels and manage pickups.
            </p>
          </div>

          {/* ✅ Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                📦 {stats.totalParcels}
              </div>
              <div className="text-gray-600">Total Parcels</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                ⏳ {stats.pendingParcels}
              </div>
              <div className="text-gray-600">Pending Pickups</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ✅ {stats.pickedUpToday}
              </div>
              <div className="text-gray-600">Picked Up Today</div>
            </div>
          </div>

          {/* ✅ Add Parcel Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={toggleRegistrationForm}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                showRegistrationForm
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {showRegistrationForm
                ? "✖️ Cancel Registration"
                : "➕ Add New Parcel"}
            </button>
          </div>

          {/* ✅ Registration Form */}
          {showRegistrationForm && (
            <div className="mb-8">
              <div className="max-w-2xl mx-auto">
                <ParcelRegistrationForm onParcelAdded={handleParcelAdded} />
              </div>
            </div>
          )}

          {/* ✅ Parcels Section with Filters */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Parcels ({filteredParcels.length})
                {(searchQuery ||
                  filters.status !== "PENDING" ||
                  filters.block ||
                  filters.courier ||
                  filters.dateRange) && (
                  <span className="text-lg font-normal text-blue-600 ml-2">
                    • Filtered
                  </span>
                )}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded transition-colors text-sm ${
                    showFilters
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  🔍 {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
                <button
                  onClick={fetchParcels}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* ✅ Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by name, tracking ID, room, block, or courier..."
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      const filtered = applyFiltersAndSearch(
                        allParcels,
                        "",
                        filters
                      );
                      setFilteredParcels(filtered);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* ✅ Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="PICKED_UP">Picked Up</option>
                    </select>
                  </div>

                  {/* Block Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Block
                    </label>
                    <select
                      value={filters.block}
                      onChange={(e) =>
                        handleFilterChange("block", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Blocks</option>
                      {filterOptions.blocks.map((block) => (
                        <option key={block} value={block}>
                          {block}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Courier Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Courier
                    </label>
                    <select
                      value={filters.courier}
                      onChange={(e) =>
                        handleFilterChange("courier", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Couriers</option>
                      {filterOptions.couriers.map((courier) => (
                        <option key={courier} value={courier}>
                          {courier}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) =>
                        handleFilterChange("dateRange", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="studentName">Student Name</option>
                      <option value="roomNo">Room Number</option>
                      <option value="block">Block</option>
                      <option value="courier">Courier</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) =>
                        handleFilterChange(
                          "sortOrder",
                          e.target.value as "asc" | "desc"
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    🗑️ Clear All Filters
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading parcels...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p className="font-semibold">Error loading parcels</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={fetchParcels}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* ✅ No Results */}
            {!loading &&
              !error &&
              filteredParcels.length === 0 &&
              allParcels.length > 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 text-lg">
                    No parcels match your filters
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

            {/* Empty State */}
            {!loading && !error && allParcels.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg">No parcels found</p>
                <p className="text-gray-400 text-sm">
                  Start by registering your first parcel
                </p>
                <button
                  onClick={toggleRegistrationForm}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Register New Parcel
                </button>
              </div>
            )}

            {/* ✅ Parcels List */}
            {!loading && !error && filteredParcels.length > 0 && (
              <div className="space-y-4">
                {filteredParcels.map((parcel) => (
                  <div
                    key={parcel.id}
                    className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {parcel.status === "PENDING" ? "📦" : "✅"}
                        </span>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {parcel.studentName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {parcel.block && parcel.block !== "N/A"
                              ? `${parcel.block} - Room ${parcel.roomNo}`
                              : `Room ${parcel.roomNo}`}{" "}
                            • {parcel.courier}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          parcel.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {parcel.status === "PENDING"
                          ? "🟡 PENDING"
                          : "🟢 PICKED UP"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium text-gray-700">
                          Tracking ID:
                        </span>
                        <p className="text-gray-900 font-mono text-xs mt-1 p-2 bg-white rounded border">
                          {parcel.trackingId}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          {parcel.status === "PENDING"
                            ? "Arrival Time:"
                            : "Picked Up:"}
                        </span>
                        <p className="text-gray-900 mt-1">
                          {parcel.status === "PENDING"
                            ? new Date(parcel.createdAt || "").toLocaleString()
                            : new Date(
                                parcel.pickedUpTime || ""
                              ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {parcel.status === "PENDING" && (
                      <button
                        onClick={() =>
                          parcel.id && handleMarkAsPickedUp(parcel.id)
                        }
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors font-medium"
                      >
                        ✅ Mark as Picked Up
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
