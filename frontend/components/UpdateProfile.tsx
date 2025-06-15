"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostel_block: string;
  room_number: string;
  clerk_id: string;
}

const StudentProfile: React.FC = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState<StudentProfileData | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hostel_block: "",
    room_number: "",
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // ✅ Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${baseUrl}/students/by-clerk/?clerk_id=${user.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            hostel_block: data.hostel_block || "",
            room_number: data.room_number || "",
          });
        } else {
          // Profile doesn't exist, prepare for creation
          setFormData({
            name: user.fullName || user.firstName + " " + user.lastName || "",
            email: user.primaryEmailAddress?.emailAddress || "",
            phone: "",
            hostel_block: "",
            room_number: "",
          });
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, baseUrl]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;

    // Validation
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      alert("Email is required");
      return;
    }
    if (!formData.phone.trim()) {
      alert("Phone number is required");
      return;
    }
    if (!formData.hostel_block.trim()) {
      alert("Hostel block is required");
      return;
    }
    if (!formData.room_number.trim()) {
      alert("Room number is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        clerk_id: user.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        hostel_block: formData.hostel_block.trim(),
        room_number: formData.room_number.trim(),
      };

      let response;
      if (profileData) {
        // Update existing profile
        response = await fetch(
          `${baseUrl}/students/${profileData.id}/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // Create new profile (sync with clerk)
        response = await fetch(`${baseUrl}/students/sync-clerk/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      const updatedData = await response.json();
      setProfileData(updatedData.student || updatedData);
      setIsEditing(false);
      alert("✅ Profile saved successfully!");
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      setError(err instanceof Error ? err.message : "Failed to save profile");
      alert(
        `❌ Error: ${
          err instanceof Error ? err.message : "Failed to save profile"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const hostelBlocks = ["A Block", "B Block", "C Block", "D Block", "E Block"];

  if (loading && !profileData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center">
          👤 My Profile Details
        </h3>
        <button
          onClick={() => {
            if (isEditing) {
              // Cancel editing - reset form
              if (profileData) {
                setFormData({
                  name: profileData.name,
                  email: profileData.email,
                  phone: profileData.phone,
                  hostel_block: profileData.hostel_block,
                  room_number: profileData.room_number,
                });
              }
            }
            setIsEditing(!isEditing);
            setError(null);
          }}
          className={`px-4 py-2 rounded transition-colors ${
            isEditing
              ? "bg-gray-500 hover:bg-gray-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isEditing ? "✖️ Cancel" : "✏️ Edit Profile"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!profileData && !isEditing && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">⚠️ Profile Incomplete</p>
          <p className="text-sm">
            Please complete your profile to receive parcel notifications.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            Complete Profile
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          ) : (
            <p className="text-gray-900 py-2">
              {profileData?.name || "Not set"}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          ) : (
            <p className="text-gray-900 py-2">
              {profileData?.email || "Not set"}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          ) : (
            <p className="text-gray-900 py-2">
              {profileData?.phone || "Not set"}
            </p>
          )}
        </div>

        {/* Hostel Block */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hostel Block *
          </label>
          {isEditing ? (
            <select
              name="hostel_block"
              value={formData.hostel_block}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select hostel block</option>
              {hostelBlocks.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-900 py-2">
              {profileData?.hostel_block || "Not set"}
            </p>
          )}
        </div>

        {/* Room Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Number *
          </label>
          {isEditing ? (
            <input
              type="text"
              name="room_number"
              value={formData.room_number}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 204-A"
            />
          ) : (
            <p className="text-gray-900 py-2">
              {profileData?.room_number || "Not set"}
            </p>
          )}
        </div>

        {/* Clerk ID (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account ID
          </label>
          <p className="text-gray-500 py-2 text-sm font-mono">{user?.id}</p>
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "💾 Save Profile"}
          </button>
        </div>
      )}

      {/* Profile Status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Profile Status:</span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              profileData
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {profileData ? "✅ Complete" : "⚠️ Incomplete"}
          </span>
        </div>
        {profileData && (
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
