import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudentDashboardData } from '../../services/dashboard';
import { StudentDashboardData, SubjectAttendanceStats } from '../../types/dashboard';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAttachMoney, 
  MdBarChart, 
  MdEventNote, 
  MdGrade, 
  MdQuiz,
  MdSchedule,
  MdTrendingUp,
  MdRefresh,
  MdDownload,
  MdArrowForward,
  MdSchool,
  MdAssignment,
  MdPeople,
  MdCheckCircle,
  MdWarning,
  MdInfo
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaChartLine,
  FaCalendarAlt,
  FaBook,
  FaTrophy,
  FaMedal
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Helper to compute overall attendance from per‑subject stats
const computeOverallAttendance = (stats: SubjectAttendanceStats[]): { percentage: number; present: number; total: number; late: number; absent: number } => {
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  stats.forEach(s => {
    totalPresent += s.present;
    totalAbsent += s.absent;
    totalLate += s.late;
  });
  const total = totalPresent + totalAbsent + totalLate;
  const percentage = total > 0 ? ((totalPresent + totalLate) / total) * 100 : 0;
  return { 
    percentage: parseFloat(percentage.toFixed(1)), 
    present: totalPresent, 
    total,
    late: totalLate,
    absent: totalAbsent
  };
};

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getStudentDashboardData();
      setData(result);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
    toast.success('Dashboard refreshed');
  };

  const handleExport = () => {
    if (!data) return;
    
    const overallAttendance = computeOverallAttendance(data.attendanceStats);
    
    const csvData = [
      ['Metric', 'Value'],
      ['Overall Attendance', `${overallAttendance.percentage}%`],
      ['Present Days', overallAttendance.present],
      ['Late Days', overallAttendance.late],
      ['Absent Days', overallAttendance.absent],
      ['Average Marks', data.marksStats.average],
      ['Highest Score', data.marksStats.bestScore],
      ['Total Subjects', data.attendanceStats.length],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-dashboard-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No data available</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const overallAttendance = computeOverallAttendance(data.attendanceStats);
  const attendanceColor = overallAttendance.percentage >= 75 ? 'text-green-600' : overallAttendance.percentage >= 60 ? 'text-yellow-600' : 'text-red-600';
  const marksColor = data.marksStats.average >= 70 ? 'text-green-600' : data.marksStats.average >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Track your academic performance and progress
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MdRefresh className="w-5 h-5 text-gray-600" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors"
              >
                <MdDownload className="w-5 h-5" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Attendance Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaCalendarAlt className="w-6 h-6 text-blue-600" />
              </div>
              <Link 
                to="/attendance/my" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>Details</span>
                <MdArrowForward className="w-4 h-4" />
              </Link>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Overall Attendance</h3>
            <p className={`text-3xl font-bold mt-1 ${attendanceColor}`}>
              {overallAttendance.percentage}%
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex justify-between mb-1">
                <span>Present: {overallAttendance.present}</span>
                <span>Late: {overallAttendance.late}</span>
                <span>Absent: {overallAttendance.absent}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${overallAttendance.percentage}%`,
                    backgroundColor: overallAttendance.percentage >= 75 ? '#10B981' : overallAttendance.percentage >= 60 ? '#F59E0B' : '#EF4444'
                  }}
                ></div>
              </div>
              <p className="mt-1">Total: {overallAttendance.total} days</p>
            </div>
          </div>

          {/* Marks Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <MdGrade className="w-6 h-6 text-green-600" />
              </div>
              <Link 
                to="/marks/student" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>Details</span>
                <MdArrowForward className="w-4 h-4" />
              </Link>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Average Marks</h3>
            <p className={`text-3xl font-bold mt-1 ${marksColor}`}>
              {data.marksStats.average}%
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <FaTrophy className="w-4 h-4 text-yellow-500" />
                <span>Highest Score: {data.marksStats.bestScore}%</span>
              </div>
            </div>
          </div>

          {/* Subjects Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaBook className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Subjects</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {data.attendanceStats.length}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <p>Active subjects this semester</p>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FaChartLine className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Performance</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {overallAttendance.percentage >= 75 && data.marksStats.average >= 70 ? 'Excellent' :
               overallAttendance.percentage >= 60 && data.marksStats.average >= 50 ? 'Good' : 'Needs Improvement'}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <p>Based on attendance & marks</p>
            </div>
          </div>
        </div>

        {/* Subject-wise Attendance Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MdSchedule className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-800">Subject-wise Attendance</h2>
              </div>
              <Link 
                to="/attendance/my" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <MdArrowForward className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.attendanceStats.slice(0, 5).map((subject, idx) => {
                const subjectTotal = subject.present + subject.absent + subject.late;
                const subjectPercentage = subjectTotal > 0 ? ((subject.present + subject.late) / subjectTotal) * 100 : 0;
                const subjectColor = subjectPercentage >= 75 ? 'text-green-600' : subjectPercentage >= 60 ? 'text-yellow-600' : 'text-red-600';
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FaBook className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-800">{subject.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${subjectColor}`}>
                          {subjectPercentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          ({subject.present + subject.late}/{subjectTotal})
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${subjectPercentage}%`,
                          backgroundColor: subjectPercentage >= 75 ? '#10B981' : subjectPercentage >= 60 ? '#F59E0B' : '#EF4444'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            {data.attendanceStats.length > 5 && (
              <div className="mt-4 text-center">
                <Link to="/attendance/my" className="text-blue-600 hover:text-blue-700 text-sm">
                  +{data.attendanceStats.length - 5} more subjects
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/attendance/my"
            className="group bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <MdSchedule className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Attendance</h3>
            </div>
            <p className="text-sm text-gray-600">View detailed attendance records</p>
          </Link>

          <Link 
            to="/marks/student"
            className="group bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <MdGrade className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Marks</h3>
            </div>
            <p className="text-sm text-gray-600">Check your marks and performance</p>
          </Link>

          <Link 
            to="/quizzes/student"
            className="group bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <MdQuiz className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Quizzes</h3>
            </div>
            <p className="text-sm text-gray-600">Take quizzes and view results</p>
          </Link>
        </div>

        {/* Tips Card */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <MdInfo className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Academic Tips:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Maintain at least 75% attendance to be eligible for exams</li>
                <li>• Regular practice and revision help improve marks</li>
                <li>• Participate in quizzes to test your knowledge</li>
                <li>• Review your performance regularly to identify areas for improvement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;