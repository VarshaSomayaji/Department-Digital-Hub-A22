import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMarks, deleteMarks } from '../../services/marks';
import { Marks } from '../../types/marks';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdVisibility, 
  MdEdit, 
  MdDelete, 
  MdGrade,
  MdSubject,
  MdClass,
  MdSchool,
  MdPeople,
  MdSearch,
  MdFilterList,
  MdBarChart,
  MdCheckCircle,
  MdCancel,
  MdTrendingUp
} from 'react-icons/md';
import { FaGraduationCap, FaChartLine } from 'react-icons/fa';

const FacultyMarksList: React.FC = () => {
  const { user } = useAuth();
  const [marksEntries, setMarksEntries] = useState<Marks[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Marks[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ batch: '', subject: '', examName: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const fetchMarks = async () => {
    try {
      const data = await getMarks(filters);
      setMarksEntries(data);
      setFilteredEntries(data);
    } catch (error) {
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, [filters]);

  useEffect(() => {
    let filtered = marksEntries;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.batch.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredEntries(filtered);
  }, [searchTerm, marksEntries]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMarks(id);
      toast.success('Marks entry deleted successfully');
      fetchMarks();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Delete failed. Please try again.');
    }
  };

  const canCreate = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);
  const canEditDelete = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);

  const calculateAverage = (entry: Marks): number => {
    if (entry.marksObtained.length === 0) return 0;
    const total = entry.marksObtained.reduce((sum, m) => sum + m.marks, 0);
    return total / entry.marksObtained.length;
  };

  const calculatePassPercentage = (entry: Marks): number => {
    if (entry.marksObtained.length === 0) return 0;
    const passingMarks = entry.maxMarks * 0.4; // Assuming 40% is passing
    const passed = entry.marksObtained.filter(m => m.marks >= passingMarks).length;
    return (passed / entry.marksObtained.length) * 100;
  };

  // Get unique subjects without using Set spread
  const getUniqueSubjects = (): string[] => {
    const subjects: string[] = [];
    marksEntries.forEach(entry => {
      if (!subjects.includes(entry.subject)) {
        subjects.push(entry.subject);
      }
    });
    return subjects;
  };

  // Statistics
  const stats = {
    total: marksEntries.length,
    totalStudents: marksEntries.reduce((sum, e) => sum + e.marksObtained.length, 0),
    averageMarks: marksEntries.length > 0
      ? (marksEntries.reduce((sum, e) => sum + calculateAverage(e), 0) / marksEntries.length).toFixed(1)
      : '0',
    subjects: getUniqueSubjects().length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marks entries...</p>
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
                Marks Entries
              </h1>
              <p className="text-gray-600 mt-1">
                Manage student marks and assessments
              </p>
            </div>
            {canCreate && (
              <Link
                to="/marks/new"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>Enter Marks</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {marksEntries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <MdGrade className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
                </div>
                <MdPeople className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Average Marks</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.averageMarks}%</p>
                </div>
                <MdTrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Subjects</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.subjects}</p>
                </div>
                <MdSubject className="w-8 h-8 text-yellow-500 opacity-50" />
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
                  placeholder="Search by exam, subject, or batch..."
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
              
              {/* Subject Filter */}
              <div className="flex-1 relative">
                <MdSubject className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Filter by subject"
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Exam Filter */}
              <div className="flex-1 relative">
                <MdSchool className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Filter by exam name"
                  value={filters.examName}
                  onChange={(e) => setFilters({ ...filters, examName: e.target.value })}
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

        {/* Marks Display */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdGrade className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No marks entries found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filters.batch || filters.subject || filters.examName
                ? 'Try adjusting your filters'
                : 'No marks entries have been created yet'}
            </p>
            {canCreate && (
              <Link
                to="/marks/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create First Entry</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => {
              const avgMarks = calculateAverage(entry);
              const passPercentage = calculatePassPercentage(entry);
              return (
                <div
                  key={entry._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MdGrade className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{entry.examName}</h3>
                          <p className="text-xs text-gray-500">{entry.subject}</p>
                        </div>
                      </div>
                      {canEditDelete && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <Link
                              to={`/marks/${entry._id}/edit`}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <MdEdit className="w-5 h-5" />
                            </Link>
                            {deleteConfirm === entry._id ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleDelete(entry._id)}
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
                                onClick={() => setDeleteConfirm(entry._id)}
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

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <FaGraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Batch {entry.batch}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MdPeople className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{entry.marksObtained.length} students</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MdBarChart className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Max Marks: {entry.maxMarks}</span>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-2 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Average Score</span>
                        <span className="font-semibold text-gray-800">{avgMarks.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${avgMarks}%`,
                            backgroundColor: avgMarks >= 60 ? '#10B981' : avgMarks >= 40 ? '#F59E0B' : '#EF4444'
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">Pass Rate</span>
                        <span className="font-semibold text-green-600">{passPercentage.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t">
                      <Link
                        to={`/marks/${entry._id}`}
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
                      Exam
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Max Marks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Average
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MdSchool className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{entry.examName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MdSubject className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{entry.subject}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FaGraduationCap className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">Batch {entry.batch}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{entry.maxMarks}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MdPeople className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{entry.marksObtained.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MdTrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{calculateAverage(entry).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/marks/${entry._id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="View"
                          >
                            <MdVisibility className="w-5 h-5" />
                          </Link>
                          {canEditDelete && (
                            <>
                              <Link
                                to={`/marks/${entry._id}/edit`}
                                className="text-green-600 hover:text-green-800 transition-colors p-1"
                                title="Edit"
                              >
                                <MdEdit className="w-5 h-5" />
                              </Link>
                              {deleteConfirm === entry._id ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleDelete(entry._id)}
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
                                  onClick={() => setDeleteConfirm(entry._id)}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyMarksList;