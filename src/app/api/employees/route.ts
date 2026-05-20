import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Employee from "@/models/Employee";
import { generateMockEmployees } from "@/lib/mockData";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const grade = searchParams.get("grade") || "";
    const sortBy = searchParams.get("sortBy") || "employeeId";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Auto-seed if database is empty
    const countTotal = await Employee.countDocuments();
    if (countTotal === 0) {
      console.log("No employees found. Seeding 100 employees automatically...");
      const mockData = generateMockEmployees();
      await Employee.insertMany(mockData);
    }

    // Build query object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }

    if (department && department !== "All") {
      query.department = department;
    }

    if (grade && grade !== "All") {
      query.grade = grade;
    }

    // Compute sorting
    const sortDir = sortOrder === "desc" ? -1 : 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sort: any = {};
    sort[sortBy] = sortDir;

    // Execute queries
    const skip = (page - 1) * limit;
    const totalEmployees = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Dynamic aggregated statistics for dashboard summary cards
    // Calculate total headcount, department distribution, and average grade
    const aggStats = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
    ]);

    const gradeStats = await Employee.aggregate([
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: employees,
      pagination: {
        total: totalEmployees,
        page,
        limit,
        pages: Math.ceil(totalEmployees / limit),
      },
      stats: {
        totalHeadcount: await Employee.countDocuments(),
        departmentSplit: aggStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
        gradeSplit: gradeStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error: unknown) {
    console.error("GET employees API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { employeeId, name, department, grade, email, designation } = body;

    // Basic Validation
    if (!employeeId || !name || !department || !grade || !email || !designation) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check unique employeeId
    const existingId = await Employee.findOne({ employeeId });
    if (existingId) {
      return NextResponse.json(
        { success: false, error: `Employee ID '${employeeId}' is already registered` },
        { status: 400 }
      );
    }

    // Check unique email
    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: `Email address '${email}' is already in use` },
        { status: 400 }
      );
    }

    const newEmployee = new Employee({
      employeeId,
      name,
      department,
      grade,
      email,
      designation,
    });

    await newEmployee.save();

    return NextResponse.json(
      { success: true, message: "Employee registered successfully", data: newEmployee },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST employee API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
