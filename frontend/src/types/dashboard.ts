export interface UserStats {
  totalAdmins: number;
  totalHODs: number;
  totalFaculty: number;
  totalStudents: number;
  totalUsers: number;
}

export interface ProjectDomainStat {
  name: string;
  value: number;
}

export interface ProjectYearStat {
  year: number;
  count: number;
}

export interface ProjectStats {
  totalProjects: number;
  byDomain: ProjectDomainStat[];
  byYear: ProjectYearStat[];
}

export interface GrowthStat {
  month: string;
  admins: number;
  hods: number;
  faculty: number;
  students: number;
  total: number;
}

export interface AdminDashboardData {
  userStats: UserStats;
  projectStats: ProjectStats;
  growthStats: GrowthStat[];
}

export interface DepartmentStats {
  totalStudents: number;
  totalFaculty: number;
  totalProjects: number;
  department: string;
}

export interface HODDashboardData {
  departmentStats: DepartmentStats;
  projectDomainStats: ProjectDomainStat[];
  pendingLeaveCount: number;
}

export interface FacultyDashboardData {
  myQuizzesCount: number;
  upcomingQuizCount: number;
  myAttendanceSessionsCount: number;
  myNotesCount: number;
  recentProjects: any[]; // You can define a Project type if not already
}

export interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalClasses: number;
  percentage: number;
}

export interface MarksStats {
  totalExams: number;
  average: number;
  bestScore: number;
  worstScore: number;
}

export interface StudentDashboardData {
  attendanceStats: SubjectAttendanceStats[];
  marksStats: MarksStats;
}

export interface DomainStat {
  name: string;
  value: number;
}

export interface YearStat {
  year: number;
  count: number;
}

export interface AttendanceSubjectStat {
  subject: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface SubjectAttendanceStats {
  subject: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}