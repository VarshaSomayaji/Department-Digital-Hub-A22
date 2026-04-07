import { Schema, model } from "mongoose";
import { IBaseUser, IbaseUserSchema } from "./base.model";

export interface IFaculty extends IBaseUser {
  department: string;
  employeeId: string;
  subjects: string[]; // subjects they teach
}

const facultySchema = new Schema({
  ...IbaseUserSchema,
  department: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  subjects: [{ type: String }]
}, { timestamps: true });

export const Faculty = model<IFaculty>("faculty", facultySchema);