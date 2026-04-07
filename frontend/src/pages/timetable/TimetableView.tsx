import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getTimetables, deleteTimetable } from '../../services/timetable';
import { Timetable } from '../../types/timetable';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSchedule, 
  MdClass, 
  MdSubject,
  MdPerson,
  MdAccessTime,
  MdFilterList,
  MdSearch,
  MdCalendarToday,
  MdSchool,
  MdVisibility
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher,
  FaClock,
  FaCalendarAlt
} from 'react-icons/fa';

const TimetableView: React.FC = () => {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [filteredTimetables, setFilteredTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ batch: '', day: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedTimetable, setExpandedTimetable] = useState<string | null>(null);

  const fetchTimetables = async () => {
    try {
      const data = await getTimetables(filters);
      setTimetables(data);
      setFilteredTimetables(data);
    } catch (error) {
      toast.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, [filters]);

  useEffect(() => {
    let filtered = timetables;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tt => 
        tt.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tt.day.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTimetables(filtered);
  }, [searchTerm, timetables]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTimetable(id);
      toast.success('Timetable deleted successfully');
      fetchTimetables();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Delete failed. Please try again.');
    }
  };

  const canEdit = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get unique batches without using Set spread
  const getUniqueBatches = () => {
    const batches: string[] = [];
    timetables.forEach(tt => {
      if (!batches.includes(tt.batch)) {
        batches.push(tt.batch);
      }
    });
    return batches.length;
  };

  // Get unique days without using Set spread
  const getUniqueDays = () => {
    const daysList: string[] = [];
    timetables.forEach(tt => {
      if (!daysList.includes(tt.day)) {
        daysList.push(tt.day);
      }
    });
    return daysList.length;
  };

  // Statistics
  const stats = {
    total: timetables.length,
    batches: getUniqueBatches(),
    days: getUniqueDays(),
    totalPeriods: timetables.reduce((sum, t) => sum + t.periods.length, 0),
  };

  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      Monday: 'bg-blue-100 text-blue-700',
      Tuesday: 'bg-green-100 text-green-700',
      Wednesday: 'bg-purple-100 text-purple-700',
      Thursday: 'bg-orange-100 text-orange-700',
      Friday: 'bg-red-100 text-red-700',
      Saturday: 'bg-teal-100 text-teal-700',
    };
    return colors[day] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading timetables...</p>
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
                Timetable
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage class schedules
              </p>
            </div>
            {canEdit && (
              <Link
                to="/timetable/new"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create Timetable</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {timetables.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Timetables</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <MdSchedule className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Batches</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.batches}</p>
                </div>
                <FaGraduationCap className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Days</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.days}</p>
                </div>
                <FaCalendarAlt className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Periods</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalPeriods}</p>
                </div>
                <FaClock className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by batch or day..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Batch Filter */}
              <div className="flex-1 relative">
                <MdFilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Filter by batch"
                  value={filters.batch}
                  onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Day Filter */}
              <div className="w-48 relative">
                <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filters.day}
                  onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Days</option>
                  {days.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Timetables Display */}
        {filteredTimetables.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdSchedule className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timetables found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filters.batch || filters.day
                ? 'Try adjusting your filters'
                : 'No timetables have been created yet'}
            </p>
            {canEdit && (
              <Link
                to="/timetable/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create Timetable</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTimetables.map((tt) => (
              <div
                key={tt._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDayColor(tt.day)}`}>
                        {tt.day}
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaGraduationCap className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-800">Batch {tt.batch}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex space-x-2">
                        <Link
                          to={`/timetable/${tt._id}/edit`}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <MdEdit className="w-5 h-5" />
                        </Link>
                        {deleteConfirm === tt._id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDelete(tt._id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium px-2"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium px-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(tt._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timetable Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <MdAccessTime className="w-4 h-4" />
                            <span>Period</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <MdSubject className="w-4 h-4" />
                            <span>Subject</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FaChalkboardTeacher className="w-4 h-4" />
                            <span>Faculty</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FaClock className="w-4 h-4" />
                            <span>Start Time</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FaClock className="w-4 h-4" />
                            <span>End Time</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tt.periods
                        .sort((a, b) => a.periodNumber - b.periodNumber)
                        .map((period) => (
                          <tr key={period.periodNumber} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-800">{period.periodNumber}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <MdSubject className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{period.subject}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <MdPerson className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{period.faculty.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-1">
                                <FaClock className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">{period.startTime}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-1">
                                <FaClock className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">{period.endTime}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>


              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TimetableView;