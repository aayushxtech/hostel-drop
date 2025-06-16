import emailjs from "@emailjs/browser";

export interface ParcelData {
  trackingId: string;
  service?: string;
  description?: string;
  createdAt: string;
  hostelBlock?: string;
  roomNumber?: string;
}

export const sendParcelNotification = async (
  studentName: string,
  userEmail: string,
  parcelData: ParcelData
) => {
  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        student_name: studentName,
        user_email: userEmail,
        tracking_id: parcelData.trackingId,
        service: parcelData.service || "Manual Entry",
        description: parcelData.description || "No description provided",
        arrival_date: new Date(parcelData.createdAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        hostel_block: parcelData.hostelBlock || "N/A",
        room_number: parcelData.roomNumber || "N/A",
        subject: `📦 New Parcel Arrived - Tracking ID: ${parcelData.trackingId}`,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    console.log("Email sent successfully:", response.status);
    return { success: true, status: response.status };
  } catch (error: unknown) {
    console.error("Email send error:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const sendPickupReminder = async (
  studentName: string,
  userEmail: string,
  parcelData: ParcelData,
  daysPending: number
) => {
  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_REMINDER_TEMPLATE_ID!,
      {
        student_name: studentName,
        user_email: userEmail,
        tracking_id: parcelData.trackingId,
        days_pending: daysPending,
        service: parcelData.service || "Manual Entry",
        arrival_date: new Date(parcelData.createdAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ),
        urgency: daysPending >= 5 ? "URGENT" : "REMINDER",
        subject: `📬 Parcel Pickup ${
          daysPending >= 5 ? "URGENT" : "Reminder"
        } - ${parcelData.trackingId}`,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    console.log("Reminder email sent successfully:", response.status);
    return { success: true, status: response.status };
  } catch (error: unknown) {
    console.error("Reminder email error:", error);
    return { success: false, error: (error as Error).message };
  }
};
