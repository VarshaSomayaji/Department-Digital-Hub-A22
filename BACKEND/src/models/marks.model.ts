import { Schema, model, Types } from "mongoose";

export interface IMarks {
  examName: string; // e.g., "Midterm 1", "Final"
  subject: string;
  batch: string;
  faculty: Types.ObjectId; // ref: Faculty
  maxMarks: number;
  marksObtained: {
    student: Types.ObjectId; // ref: Student
    marks: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const marksSchema = new Schema(
  {
    examName: { type: String, required: true },
    subject: { type: String, required: true },
    batch: { type: String, required: true },
    faculty: { type: Schema.Types.ObjectId, ref: "faculty", required: true },
    maxMarks: { type: Number, required: true },
    marksObtained: [
      {
        student: { type: Schema.Types.ObjectId, ref: "student", required: true },
        marks: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Marks = model<IMarks>("marks", marksSchema);