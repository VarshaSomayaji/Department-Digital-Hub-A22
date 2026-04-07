import { Schema, model, Types } from "mongoose";

export interface ITimetable {
  batch: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  periods: {
    periodNumber: number;
    subject: string;
    faculty: Types.ObjectId; // ref: Faculty
    startTime: string; // e.g., "09:00"
    endTime: string; // e.g., "10:00"
  }[];
  createdBy: Types.ObjectId; // ref: Faculty
  createdAt: Date;
  updatedAt: Date;
}

const timetableSchema = new Schema(
  {
    batch: { type: String, required: true },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    periods: [
      {
        periodNumber: { type: Number, required: true },
        subject: { type: String, required: true },
        faculty: { type: Schema.Types.ObjectId, ref: "faculty", required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "faculty", required: true },
  },
  { timestamps: true }
);

// Ensure only one timetable per batch per day
timetableSchema.index({ batch: 1, day: 1 }, { unique: true });

export const Timetable = model<ITimetable>("timetable", timetableSchema);