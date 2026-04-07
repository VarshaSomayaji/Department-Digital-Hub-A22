import { Role } from './index';

export interface BaseUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  mobileNumber?: string;
  address?: string;
  image?: string;
  accountStatus: 'Active' | 'Inactive' | 'Pending';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentUser extends BaseUser {
  role: 'STUDENT';
  rollNo: string;
  batch: string;
  department: string;
}

export interface FacultyUser extends BaseUser {
  role: 'FACULTY';
  department: string;
  employeeId: string;
  subjects: string[];
}

export interface HODUser extends BaseUser {
  role: 'HOD';
  department: string;
  employeeId: string;
}

export interface AdminUser extends BaseUser {
  role: 'ADMIN';
}

export type User = StudentUser | FacultyUser | HODUser | AdminUser;

// For creating/editing, we need a form data type
export interface CreateUserData {
  name: string;
  email: string;
  password?: string; // only required for create
  mobileNumber: string;
  address: string;
  role: Role;
  // role-specific fields
  department?: string;
  employeeId?: string;
  rollNo?: string;
  batch?: string;
  subjects?: string; // comma-separated for faculty
  image?: File;
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password' | 'role'>> {
  // role cannot be changed? maybe allowed, but careful.
  // We'll keep it simple: admin can update basic info and role-specific fields, but not role itself.
}

export interface UserStats {
  totalStudents: number;
  totalFaculty: number;
  totalHODs: number;
  totalAdmins: number;
  totalUsers: number;
}