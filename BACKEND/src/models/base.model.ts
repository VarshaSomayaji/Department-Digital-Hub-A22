import { Document } from "mongoose";

export interface IBaseUser extends Document {
  name: string;
  email: string;
  password: string;
  mobileNumber?: string;
  address?: string;
  image?: string;
  accountStatus: 'Active' | 'Inactive' | 'Pending';
  lastLogin?: Date;
}

export const IbaseUserSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String },
  address: { type: String },
  image: { type: String },
  accountStatus: { type: String, enum: ['Active', 'Inactive', 'Pending'], default: 'Active' },
  lastLogin: { type: Date },
};
