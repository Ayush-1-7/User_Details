import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Employee from "@/models/Employee";
import { generateMockEmployees } from "@/lib/mockData";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { force = false } = await request.json().catch(() => ({}));

    // Check count of current employees
    const count = await Employee.countDocuments();

    if (count > 0 && !force) {
      return NextResponse.json(
        {
          success: true,
          message: `Database already seeded with ${count} employees. Use 'force: true' to reseed.`,
          count,
        },
        { status: 200 }
      );
    }

    // Delete existing records
    await Employee.deleteMany({});

    // Generate and insert 100 mock employees
    const mockData = generateMockEmployees();
    const result = await Employee.insertMany(mockData);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully seeded 100 mock employees!",
        count: result.length,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Database seeding error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during seeding";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Support a GET request too to make it easy to trigger in the browser
export async function GET() {
  try {
    await connectToDatabase();

    const count = await Employee.countDocuments();
    if (count > 0) {
      return NextResponse.json(
        {
          success: true,
          message: `Database has ${count} employees active.`,
          count,
        },
        { status: 200 }
      );
    }

    const mockData = generateMockEmployees();
    const result = await Employee.insertMany(mockData);

    return NextResponse.json(
      {
        success: true,
        message: "Database was empty. Automatically seeded 100 mock employees!",
        count: result.length,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Database seed GET error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during seeding";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
