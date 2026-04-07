export interface UserStats {
  totalUsers: number;
  byRole: {
    ADMIN: number;
    HOD: number;
    FACULTY: number;
    STUDENT: number;
  };
  activeToday?: number; // optional
}

export interface ProjectDomainStat {
  domain: string;
  count: number;
  year?: number;
}

export interface TechnologyStat {
  tech: string;
  count: number;
}

export interface AttendanceStat {
  batch: string;
  averageAttendance: number; // percentage
  subject?: string;
}

export interface QuizPerformanceStat {
  quizId: string;
  title: string;
  averageScore: number;
  totalAttempts: number;
  passRate: number; // percentage
}