import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Employee from "@/models/Employee";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const id = (await params).id;

    // Search by Mongo ObjectId or Employee ID
    const employee = id.startsWith("EMP-")
      ? await Employee.findOne({ employeeId: id })
      : await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: unknown) {
    console.error("GET individual employee API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const id = (await params).id;
    const body = await request.json();

    const { employeeId, name, department, grade, email, designation } = body;

    // Check if the record exists
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee record not found" },
        { status: 404 }
      );
    }

    // Uniqueness Checks
    if (employeeId && employeeId !== employee.employeeId) {
      const collisionId = await Employee.findOne({ employeeId });
      if (collisionId) {
        return NextResponse.json(
          { success: false, error: `Employee ID '${employeeId}' is already in use by another record` },
          { status: 400 }
        );
      }
    }

    if (email && email.toLowerCase() !== employee.email) {
      const collisionEmail = await Employee.findOne({ email: email.toLowerCase() });
      if (collisionEmail) {
        return NextResponse.json(
          { success: false, error: `Email address '${email}' is already in use by another record` },
          { status: 400 }
        );
      }
    }

    // Apply updates
    if (employeeId) employee.employeeId = employeeId;
    if (name) employee.name = name;
    if (department) employee.department = department;
    if (grade) employee.grade = grade;
    if (email) employee.email = email.toLowerCase();
    if (designation) employee.designation = designation;

    await employee.save();

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error: unknown) {
    console.error("PUT individual employee API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const id = (await params).id;

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Employee ${employee.name} (${employee.employeeId}) deleted successfully`,
    });
  } catch (error: unknown) {
    console.error("DELETE individual employee API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
