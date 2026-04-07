export interface ClassroomUpdate {
  _id: string;
  title: string;
  content: string;
  batch: string;
  postedBy: {
    _id: string;
    name: string;
    role: 'FACULTY' | 'HOD';
  };
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassroomUpdateData {
  title: string;
  content: string;
  batch: string;
  // attachments are sent as FormData
}

export interface UpdateClassroomUpdateData extends Partial<CreateClassroomUpdateData> {}