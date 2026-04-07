import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFacultyDashboardData } from '../../services/dashboard';
import { FacultyDashboardData } from '../../types/dashboard';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdQuiz, 
  MdSchedule, 
  MdEventNote, 
  MdDescription, 
  MdTrendingUp,
  MdRefresh,
  MdDownload,
  MdArrowForward,
  MdSchool,
  MdAssignment,
  MdPeople
} from 'react-icons/md';
import { 
  FaChalkboardTeacher, 
  FaProjectDiagram,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const FacultyDashboard: React.FC = () => {
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getFacultyDashboardData();
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
    
    const csvData = [
      ['Metric', 'Value'],
      ['My Quizzes', data.myQuizzesCount],
      ['Upcoming Quizzes', data.upcomingQuizCount],
      ['Attendance Sessions', data.myAttendanceSessionsCount],
      ['Notes Uploaded', data.myNotesCount],
      ['Recent Projects', data.recentProjects.length],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty-dashboard-${new Date().toISOString()}.csv`;
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

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Faculty Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's an overview of your teaching activities
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MdQuiz className="w-6 h-6 text-blue-600" />
              </div>
              <Link 
                to="/quizzes" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <MdArrowForward className="w-4 h-4" />
              </Link>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">My Quizzes</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{data.myQuizzesCount}</p>
            <div className="mt-2 text-xs text-gray-400">
              Total quizzes created
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <MdSchedule className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Upcoming Quizzes</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{data.upcomingQuizCount}</p>
            <div className="mt-2 text-xs text-gray-400">
              Scheduled for this week
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <MdEventNote className="w-6 h-6 text-purple-600" />
              </div>
              <Link 
                to="/attendance" 
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <MdArrowForward className="w-4 h-4" />
              </Link>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Attendance Sessions</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{data.myAttendanceSessionsCount}</p>
            <div className="mt-2 text-xs text-gray-400">
              Total sessions conducted
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <MdDescription className="w-6 h-6 text-yellow-600" />
              </div>
              <Link 
                to="/notes" 
                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <MdArrowForward className="w-4 h-4" />
              </Link>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Notes Uploaded</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{data.myNotesCount}</p>
            <div className="mt-2 text-xs text-gray-400">
              Shared with students
            </div>
          </div>
        </div>
        {/* Recent Projects Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaProjectDiagram className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-800">Recent Projects</h2>
              </div>
              <Link 
                to="/projects" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All Projects</span>
                <MdArrowForward className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {data.recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FaProjectDiagram className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent projects</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentProjects.map((proj) => (
                  <div
                    key={proj._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="flex-1">
                      <Link 
                        to={`/projects/${proj._id}`}
                        className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                      >
                        {proj.title}
                      </Link>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center space-x-1">
                          <MdSchool className="w-3 h-3" />
                          <span>{(proj as any).domain || 'General'}</span>
                        </span>
                        <span className="text-xs text-gray-500 flex items-center space-x-1">
                          <MdSchedule className="w-3 h-3" />
                          <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/projects/${proj._id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-blue-600 hover:text-blue-800"
                    >
                      <MdArrowForward className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
            <div className="flex items-center space-x-3 mb-3">
              <MdAssignment className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <Link 
                to="/quizzes/new" 
                className="block text-blue-600 hover:text-blue-700 text-sm"
              >
                → Create a new quiz
              </Link>
              <Link 
                to="/attendance/mark" 
                className="block text-blue-600 hover:text-blue-700 text-sm"
              >
                → Mark attendance
              </Link>
              <Link 
                to="/notes/new" 
                className="block text-blue-600 hover:text-blue-700 text-sm"
              >
                → Upload notes
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5">
            <div className="flex items-center space-x-3 mb-3">
              <FaChalkboardTeacher className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-800">Teaching Tips</h3>
            </div>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Regular quizzes help track student progress</li>
              <li>• Upload notes after each session</li>
              <li>• Maintain consistent attendance records</li>
              <li>• Encourage student projects and innovation</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;