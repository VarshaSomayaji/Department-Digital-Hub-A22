import { Schema, model } from "mongoose";
import { IBaseUser, IbaseUserSchema } from "./base.model";

export interface IHOD extends IBaseUser {
  department: string;
  employeeId: string;
}

const hodSchema = new Schema({
  ...IbaseUserSchema,
  department: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true }
}, { timestamps: true });

export const HOD = model<IHOD>("hod", hodSchema);