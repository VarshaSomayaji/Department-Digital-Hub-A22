import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyAttendance } from '../../services/attendance';
import { Attendance } from '../../types/attendance';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdDateRange, 
  MdSubject, 
  MdCheckCircle, 
  MdCancel, 
  MdSchedule,
  MdTrendingUp,
  MdWarning,
  MdInfo,
  MdRefresh,
  MdDownload
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher,
  FaChartLine,
  FaCalendarAlt
} from 'react-icons/fa';

const StudentAttendanceView: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  useEffect(() => {
    if (!user) return;
    fetchAttendance();
  }, [user]);

  const fetchAttendance = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const studentBatch = (user as any).batch || '2024';
      const data = await getMyAttendance(studentBatch, user._id);
      setSessions(data);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAttendance();
    toast.success('Attendance refreshed');
  };

  const handleExport = () => {
    if (sessions.length === 0) return;
    
    const csvData = [
      ['Date', 'Subject', 'Status'],
      ...sessions.map(session => [
        new Date(session.date).toLocaleDateString(),
        session.subject,
        session.records[0].status
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Attendance exported successfully');
  };

  // Group by subject for summary
  const summary: Record<string, { present: number; absent: number; late: number; total: number }> = {};
  sessions.forEach(session => {
    const record = session.records[0];
    if (!summary[session.subject]) {
      summary[session.subject] = { present: 0, absent: 0, late: 0, total: 0 };
    }
    if (record.status === 'Present') summary[session.subject].present++;
    else if (record.status === 'Absent') summary[session.subject].absent++;
    else if (record.status === 'Late') summary[session.subject].late++;
    summary[session.subject].total++;
  });

  // Calculate overall attendance
  const totalPresent = Object.values(summary).reduce((sum, s) => sum + s.present, 0);
  const totalLate = Object.values(summary).reduce((sum, s) => sum + s.late, 0);
  const totalAbsent = Object.values(summary).reduce((sum, s) => sum + s.absent, 0);
  const totalClasses = totalPresent + totalLate + totalAbsent;
  const overallPercentageValue = totalClasses > 0 ? ((totalPresent + totalLate) / totalClasses * 100) : 0;
  const overallPercentage = overallPercentageValue.toFixed(1);
  const attendanceColor = overallPercentageValue >= 75 ? 'text-green-600' : overallPercentageValue >= 60 ? 'text-yellow-600' : 'text-red-600';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance records...</p>
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
                My Attendance
              </h1>
              <p className="text-gray-600 mt-1">
                Track your attendance across all subjects
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
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overall Stats Card */}
        {sessions.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-90">Total Classes</p>
                <p className="text-3xl font-bold">{totalClasses}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Present</p>
                <p className="text-3xl font-bold">{totalPresent + totalLate}</p>
                <p className="text-xs opacity-80">({totalPresent} present, {totalLate} late)</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Absent</p>
                <p className="text-3xl font-bold">{totalAbsent}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Overall Attendance</p>
                <p className={`text-3xl font-bold ${attendanceColor}`}>
                  {overallPercentage}%
                </p>
                <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-white transition-all duration-500"
                    style={{ width: `${overallPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-end">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('summary')}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'summary'
                        ? 'bg-white shadow-md text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Summary View
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'detailed'
                        ? 'bg-white shadow-md text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Detailed View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdSchedule className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
            <p className="text-gray-500">Your attendance records will appear here once they are marked.</p>
          </div>
        ) : viewMode === 'summary' ? (
          /* Summary View - Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(summary).map(([subject, stats]) => {
              const percentageValue = ((stats.present + stats.late) / stats.total * 100);
              const percentage = percentageValue.toFixed(1);
              const percentColor = percentageValue >= 75 ? 'text-green-600' : percentageValue >= 60 ? 'text-yellow-600' : 'text-red-600';
              return (
                <div key={subject} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaChalkboardTeacher className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">{subject}</h3>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <MdCheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">Present</span>
                        </div>
                        <span className="font-semibold text-gray-800">{stats.present}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <MdSchedule className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">Late</span>
                        </div>
                        <span className="font-semibold text-gray-800">{stats.late}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <MdCancel className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-600">Absent</span>
                        </div>
                        <span className="font-semibold text-gray-800">{stats.absent}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500">Attendance Rate</span>
                        <span className={`text-sm font-semibold ${percentColor}`}>{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: percentageValue >= 75 ? '#10B981' : percentageValue >= 60 ? '#F59E0B' : '#EF4444'
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Total classes: {stats.total}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Detailed View - Table */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <MdDateRange className="w-4 h-4" />
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <MdSubject className="w-4 h-4" />
                        <span>Subject</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <FaCalendarAlt className="w-4 h-4" />
                        <span>Status</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map((session) => {
                    const status = session.records[0].status;
                    const statusConfig = {
                      Present: { color: 'bg-green-100 text-green-800', icon: <MdCheckCircle className="w-4 h-4" /> },
                      Late: { color: 'bg-yellow-100 text-yellow-800', icon: <MdSchedule className="w-4 h-4" /> },
                      Absent: { color: 'bg-red-100 text-red-800', icon: <MdCancel className="w-4 h-4" /> }
                    };
                    const config = statusConfig[status as keyof typeof statusConfig];
                    return (
                      <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <MdDateRange className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(session.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <MdSubject className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{session.subject}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            {config.icon}
                            <span>{status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tips Card */}
        {sessions.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <MdInfo className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Attendance Tips:</p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• Maintain at least 75% attendance to be eligible for final exams</li>
                  <li>• 3 consecutive late marks may be counted as 1 absence</li>
                  <li>• Report any discrepancies to your faculty immediately</li>
                  <li>• Check your attendance regularly to stay on track</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendanceView;