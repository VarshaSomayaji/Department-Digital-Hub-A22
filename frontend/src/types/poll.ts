// types/poll.ts   ← create / update this file

import { Role } from './index'; // or wherever Role is

export interface PollResponse {
  user: {
    role: Role;
    id: {
      _id: string;
      name?: string;
      email?: string;
      // add other fields you populate
    } | string; // string when not populated
  };
  selectedOption: string;
  respondedAt: string | Date;
}

export interface Poll {
  _id: string;
  question: string;
  options: string[];
  createdBy: {
    role: Exclude<Role, "STUDENT">;
    id: {
      _id: string;
      name?: string;
      email?: string;
    } | string;
  };
  targetAudience: Role[];
  expiresAt: string;
  responses: PollResponse[];
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// For creation / update
export interface CreatePollData {
  question: string;
  options: string[];
  targetAudience: Role[];
  expiresAt: string;
}

export interface UpdatePollData {
  question?: string;
  options?: string[];
  targetAudience?: Role[];
  expiresAt?: string;
}