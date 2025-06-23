import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee"; // Employee মডেল ইম্পোর্ট করা আবশ্যক
import { calculateOvertime } from "@/lib/calculation";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { employeeId, attendanceRecords } = body;

    // --- Validation ---
    if (!employeeId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return NextResponse.json({ message: "Invalid request body. Employee ID and attendance records are required." }, { status: 400 });
    }

    // --- Fetch employee's duty time ---
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ message: "Employee not found." }, { status: 404 });
    }
    const standardDutyMinutes = employee.standardDutyMinutes;

    // --- Prepare bulk operations for MongoDB ---
    const bulkOps = [];

    for (const record of attendanceRecords) {
      if (record.inTime && record.outTime) {
        
        const { dutyHours, overtimeHours, inTime, outTime } = calculateOvertime(
          record.date,
          record.inTime,
          record.outTime,
          standardDutyMinutes
        );

        if (inTime && outTime && dutyHours >= 0) { // Ensure valid calculation
          bulkOps.push({
            updateOne: {
              filter: { employee: employeeId, date: new Date(record.date) },
              update: {
                $set: {
                  employee: employeeId, // Ensure employee field is set
                  date: new Date(record.date),
                  inTime,
                  outTime,
                  dutyHours,
                  overtimeHours,
                },
              },
              upsert: true, // Creates a new doc if none is found
            },
          });
        }
      }
    }

    // --- Execute bulk write if there are operations ---
    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }

    return NextResponse.json(
      { message: `Attendance saved successfully. Processed ${bulkOps.length} records.` },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in /api/attendance POST:", error);
    return NextResponse.json(
      { message: "An internal server error occurred.", error: error.message },
      { status: 500 }
    );
  }
}