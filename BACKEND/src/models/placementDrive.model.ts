import { Schema, model, Types } from "mongoose";

export interface IPlacementDrive {
  companyName: string;
  jobProfile: string;
  description: string;
  eligibility: string;
  lastDateToApply: Date;
  driveDate: Date;
  postedBy: {
    role: "ADMIN" | "HOD";
    id: Types.ObjectId;
  };
  emailSent: boolean;
  attachments?: string[]; // URLs to PDFs etc.
  createdAt: Date;
  updatedAt: Date;
}

const placementDriveSchema = new Schema(
  {
    companyName: { type: String, required: true },
    jobProfile: { type: String, required: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    lastDateToApply: { type: Date, required: true },
    driveDate: { type: Date, required: true },
    postedBy: {
      role: { type: String, enum: ["ADMIN", "HOD"], required: true },
      id: { type: Schema.Types.ObjectId, required: true, refPath: "postedBy.role" },
    },
    emailSent: { type: Boolean, default: false },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const PlacementDrive = model<IPlacementDrive>("placementDrive", placementDriveSchema);