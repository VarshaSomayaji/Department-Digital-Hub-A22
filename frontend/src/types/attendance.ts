export interface AttendanceRecord {
  student: {
    _id: string;
    name: string;
    rollNo: string;
  };
  status: 'Present' | 'Absent' | 'Late';
}

export interface Attendance {
  _id: string;
  date: string; // ISO date
  faculty: {
    _id: string;
    name: string;
  };
  subject: string;
  batch: string;
  records: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceData {
  date: string;
  subject: string;
  batch: string;
  records: Array<{
    student: string; // student ID
    status: 'Present' | 'Absent' | 'Late';
  }>;
}

export interface UpdateAttendanceData extends Partial<CreateAttendanceData> {}