import { Schema, model, Types } from "mongoose";

export interface ILeaveRequest {
  user: {
    role: "STUDENT" | "FACULTY" | "HOD";   // lowercase
    id: Types.ObjectId;
  };
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: {
    role: "FACULTY" | "HOD";                // lowercase
    id: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema(
  {
    user: {
      role: { type: String, enum: ["STUDENT", "FACULTY", "HOD"], required: true },
      id: { type: Schema.Types.ObjectId, required: true, refPath: "User" },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvedBy: {
      role: { type: String, enum: ["FACULTY", "HOD"] },
      id: { type: Schema.Types.ObjectId, refPath: "User" },
    },
  },
  { timestamps: true }
);

export const LeaveRequest = model<ILeaveRequest>("leaveRequest", leaveRequestSchema);