export interface MarksEntry {
  student: {
    _id: string;
    name: string;
    rollNo: string;
  };
  marks: number;
}

export interface Marks {
  _id: string;
  examName: string;
  subject: string;
  batch: string;
  faculty: {
    _id: string;
    name: string;
  };
  maxMarks: number;
  marksObtained: MarksEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarksData {
  examName: string;
  subject: string;
  batch: string;
  maxMarks: number;
  marksObtained: Array<{
    student: string; // student ID
    marks: number;
  }>;
}

export interface UpdateMarksData extends Partial<CreateMarksData> {}