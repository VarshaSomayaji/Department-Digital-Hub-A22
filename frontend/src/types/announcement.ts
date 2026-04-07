import { Role } from './index';

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  postedBy: {
    role: Exclude<Role, 'STUDENT'>;
    id: {
      _id: string;
      name: string;
      email: string;
    };
  };
  targetAudience: Role[];
  seenBy: Array<{
    user: { role: Role; id: string };
    seenAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  targetAudience: Role[];
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {}