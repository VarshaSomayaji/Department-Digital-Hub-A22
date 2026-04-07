import { Schema, model } from "mongoose";
import { IBaseUser, IbaseUserSchema } from "./base.model";

export interface IStudent extends IBaseUser {
  rollNo: string;
  batch: string; // e.g., "2024"
  department: string;
}

const studentSchema = new Schema({
  ...IbaseUserSchema,
  rollNo: { type: String, required: true, unique: true },
  batch: { type: String, required: true },
  department: { type: String, required: true }
}, { timestamps: true });

export const Student = model<IStudent>("student", studentSchema);