import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getQuizzes, deleteQuiz } from '../../services/quiz';
import { Quiz } from '../../types/quiz';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdVisibility, 
  MdEdit, 
  MdDelete, 
  MdQuiz,
  MdSubject,
  MdClass,
  MdSchedule,
  MdTimeline,
  MdBarChart,
  MdSearch,
  MdFilterList,
  MdCheckCircle,
  MdCancel,
  MdPending
} from 'react-icons/md';
import { FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';

const FacultyQuizList: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const fetchQuizzes = async () => {
    try {
      const data = await getQuizzes();
      setQuizzes(data);
      setFilteredQuizzes(data);
    } catch (error) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    let filtered = quizzes;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply batch filter
    if (filterBatch) {
      filtered = filtered.filter(quiz => quiz.batch === filterBatch);
    }
    
    setFilteredQuizzes(filtered);
  }, [searchTerm, filterBatch, quizzes]);

  const handleDelete = async (id: string) => {
    try {
      await deleteQuiz(id);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Delete failed. Please try again.');
    }
  };

  const canCreate = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);
  const canEditDelete = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);

  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(quiz.endTime);
    
    if (now < start) {
      return { text: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-100', icon: <MdSchedule className="w-4 h-4" /> };
    } else if (now >= start && now <= end) {
      return { text: 'Active', color: 'text-green-600', bg: 'bg-green-100', icon: <MdCheckCircle className="w-4 h-4" /> };
    } else {
      return { text: 'Expired', color: 'text-red-600', bg: 'bg-red-100', icon: <MdCancel className="w-4 h-4" /> };
    }
  };

  const getUniqueBatches = () => {
    const batches: string[] = [];
    quizzes.forEach(quiz => {
      if (!batches.includes(quiz.batch)) {
        batches.push(quiz.batch);
      }
    });
    return batches;
  };

  // Statistics
  const stats = {
    total: quizzes.length,
    active: quizzes.filter(q => {
      const now = new Date();
      const start = new Date(q.startTime);
      const end = new Date(q.endTime);
      return now >= start && now <= end;
    }).length,
    upcoming: quizzes.filter(q => new Date(q.startTime) > new Date()).length,
    expired: quizzes.filter(q => new Date(q.endTime) < new Date()).length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quizzes...</p>
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
                Quizzes
              </h1>
              <p className="text-gray-600 mt-1">
                Create and manage assessments for your students
              </p>
            </div>
            {canCreate && (
              <Link
                to="/quizzes/new"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create Quiz</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <MdQuiz className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
              </div>
              <MdCheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming</p>
                <p className="text-2xl font-bold text-gray-800">{stats.upcoming}</p>
              </div>
              <MdSchedule className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Expired</p>
                <p className="text-2xl font-bold text-gray-800">{stats.expired}</p>
              </div>
              <MdCancel className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Batch Filter */}
              <div className="w-48 relative">
                <MdFilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Batches</option>
                  {getUniqueBatches().map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
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

        {/* Quizzes Display */}
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdQuiz className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterBatch 
                ? 'Try adjusting your filters' 
                : 'No quizzes have been created yet'}
            </p>
            {canCreate && (
              <Link
                to="/quizzes/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create First Quiz</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const status = getQuizStatus(quiz);
              return (
                <div
                  key={quiz._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MdQuiz className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 line-clamp-1">
                          {quiz.title}
                        </h3>
                      </div>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.icon}
                        <span>{status.text}</span>
                      </span>
                    </div>

                    {/* Subject & Batch */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <MdSubject className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{quiz.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <FaGraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Batch {quiz.batch}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MdSchedule className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(quiz.startTime).toLocaleDateString()} - {new Date(quiz.endTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MdTimeline className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Duration: {Math.round((new Date(quiz.endTime).getTime() - new Date(quiz.startTime).getTime()) / (1000 * 60))} minutes
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-3 border-t">
                      <Link
                        to={`/quizzes/${quiz._id}/results`}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        <MdBarChart className="w-4 h-4" />
                        <span>Results</span>
                      </Link>
                      {canEditDelete && (
                        <div className="flex space-x-1">
                          <Link
                            to={`/quizzes/${quiz._id}/edit`}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </Link>
                          {deleteConfirm === quiz._id ? (
                            <div className="flex space-x-1 items-center">
                              <button
                                onClick={() => handleDelete(quiz._id)}
                                className="text-red-600 text-xs font-medium px-1"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-600 text-xs font-medium px-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(quiz._id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
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
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuizzes.map((quiz) => {
                    const status = getQuizStatus(quiz);
                    return (
                      <tr key={quiz._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <MdQuiz className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{quiz.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <MdSubject className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{quiz.subject}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <FaGraduationCap className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">Batch {quiz.batch}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quiz.startTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quiz.endTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.icon}
                            <span>{status.text}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Link
                              to={`/quizzes/${quiz._id}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                              title="View"
                            >
                              <MdVisibility className="w-5 h-5" />
                            </Link>
                            <Link
                              to={`/quizzes/${quiz._id}/results`}
                              className="text-purple-600 hover:text-purple-800 transition-colors p-1"
                              title="Results"
                            >
                              <MdBarChart className="w-5 h-5" />
                            </Link>
                            {canEditDelete && (
                              <>
                                <Link
                                  to={`/quizzes/${quiz._id}/edit`}
                                  className="text-green-600 hover:text-green-800 transition-colors p-1"
                                  title="Edit"
                                >
                                  <MdEdit className="w-5 h-5" />
                                </Link>
                                {deleteConfirm === quiz._id ? (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleDelete(quiz._id)}
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
                                    onClick={() => setDeleteConfirm(quiz._id)}
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

export default FacultyQuizList;