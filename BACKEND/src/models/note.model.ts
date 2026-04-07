import { Schema, model, Types } from "mongoose";

export interface INote {
  title: string;
  description?: string;
  subject: string;
  batch: string;
  fileUrl: string; // URL to uploaded file (PDF, etc.)
  uploadedBy: {
    role: "FACULTY";
    id: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    subject: { type: String, required: true },
    batch: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: {
      role: { type: String, enum: ["FACULTY"], default: "FACULTY" },
      id: { type: Schema.Types.ObjectId, ref: "faculty", required: true },
    },
  },
  { timestamps: true }
);

export const Note = model<INote>("note", noteSchema);