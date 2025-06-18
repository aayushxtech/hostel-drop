"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/Loader";
import ParcelRegistrationForm from "@/components/ParcelRegistrationForm";

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
    const blocks = [
      ...new Set(
        parcelList
          .map((p) => p.block)
          .filter((b): b is string => typeof b === "string" && b !== "N/A")
      ),
    ].sort();

    const couriers = [
      ...new Set(
        parcelList
          .map((p) => p.courier)
          .filter(
            (c): c is string => typeof c === "string" && c !== "Unknown Service"
          )
      ),
    ].sort();

    setFilterOptions({
      blocks,
      couriers,
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

      // Apply status filter
      if (filterOptions.status && filterOptions.status !== "ALL") {
        filtered = filtered.filter((p) => p.status === filterOptions.status);
      }

      // Apply block filter
      if (filterOptions.block) {
        filtered = filtered.filter((p) => p.block === filterOptions.block);
      }

      // Apply courier filter
      if (filterOptions.courier) {
        filtered = filtered.filter((p) => p.courier === filterOptions.courier);
      }

      // Apply date range filter
      if (filterOptions.dateRange) {
        const now = new Date();
        const cutoffDate = new Date();

        switch (filterOptions.dateRange) {
          case "today":
            cutoffDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case "month":
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
        }

        filtered = filtered.filter((p) => {
          const parcelDate = new Date(p.createdAt || "");
          return parcelDate >= cutoffDate;
        });
      }

      // Apply search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.studentName.toLowerCase().includes(query) ||
            p.trackingId.toLowerCase().includes(query) ||
            p.courier.toLowerCase().includes(query) ||
            p.roomNo.toLowerCase().includes(query) ||
            (p.block && p.block.toLowerCase().includes(query))
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue: any = a[filterOptions.sortBy as keyof ParcelData];
        let bValue: any = b[filterOptions.sortBy as keyof ParcelData];

        if (filterOptions.sortBy === "createdAt") {
          aValue = new Date(aValue || "").getTime();
          bValue = new Date(bValue || "").getTime();
        }

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
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

      console.log("🔧 Fetching parcels from:", `${baseUrl}/parcels/all/`);

      const response = await fetch(`${baseUrl}/parcels/all/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw parcels data:", data);

      const mapped: ParcelData[] = data.map((p: ApiParcelData) => {
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

        // ✅ Debug image URLs
        if (p.image) {
          console.log("🔧 Raw image URL from backend:", p.image);
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
          imageUrl: p.image || undefined, // ✅ Use direct URL from backend
        };
      });

      console.log("Mapped parcels:", mapped);

      setAllParcels(mapped);
      extractFilterOptions(mapped);

      const filtered = applyFiltersAndSearch(mapped, searchQuery, filters);
      setFilteredParcels(filtered);

      // Calculate stats
      const totalParcels = mapped.length;
      const pendingParcels = mapped.filter(
        (p) => p.status === "PENDING"
      ).length;
      const today = new Date().toDateString();
      const pickedUpToday = mapped.filter((p) => {
        if (p.status === "PICKED_UP" && p.pickedUpTime) {
          return new Date(p.pickedUpTime).toDateString() === today;
        }
        return false;
      }).length;

      setStats({
        totalParcels,
        pendingParcels,
        pickedUpToday,
      });
    } catch (err) {
      console.error("Error fetching parcels:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch parcels";
      setError(errorMessage);
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
      const value = e.target.value;
      setSearchQuery(value);

      const filtered = applyFiltersAndSearch(allParcels, value, filters);
      setFilteredParcels(filtered);
    },
    [allParcels, filters, applyFiltersAndSearch]
  );

  // ✅ Handle filter changes
  const handleFilterChange = useCallback(
    (filterKey: keyof FilterOptions, value: string | "asc" | "desc") => {
      const newFilters = { ...filters, [filterKey]: value };
      setFilters(newFilters);

      const filtered = applyFiltersAndSearch(
        allParcels,
        searchQuery,
        newFilters
      );
      setFilteredParcels(filtered);
    },
    [allParcels, searchQuery, filters, applyFiltersAndSearch]
  );

  // ✅ Clear all filters and search
  const clearAllFilters = useCallback(() => {
    const clearedFilters: FilterOptions = {
      status: "PENDING",
      block: "",
      courier: "",
      dateRange: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    setFilters(clearedFilters);
    setSearchQuery("");

    const filtered = applyFiltersAndSearch(allParcels, "", clearedFilters);
    setFilteredParcels(filtered);
  }, [allParcels, applyFiltersAndSearch]);

  // ✅ Handle parcel pickup verification
  const handleMarkAsPickedUp = useCallback(
    async (parcelId: number) => {
      try {
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
        console.log("Parcel marked as picked up:", result);

        // Refresh the parcels list
        fetchParcels();

        alert("✅ Parcel marked as picked up successfully!");
      } catch (err) {
        console.error("Error marking parcel as picked up:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to mark parcel as picked up";
        alert(`❌ Error: ${errorMessage}`);
      }
    },
    [baseUrl, fetchParcels]
  );

  // ✅ Handle new parcel registration
  const handleParcelAdded = useCallback(() => {
    console.log("New parcel added, refreshing list...");
    fetchParcels();
  }, [fetchParcels]);

  // ✅ Toggle form visibility
  const toggleRegistrationForm = useCallback(() => {
    setShowRegistrationForm(!showRegistrationForm);
  }, [showRegistrationForm]);

  // ✅ useEffect hook
  useEffect(() => {
    if (isLoaded) {
      fetchParcels();
    }
  }, [isLoaded, fetchParcels]);

  // ✅ NOW all hooks are declared - conditional rendering can happen here
  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  // Email authorization check
  const userPrimaryEmail = user.primaryEmailAddress?.emailAddress;
  const userEmailAddresses = user.emailAddresses.map(
    (email) => email.emailAddress
  );

  // Uncomment if you want to restrict access
  // if (
  //   userPrimaryEmail !== "admin@gmail.com" &&
  //   !userEmailAddresses.includes("admin@gmail.com")
  // ) {
  //   redirect("/403");
  // }

  // Rest of your component JSX remains the same...
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Your existing JSX content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🛡️ Guard Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user.firstName || "Guard"}! Manage parcel
              deliveries and track pickup status.
            </p>
          </div>
          <button
            onClick={toggleRegistrationForm}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              showRegistrationForm
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {showRegistrationForm ? "❌ Cancel" : "📦 Register New Parcel"}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📦</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Parcels
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalParcels}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⏳</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Pending Pickup
                </h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pendingParcels}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Picked Up Today
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.pickedUpToday}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        {showRegistrationForm && (
          <div className="mb-8">
            <ParcelRegistrationForm onParcelAdded={handleParcelAdded} />
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by student name, tracking ID, courier, or room..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t pt-4">
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
                    <option value="ALL">All Status</option>
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
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
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
                    <option value="trackingId">Tracking ID</option>
                    <option value="courier">Courier</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
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
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-600 mt-2">Loading parcels...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filteredParcels.length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600">
                No parcels found matching your criteria.
              </p>
              {(searchQuery ||
                filters.status !== "PENDING" ||
                filters.block ||
                filters.courier ||
                filters.dateRange) && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

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

                {/* ✅ Display parcel image */}
                {parcel.imageUrl && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      📷 Parcel Image:
                    </p>
                    <div className="relative inline-block">
                      <img
                        src={parcel.imageUrl}
                        alt="Parcel"
                        className="w-32 h-32 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => window.open(parcel.imageUrl, "_blank")}
                        onLoad={() => {
                          console.log(
                            "✅ Dashboard image loaded:",
                            parcel.imageUrl
                          );
                        }}
                        onError={(e) => {
                          console.error(
                            "❌ Failed to load dashboard image:",
                            parcel.imageUrl
                          );
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          // Create a fallback element
                          const fallback = document.createElement("div");
                          fallback.className =
                            "w-32 h-32 bg-gray-200 rounded border border-gray-200 flex items-center justify-center text-gray-500 text-xs";
                          fallback.textContent = "Image not available";
                          target.parentNode?.insertBefore(fallback, target);
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                        Click to view full size
                      </div>
                    </div>
                  </div>
                )}

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
                        : new Date(parcel.pickedUpTime || "").toLocaleString()}
                    </p>
                  </div>
                </div>

                {parcel.status === "PENDING" && (
                  <button
                    onClick={() => parcel.id && handleMarkAsPickedUp(parcel.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors font-medium"
                  >
                    ✅ Mark as Picked Up
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
