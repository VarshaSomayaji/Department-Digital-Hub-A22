import { Schema, model, Types } from "mongoose";

export interface IAttendance {
  date: Date;
  faculty: Types.ObjectId; // ref: Faculty
  subject: string;
  batch: string; // e.g., "2024"
  records: {
    student: Types.ObjectId; // ref: Student
    status: "Present" | "Absent" | "Late";
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema(
  {
    date: { type: Date, required: true },
    faculty: { type: Schema.Types.ObjectId, ref: "faculty", required: true },
    subject: { type: String, required: true },
    batch: { type: String, required: true },
    records: [
      {
        student: { type: Schema.Types.ObjectId, ref: "student", required: true },
        status: { type: String, enum: ["Present", "Absent", "Late"], required: true },
      },
    ],
  },
  { timestamps: true }
);

// Ensure one attendance record per faculty, subject, batch, date
attendanceSchema.index({ date: 1, faculty: 1, subject: 1, batch: 1 }, { unique: true });

export const Attendance = model<IAttendance>("attendance", attendanceSchema);