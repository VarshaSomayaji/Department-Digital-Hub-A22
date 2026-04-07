export interface Note {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  batch: string;
  fileUrl: string;
  uploadedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  description?: string;
  subject: string;
  batch: string;
  // file is sent as FormData
}

export interface UpdateNoteData extends Partial<CreateNoteData> {}