import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAttendance, deleteAttendance } from '../../services/attendance';
import { Attendance } from '../../types/attendance';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdVisibility, 
  MdEdit, 
  MdDelete, 
  MdDateRange,
  MdSubject,
  MdClass,
  MdPeople,
  MdSearch,
  MdFilterList,
  MdSchedule,
  MdCheckCircle,
  MdCancel,
  MdPending
} from 'react-icons/md';
import { FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa';

const FacultyAttendanceList: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Attendance[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ batch: '', subject: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const fetchSessions = async () => {
    try {
      const data = await getAttendance(filter);
      setSessions(data);
      setFilteredSessions(data);
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  useEffect(() => {
    let filtered = sessions;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.batch.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSessions(filtered);
  }, [searchTerm, sessions]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAttendance(id);
      toast.success('Attendance record deleted successfully');
      fetchSessions();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Delete failed. Please try again.');
    }
  };

  const canCreate = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);
  const canEditDelete = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);

  const getAttendanceRate = (session: Attendance) => {
    const total = session.records.length;
    const present = session.records.filter(r => r.status === 'Present').length;
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 75) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 75) return <MdCheckCircle className="w-4 h-4 text-green-500" />;
    if (rate >= 50) return <MdPending className="w-4 h-4 text-yellow-500" />;
    return <MdCancel className="w-4 h-4 text-red-500" />;
  };

  // Statistics
  const stats = {
    total: sessions.length,
    thisMonth: sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const now = new Date();
      return sessionDate.getMonth() === now.getMonth() && 
             sessionDate.getFullYear() === now.getFullYear();
    }).length,
    totalStudents: sessions.reduce((sum, s) => sum + s.records.length, 0),
    averageAttendance: sessions.length > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + getAttendanceRate(s), 0) / sessions.length)
      : 0,
  };

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
                Attendance Records
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track student attendance
              </p>
            </div>
            {canCreate && (
              <Link
                to="/attendance/mark"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>Mark Attendance</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <MdSchedule className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">This Month</p>
                <p className="text-2xl font-bold text-gray-800">{stats.thisMonth}</p>
              </div>
              <MdDateRange className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Records</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
              <MdPeople className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg. Attendance</p>
                <p className="text-2xl font-bold text-gray-800">{stats.averageAttendance}%</p>
              </div>
              <MdCheckCircle className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Batch Filter */}
              <div className="flex-1 relative">
                <MdFilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Filter by batch (e.g., 2024)"
                  value={filter.batch}
                  onChange={(e) => setFilter({ ...filter, batch: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Subject Filter */}
              <div className="flex-1 relative">
                <MdSubject className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Filter by subject"
                  value={filter.subject}
                  onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Search Input */}
              <div className="flex-1 relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by subject or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records Display */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdSchedule className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filter.batch || filter.subject 
                ? 'Try adjusting your filters' 
                : 'No attendance records have been marked yet'}
            </p>
            {canCreate && (
              <Link
                to="/attendance/mark"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Mark First Attendance</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
              const attendanceRate = getAttendanceRate(session);
              return (
                <div
                  key={session._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MdDateRange className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date(session.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      {canEditDelete && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <Link
                              to={`/attendance/${session._id}/edit`}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <MdEdit className="w-5 h-5" />
                            </Link>
                            {deleteConfirm === session._id ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleDelete(session._id)}
                                  className="text-red-600 text-sm font-medium"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-gray-600 text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(session._id)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <MdDelete className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Subject & Batch */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <MdSubject className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-800">{session.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaGraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Batch {session.batch}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdPeople className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{session.records.length} students</span>
                      </div>
                    </div>

                    {/* Attendance Rate */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Attendance Rate</span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(attendanceRate)}
                          <span className={`text-sm font-semibold ${getAttendanceColor(attendanceRate)}`}>
                            {attendanceRate}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${attendanceRate}%`,
                            backgroundColor: attendanceRate >= 75 ? '#10B981' : attendanceRate >= 50 ? '#F59E0B' : '#EF4444'
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t">
                      <Link
                        to={`/attendance/${session._id}`}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <MdVisibility className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Attendance Rate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSessions.map((session) => {
                    const attendanceRate = getAttendanceRate(session);
                    return (
                      <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <MdDateRange className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(session.date).toLocaleDateString()}
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
                          <div className="flex items-center space-x-2">
                            <FaGraduationCap className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">Batch {session.batch}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <MdPeople className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{session.records.length}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(attendanceRate)}
                            <div className="flex-1 max-w-24">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{ 
                                    width: `${attendanceRate}%`,
                                    backgroundColor: attendanceRate >= 75 ? '#10B981' : attendanceRate >= 50 ? '#F59E0B' : '#EF4444'
                                  }}
                                ></div>
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${getAttendanceColor(attendanceRate)}`}>
                              {attendanceRate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Link
                              to={`/attendance/${session._id}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                              title="View"
                            >
                              <MdVisibility className="w-5 h-5" />
                            </Link>
                            {canEditDelete && (
                              <>
                                <Link
                                  to={`/attendance/${session._id}/edit`}
                                  className="text-green-600 hover:text-green-800 transition-colors p-1"
                                  title="Edit"
                                >
                                  <MdEdit className="w-5 h-5" />
                                </Link>
                                {deleteConfirm === session._id ? (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleDelete(session._id)}
                                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(session._id)}
                                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                                    title="Delete"
                                  >
                                    <MdDelete className="w-5 h-5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyAttendanceList;