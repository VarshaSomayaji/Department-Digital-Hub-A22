import API from './api';
import {
  AdminDashboardData,
  HODDashboardData,
  FacultyDashboardData,
  StudentDashboardData,
  AttendanceStats,
  MarksStats,
} from '../types/dashboard';

// Helper to compute attendance statistics from raw records
const computeAttendanceStats = (attendanceRecords: any[]): AttendanceStats => {
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  let totalSessions = 0;

  attendanceRecords.forEach((record) => {
    if (record.status === 'Present') totalPresent++;
    else if (record.status === 'Absent') totalAbsent++;
    else if (record.status === 'Late') totalLate++;
    totalSessions++;
  });

  const totalClasses = totalPresent + totalAbsent + totalLate;
  const percentage = totalClasses > 0 ? ((totalPresent + totalLate) / totalClasses) * 100 : 0;

  return {
    totalPresent,
    totalAbsent,
    totalLate,
    totalClasses,
    percentage: parseFloat(percentage.toFixed(2)),
  };
};

// Helper to compute marks statistics
const computeMarksStats = (marksData: any[]): MarksStats => {
  let totalMarks = 0;
  let totalExams = 0;
  let bestScore = 0;
  let worstScore = Infinity;

  marksData.forEach((entry) => {
    const score = entry.marks;
    totalMarks += score;
    totalExams++;
    if (score > bestScore) bestScore = score;
    if (score < worstScore) worstScore = score;
  });

  const average = totalExams > 0 ? totalMarks / totalExams : 0;

  return {
    totalExams,
    average: parseFloat(average.toFixed(2)),
    bestScore,
    worstScore: worstScore === Infinity ? 0 : worstScore,
  };
};

// ==================== ADMIN DASHBOARD ====================
export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const [userStats, projectDomainStats, projectYearStats, growthStats] = await Promise.all([
    API.get('/admin/stats/users'),
    API.get('/projects/stats/domains'),
    API.get('/projects/stats/years'),
    API.get('/admin/stats/growth?months=6'),
  ]);

  const totalProjects = projectDomainStats.data.reduce(
    (acc: number, curr: any) => acc + curr.value,
    0
  );

  return {
    userStats: userStats.data,
    projectStats: {
      totalProjects,
      byDomain: projectDomainStats.data,
      byYear: projectYearStats.data,
    },
    growthStats: growthStats.data,
  };
};

// ==================== HOD DASHBOARD ====================
export const getHODDashboardData = async (): Promise<HODDashboardData> => {
  const [departmentStats, projectDomainStats, pendingLeaveCount] = await Promise.all([
    API.get('/department/stats'),
    API.get('/projects/stats/domains'), // optionally filter by department on backend
    API.get('/leave/count/pending'),
  ]);

  return {
    departmentStats: departmentStats.data,
    projectDomainStats: projectDomainStats.data,
    pendingLeaveCount: pendingLeaveCount.data.count,
  };
};

// ==================== FACULTY DASHBOARD ====================
export const getFacultyDashboardData = async (): Promise<FacultyDashboardData> => {
  const [myQuizzes, myAttendance, myNotes, myProjects] = await Promise.all([
    API.get('/quizzes?faculty=' + localStorage.getItem('userId')), // assumes userId stored; better to use /quizzes?faculty=me
    API.get('/attendance?faculty=' + localStorage.getItem('userId')),
    API.get('/notes?faculty=' + localStorage.getItem('userId')),
    API.get('/projects/my/recent?limit=5'),
  ]);

  // Use proper endpoint that filters by current user; for now, we use the count from arrays
  const upcomingQuizCount = myQuizzes.data.filter((q: any) => {
    const now = new Date();
    return new Date(q.startTime) <= now && new Date(q.endTime) >= now;
  }).length;

  return {
    myQuizzesCount: myQuizzes.data.length,
    upcomingQuizCount,
    myAttendanceSessionsCount: myAttendance.data.length,
    myNotesCount: myNotes.data.length,
    recentProjects: myProjects.data,
  };
};

// ==================== STUDENT DASHBOARD ====================
export const getStudentDashboardData = async (): Promise<StudentDashboardData> => {
  const [attendanceStats] = await Promise.all([
    API.get('/attendance/my/stats'),
  ]);

  // If /marks/my is not yet implemented, we can fetch all marks and filter
  let marksData: any[] = [];
  try {
    const marksResponse = await API.get('/marks');
    // Filter marks for the current student (assuming backend doesn't filter)
    marksData = marksResponse.data.filter((m: any) =>
      m.marksObtained.some((r: any) => r.student._id === localStorage.getItem('userId'))
    );
  } catch (error) {
    console.error('Failed to fetch marks', error);
  }

  const computedMarks = computeMarksStats(marksData);

  return {
    attendanceStats: attendanceStats.data,
    marksStats: computedMarks
  };
};