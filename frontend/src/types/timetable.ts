export interface Period {
  periodNumber: number;
  subject: string;
  faculty: {
    _id: string;
    name: string;
  };
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
}

export interface Timetable {
  _id: string;
  batch: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: Period[];
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimetableData {
  batch: string;
  day: string;
  periods: Array<{
    periodNumber: number;
    subject: string;
    faculty: string; // faculty ID
    startTime: string;
    endTime: string;
  }>;
}

export interface UpdateTimetableData extends Partial<CreateTimetableData> {}