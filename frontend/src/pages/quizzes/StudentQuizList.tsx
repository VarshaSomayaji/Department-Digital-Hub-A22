import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getQuizzes } from '../../services/quiz';
import { Quiz } from '../../types/quiz';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdQuiz, 
  MdSchedule, 
  MdSubject, 
  MdAccessTime, 
  MdPlayArrow,
  MdInfo,
  MdRefresh,
  MdSearch,
  MdFilterList
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaClock, 
  FaCalendarAlt,
  FaHourglassHalf
} from 'react-icons/fa';

const StudentQuizList: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!user) return;
    fetchQuizzes();
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const studentBatch = (user as any).batch || '';
      const data = await getQuizzes({ batch: studentBatch });
      // Only show quizzes that are currently active
      const now = new Date();
      const active = data.filter(q => new Date(q.startTime) <= now && new Date(q.endTime) >= now);
      setQuizzes(active);
      setFilteredQuizzes(active);
    } catch (error) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = quizzes;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply subject filter
    if (filterSubject) {
      filtered = filtered.filter(quiz => quiz.subject === filterSubject);
    }
    
    setFilteredQuizzes(filtered);
  }, [searchTerm, filterSubject, quizzes]);

  const handleRefresh = () => {
    fetchQuizzes();
    toast.success('Quizzes refreshed');
  };

  const getUniqueSubjects = () => {
    const subjects: string[] = [];
    quizzes.forEach(quiz => {
      if (!subjects.includes(quiz.subject)) {
        subjects.push(quiz.subject);
      }
    });
    return subjects;
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes} minutes remaining`;
  };

  // Statistics
  const stats = {
    total: quizzes.length,
    subjects: getUniqueSubjects().length,
    averageDuration: quizzes.length > 0 
      ? Math.round(quizzes.reduce((sum, q) => sum + q.duration, 0) / quizzes.length)
      : 0,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available quizzes...</p>
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
                Available Quizzes
              </h1>
              <p className="text-gray-600 mt-1">
                Test your knowledge with these active quizzes
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MdRefresh className="w-5 h-5 text-gray-600" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {quizzes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Available Quizzes</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <MdQuiz className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Subjects</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.subjects}</p>
                </div>
                <MdSubject className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg. Duration</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.averageDuration} min</p>
                </div>
                <FaHourglassHalf className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        {quizzes.length > 0 && (
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
                
                {/* Subject Filter */}
                <div className="w-48 relative">
                  <MdFilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Subjects</option>
                    {getUniqueSubjects().map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-md text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white shadow-md text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    List View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quizzes Display */}
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdQuiz className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterSubject
                ? 'Try adjusting your filters'
                : 'No active quizzes are available for your batch at the moment'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const timeRemaining = getTimeRemaining(quiz.endTime);
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
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                            {quiz.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                            <MdSubject className="w-3 h-3" />
                            <span>{quiz.subject}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {quiz.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}

                    {/* Quiz Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FaClock className="w-4 h-4" />
                        <span>Duration: {quiz.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FaCalendarAlt className="w-4 h-4" />
                        <span>Ends: {new Date(quiz.endTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <MdSchedule className="w-4 h-4" />
                        <span>{timeRemaining}</span>
                      </div>
                    </div>

                    {/* Start Button */}
                    <Link
                      to={`/quizzes/take/${quiz._id}`}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <MdPlayArrow className="w-5 h-5" />
                      <span>Start Quiz</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quiz Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ends At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Time Left
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuizzes.map((quiz) => {
                    const timeRemaining = getTimeRemaining(quiz.endTime);
                    return (
                      <tr key={quiz._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <MdQuiz className="w-4 h-4 text-blue-500" />
                            <div>
                              <div className="font-medium text-gray-900">{quiz.title}</div>
                              {quiz.description && (
                                <div className="text-sm text-gray-500 line-clamp-1">
                                  {quiz.description}
                                </div>
                              )}
                            </div>
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
                            <FaClock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{quiz.duration} min</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quiz.endTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1 text-green-600 text-sm">
                            <MdSchedule className="w-4 h-4" />
                            <span>{timeRemaining}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/quizzes/take/${quiz._id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <MdPlayArrow className="w-4 h-4" />
                            <span>Start</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Text */}
        {quizzes.length === 0 && !loading && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <MdInfo className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">No quizzes available?</p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• Quizzes are only available during their active time period</li>
                  <li>• Check back later for new quizzes from your faculty</li>
                  <li>• Make sure you're logged in with the correct batch</li>
                  <li>• Contact your faculty if you believe this is an error</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizList;