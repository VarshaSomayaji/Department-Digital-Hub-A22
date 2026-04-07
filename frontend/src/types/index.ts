// Mirror backend roles
export type Role = 'ADMIN' | 'HOD' | 'FACULTY' | 'STUDENT';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  mobileNumber?: string;
  address?: string;
  image?: string;
  // role-specific fields (optional for frontend)
  department?: string;
  employeeId?: string;
  rollNo?: string;
  batch?: string;
  subjects?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  address: string;
  role: Role;
  // role-specific fields
  department?: string;
  employeeId?: string;
  rollNo?: string;
  batch?: string;
  subjects?: string; // comma-separated string
}