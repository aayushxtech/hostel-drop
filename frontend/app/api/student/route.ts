import { NextRequest, NextResponse } from "next/server";

let studentData = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
};

export async function GET() {
  // Return the current student data as JSON
  return NextResponse.json(studentData);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Simple validation
    if (typeof name !== "string" || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Update the student data
    studentData = {
      ...studentData,
      name,
      email,
    };

    return NextResponse.json({ message: "Student updated", studentData });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

