import { Schema, model, Types } from "mongoose";

export interface IClassroomUpdate {
  title: string;
  content: string;
  batch: string;
  postedBy: {
    role: "faculty" | "hod";   // change to lowercase
    id: Types.ObjectId;
  };
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const classroomUpdateSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    batch: { type: String, required: true },
    postedBy: {
      role: { type: String, enum: ["faculty", "hod"], required: true }, // lowercase
      id: { type: Schema.Types.ObjectId, required: true, refPath: "postedBy.role" },
    },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const ClassroomUpdate = model<IClassroomUpdate>("classroomUpdate", classroomUpdateSchema);