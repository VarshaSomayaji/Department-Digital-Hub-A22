import { Schema, model, Types } from "mongoose";
import { Role } from "../types";

export interface IAnnouncement {
  title: string;
  content: string;
  postedBy: {
    role: Exclude<Role, "STUDENT">; // Only Admin, HOD, Faculty can post
    id: Types.ObjectId;
  };
  targetAudience: Role[]; // which roles can see this
   seenBy: Array<{ user: { role: Role; id: Types.ObjectId }; seenAt: Date }>;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    postedBy: {
      role: { type: String, enum: ["ADMIN", "HOD", "FACULTY"], required: true },
      id: { type: Schema.Types.ObjectId, required: true, refPath: "postedBy.role" },
    },
    targetAudience: [{ type: String, enum: ["ADMIN", "HOD", "FACULTY", "STUDENT"] }],
    seenBy: [
      {
        user: {
          role: { type: String, enum: ["ADMIN", "HOD", "FACULTY", "STUDENT"] },
          id: { type: Schema.Types.ObjectId, refPath: "seenBy.user.role" },
        },
        seenAt: { type: Date, default: Date.now },
      },
    ],
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Announcement = model<IAnnouncement>("announcement", announcementSchema);