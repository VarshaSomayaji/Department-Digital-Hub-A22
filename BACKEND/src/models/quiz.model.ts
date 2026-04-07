import { Schema, model, Types } from "mongoose";

export interface IQuiz {
  title: string;
  description?: string;
  subject: string;
  batch: string;
  faculty: Types.ObjectId; // ref: Faculty
  questions: {
    question: string;
    options: string[];
    correctOption: number; // index of correct option (0-based)
  }[];
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  results: {
    student: Types.ObjectId; // ref: Student
    score: number;
    submittedAt: Date;
  }[];
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    subject: { type: String, required: true },
    batch: { type: String, required: true },
    faculty: { type: Schema.Types.ObjectId, ref: "faculty", required: true },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOption: { type: Number, required: true },
      },
    ],
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    reminderSent: { type: Boolean, default: false },
    results: [
      {
        student: { type: Schema.Types.ObjectId, ref: "student" },
        score: { type: Number },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Quiz = model<IQuiz>("quiz", quizSchema);