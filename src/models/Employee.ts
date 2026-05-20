import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  department: string;
  grade: string;
  email: string;
  designation: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema<IEmployee> = new Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      index: true,
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model during hot reloading
const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
