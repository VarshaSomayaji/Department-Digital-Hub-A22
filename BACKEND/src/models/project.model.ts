import { Schema, model, Types } from "mongoose";

export interface IProject {
  title: string;
  description: string;
  domain: string; // extracted by AI
  techStack: string[]; // extracted by AI
  keywords: string[]; // extracted by AI
  summary: string; // AI generated summary
  fileUrls: string[]; // uploaded files
  uploadedBy: {
    role: "FACULTY" | "STUDENT";
    id: Types.ObjectId;
  };
  year: number; // year of submission
  tags: string[]; // additional tags (manual or AI)
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    domain: String,
    techStack: [String],
    keywords: [String],
    summary: String,
    fileUrls: [String],
    uploadedBy: {
      role: { type: String, enum: ["FACULTY", "STUDENT"], required: true },
      id: { type: Schema.Types.ObjectId, required: true, refPath: "User" },
    },
    year: { type: Number, required: true },
    tags: [String],
  },
  { timestamps: true }
);

export const Project = model<IProject>("project", projectSchema);