import { Schema, model, Types } from "mongoose";
import { Role } from "../types";

export interface IPoll {
  question: string;
  options: string[];
  createdBy: {
    role: Exclude<Role, "STUDENT">;
    id: Types.ObjectId;
  };
  targetAudience: Role[];
  expiresAt: Date;
  responses: {
    user: { role: Role; id: Types.ObjectId };
    selectedOption: string;
    respondedAt: Date;
  }[];
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pollSchema = new Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    createdBy: {
      role: { type: String, enum: ["ADMIN", "HOD", "FACULTY"], required: true },
      id: { type: Schema.Types.ObjectId, required: true, refPath: 'User' },
    },
    targetAudience: [{ type: String, enum: ["ADMIN", "HOD", "FACULTY", "STUDENT"] }],
    expiresAt: { type: Date, required: true },
    reminderSent: { type: Boolean, default: false },
    responses: [
      {
        user: {
          role: { type: String, enum: ["ADMIN", "HOD", "FACULTY", "STUDENT"] },
          id: { type: Schema.Types.ObjectId, refPath: "responses.user.role" },
        },
        selectedOption: { type: String },
        respondedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Poll = model<IPoll>("poll", pollSchema);