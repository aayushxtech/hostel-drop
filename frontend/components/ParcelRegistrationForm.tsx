"use client";

import React, { useState, useEffect } from "react";
import { sendParcelNotification, ParcelData } from "@/lib/sendMail";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostel_block: string;
  room_number: string;
}

interface ParcelRegistrationFormProps {
  onParcelAdded: () => void;
}

const ParcelRegistrationForm: React.FC<ParcelRegistrationFormProps> = ({
  onParcelAdded,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ✅ Add notification status state
  const [notificationStatus, setNotificationStatus] = useState<{
    email_sent: boolean;
    email_error?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    courier: "",
    description: "",
    customBlock: "",
    customRoom: "",
  });

  // Extended hostel blocks list
  const hostelBlocks = ["A Block", "B Block", "C Block", "D Block", "E Block"];

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Fetch all students for the dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setStudentsLoading(true);
        setError(null);

        console.log("🔧 Fetching students from:", `${baseUrl}/students/all/`);

        const response = await fetch(`${baseUrl}/students/all/`);

        console.log("🔧 Students response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Students data:", data);

        setStudents(data);
        console.log("Students loaded successfully:", data.length);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(
          `Failed to load students: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [baseUrl]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    console.log(`🔧 Form field changed: ${name} = ${value}`);

    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-populate custom fields when student is selected
    if (name === "studentId" && value) {
      const selectedStudent = students.find((s) => s.id === value);
      if (selectedStudent) {
        setFormData((prev) => ({
          ...prev,
          customBlock: selectedStudent.hostel_block || "",
          customRoom: selectedStudent.room_number || "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔧 Form submitted with data:", formData);

    // Validation
    if (!formData.studentId) {
      alert("Please select a student");
      return;
    }

    if (!formData.customBlock.trim()) {
      alert("Please select or enter the hostel block");
      return;
    }

    if (!formData.customRoom.trim()) {
      alert("Please enter the room number");
      return;
    }

    setLoading(true);
    setError(null);
    // Reset notification status
    setNotificationStatus(null);

    try {
      const selectedStudent = students.find((s) => s.id === formData.studentId);
      console.log("🔧 Selected student:", selectedStudent);

      if (!selectedStudent) {
        throw new Error("Selected student not found");
      }

      // Backend will auto-generate tracking_id - no need to include it
      const payload = {
        student_id: formData.studentId,
        service: formData.courier.trim() || "Manual Entry",
        description: `Room No: ${formData.customRoom.trim()} | Block: ${formData.customBlock.trim()}${
          formData.description ? ` | ${formData.description}` : ""
        }`,
        status: "PENDING",
      };

      console.log("🔧 Payload to send:", payload);
      console.log("🔧 Sending to URL:", `${baseUrl}/parcels/create/`);

      const response = await fetch(`${baseUrl}/parcels/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("🔧 Create parcel response status:", response.status);

      const responseText = await response.text();
      console.log("🔧 Create parcel response text:", responseText);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);
      console.log("Parcel registered successfully:", result);

      // Send email notification after successful parcel creation
      if (selectedStudent.email) {
        console.log("Sending email notification to:", selectedStudent.email);

        const parcelData: ParcelData = {
          trackingId: result.parcel?.tracking_id || "Unknown",
          service: formData.courier.trim() || "Manual Entry",
          description: formData.description || "No additional description",
          createdAt: result.parcel?.created_at || new Date().toISOString(),
          hostelBlock: formData.customBlock,
          roomNumber: formData.customRoom,
        };

        try {
          const emailResult = await sendParcelNotification(
            selectedStudent.name,
            selectedStudent.email,
            parcelData
          );

          setNotificationStatus({
            email_sent: emailResult.success,
            email_error: emailResult.success ? undefined : emailResult.error,
          });

          console.log(
            `Email notification ${
              emailResult.success ? "sent successfully" : "failed"
            }:`,
            emailResult
          );
        } catch (emailError) {
          console.error("Email notification error:", emailError);
          setNotificationStatus({
            email_sent: false,
            email_error:
              emailError instanceof Error
                ? emailError.message
                : "Unknown email error",
          });
        }
      } else {
        console.log("No email address found for student");
        setNotificationStatus({
          email_sent: false,
          email_error: "Student has no email address",
        });
      }

      // Reset form
      setFormData({
        studentId: "",
        courier: "",
        description: "",
        customBlock: "",
        customRoom: "",
      });

      // Notify parent to refresh data
      onParcelAdded();

      // ✅ Enhanced success message with email notification status
      const trackingId = result.parcel?.tracking_id || "Unknown";
      const emailStatus = notificationStatus?.email_sent
        ? "\n📧 Email notification sent successfully!"
        : notificationStatus?.email_error
        ? `\n⚠️ Email notification failed: ${notificationStatus.email_error}`
        : "";

      alert(
        `✅ Parcel registered successfully for ${selectedStudent.name}!\nTracking ID: ${trackingId}${emailStatus}`
      );
    } catch (err) {
      console.error("❌ Error registering parcel:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to register parcel";
      setError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        📦 Register New Parcel
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Please fill out the form below to register a new parcel for a student. A
        unique tracking ID will be automatically generated and an email
        notification will be sent.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Student *
          </label>
          {studentsLoading ? (
            <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="w-full border border-red-300 rounded-md px-3 py-2 bg-red-50 text-red-700">
              No students found. Check if backend is running.
            </div>
          ) : (
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                -- Select Student ({students.length} available) --
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.hostel_block} Room{" "}
                  {student.room_number}
                </option>
              ))}
            </select>
          )}

          {formData.studentId && (
            <div className="mt-1 text-xs text-gray-600">
              {(() => {
                const student = students.find(
                  (s) => s.id === formData.studentId
                );
                return student
                  ? `📱 ${student.phone} • 📧 ${student.email}`
                  : "Student not found";
              })()}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hostel Block *
          </label>
          <select
            name="customBlock"
            value={formData.customBlock}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select hostel block</option>
            {hostelBlocks.map((block) => (
              <option key={block} value={block}>
                {block}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Auto-filled from student profile, but you can change if needed
          </p>
        </div>

        {/* Room Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Number *
          </label>
          <input
            type="text"
            name="customRoom"
            value={formData.customRoom}
            onChange={handleChange}
            placeholder="e.g., 204-B, 301-A"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Auto-filled from student profile, but you can change if needed
          </p>
        </div>

        {/* Courier Service */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Courier Service (Optional)
          </label>
          <input
            type="text"
            name="courier"
            value={formData.courier}
            onChange={handleChange}
            placeholder="e.g., Amazon, Flipkart, BlueDart, FedEx"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank if courier is unknown
          </p>
        </div>

        {/* Preview of delivery address */}
        {formData.customBlock && formData.customRoom && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>📍 Delivery Address:</strong> {formData.customBlock}, Room{" "}
              {formData.customRoom}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Fragile, Large package, Documents, etc."
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* ✅ Email Notification Status Display */}
        {notificationStatus && (
          <div className="mt-4 p-3 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">
              📧 Email Notification Status:
            </h4>
            <div
              className={`flex items-center text-sm p-2 rounded ${
                notificationStatus.email_sent
                  ? "text-green-600 bg-green-50 border-green-200"
                  : "text-red-600 bg-red-50 border-red-200"
              } border`}
            >
              {notificationStatus.email_sent ? "✅" : "❌"}
              <span className="ml-2">
                {notificationStatus.email_sent
                  ? "Email notification sent successfully!"
                  : `Email notification failed: ${notificationStatus.email_error}`}
              </span>
            </div>
            {notificationStatus.email_sent && (
              <p className="text-xs text-gray-500 mt-1">
                The student will receive an email with parcel details and pickup
                instructions.
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || studentsLoading || students.length === 0}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Registering & Sending Email...
            </>
          ) : studentsLoading ? (
            "Loading..."
          ) : (
            "📦 Register Parcel & Send Notification"
          )}
        </button>
      </form>

      {/* ✅ Information about email notifications */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-1">
          📬 Email Notifications
        </h4>
        <p className="text-sm text-blue-700">
          When you register a parcel, an email notification will be
          automatically sent to the student with their parcel details, tracking
          ID, and pickup instructions.
        </p>
      </div>
    </div>
  );
};

export default ParcelRegistrationForm;
