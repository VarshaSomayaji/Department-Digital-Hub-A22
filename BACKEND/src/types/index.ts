import { Schema } from "mongoose";

export type Role = "ADMIN" | "HOD" | "FACULTY" | "STUDENT" ;

export type TokenInfo = {
  _id: Schema.Types.ObjectId;
  email: string;
  name: string;
  role: Role;
};

export enum RoleEnum {
  ADMIN = "ADMIN",
  HOD = "HOD",
  FACULTY = "FACULTY",
  STUDENT = "STUDENT"
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum PollStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED"
}

// For project domain analytics
export interface ProjectDomain {
  domain: string;
  count: number;
  year: number;
}


