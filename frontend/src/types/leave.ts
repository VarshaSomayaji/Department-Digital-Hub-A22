import { Role } from './index';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  _id: string;
  user: {
    role: Exclude<Role, 'ADMIN'>;
    id: {
      _id: string;
      name: string;
      email: string;
    };
  };
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: {
    role: 'HOD' | 'FACULTY';
    id: {
      _id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveData {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveData {
  status?: LeaveStatus;
  // maybe other fields if editing by user, but usually only status changes by approver
}

export interface ApproveLeaveData {
  status: 'APPROVED' | 'REJECTED';
}