import { Role } from './index';

export interface PlacementDrive {
  _id: string;
  companyName: string;
  jobProfile: string;
  description: string;
  eligibility: string;
  lastDateToApply: string; // ISO date
  driveDate: string;       // ISO date
  postedBy: {
    role: 'ADMIN' | 'HOD';
    id: {
      _id: string;
      name: string;
      email: string;
    };
  };
  attachments?: string[]; // array of file URLs
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlacementData {
  companyName: string;
  jobProfile: string;
  description: string;
  eligibility: string;
  lastDateToApply: string;
  driveDate: string;
  // files are sent as FormData separately
}

export interface UpdatePlacementData extends Partial<CreatePlacementData> {}