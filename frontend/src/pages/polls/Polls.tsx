import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getPolls, deletePoll } from "../../services/poll";
import { Poll } from "../../types/poll";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  MdAdd, 
  MdPoll, 
  MdHowToVote, 
  MdBarChart, 
  MdEdit, 
  MdDelete,
  MdVisibility,
  MdSchedule,
  MdPerson,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdTrendingUp,
  MdDateRange,
  MdTimeline
} from "react-icons/md";
import { 
  FaVoteYea, 
  FaChartLine,
  FaUserCircle 
} from "react-icons/fa";
import { GiCheckMark } from "react-icons/gi";

const Polls: React.FC = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'voted'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchPolls = async (page = pagination.page) => {
    try {
      setLoading(true);
      const data = await getPolls(page, pagination.limit);
      setPolls(data.polls);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load polls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deletePoll(id);
      toast.success("Poll deleted successfully");
      fetchPolls(pagination.page);
      setDeleteConfirm(null);
    } catch (error) {
      toast.error("Delete failed. Please try again.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchPolls(newPage);
    }
  };

  const canCreate = user && ["ADMIN", "HOD", "FACULTY"].includes(user.role);
  const canEditDelete = user && ["ADMIN", "HOD", "FACULTY"].includes(user.role);

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const hasUserVoted = (poll: Poll) => {
    if (!user) return false;
    return poll.responses.some((r) => r.user.id === user._id);
  };

  const getPollStatus = (poll: Poll) => {
    const expired = isExpired(poll.expiresAt);
    const voted = hasUserVoted(poll);
    
    if (expired) return { text: 'Expired', color: 'text-red-600', bg: 'bg-red-100', icon: <MdCancel className="w-4 h-4" /> };
    if (voted) return { text: 'Voted', color: 'text-green-600', bg: 'bg-green-100', icon: <MdCheckCircle className="w-4 h-4" /> };
    return { text: 'Active', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <MdPending className="w-4 h-4" /> };
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Less than an hour left';
  };

  const filteredPolls = polls.filter(poll => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return !isExpired(poll.expiresAt) && !hasUserVoted(poll);
    if (filterStatus === 'expired') return isExpired(poll.expiresAt);
    if (filterStatus === 'voted') return hasUserVoted(poll);
    return true;
  });

  // Generate page numbers for pagination
  const getPageNumbers = (): (number | string)[] => {
    const { page, pages } = pagination;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  // Statistics
  const stats = {
    total: polls.length,
    active: polls.filter(p => !isExpired(p.expiresAt) && !hasUserVoted(p)).length,
    expired: polls.filter(p => isExpired(p.expiresAt)).length,
    voted: polls.filter(p => hasUserVoted(p)).length,
    totalVotes: polls.reduce((sum, poll) => sum + poll.responses.length, 0),
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading polls...</p>
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
                Polls & Surveys
              </h1>
              <p className="text-gray-600 mt-1">
                Create and manage polls to gather feedback
              </p>
            </div>
            {canCreate && (
              <Link
                to="/polls/new"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create Poll</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Polls</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <MdPoll className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Polls</p>
                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
              </div>
              <MdPending className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Expired</p>
                <p className="text-2xl font-bold text-gray-800">{stats.expired}</p>
              </div>
              <MdSchedule className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Voted</p>
                <p className="text-2xl font-bold text-gray-800">{stats.voted}</p>
              </div>
              <MdCheckCircle className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Votes</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalVotes}</p>
              </div>
              <FaVoteYea className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <MdTimeline className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Polls</option>
                  <option value="active">Active</option>
                  <option value="voted">Voted</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1 ml-auto">
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

        {/* Polls Display */}
        {filteredPolls.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdPoll className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No polls found</h3>
            <p className="text-gray-500 mb-4">
              {filterStatus !== 'all' 
                ? 'No polls match the selected filter' 
                : 'No polls have been created yet'}
            </p>
            {canCreate && (
              <Link
                to="/polls/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create First Poll</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => {
              const status = getPollStatus(poll);
              const expired = isExpired(poll.expiresAt);
              const voted = hasUserVoted(poll);
              
              return (
                <div
                  key={poll._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${status.bg}`}>
                          {status.icon}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      {canEditDelete && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-2">
                            <Link
                              to={`/polls/${poll._id}/edit`}
                              className="p-1 text-indigo-600 hover:text-indigo-800"
                              title="Edit"
                            >
                              <MdEdit className="w-5 h-5" />
                            </Link>
                            {deleteConfirm === poll._id ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleDelete(poll._id)}
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
                                onClick={() => setDeleteConfirm(poll._id)}
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

                    {/* Question */}
                    <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2">
                      {poll.question}
                    </h3>

                    {/* Meta Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MdPerson className="w-4 h-4" />
                        <span>
                          By {typeof poll.createdBy.id === "object" && poll.createdBy.id?.name
                            ? poll.createdBy.id.name
                            : poll.createdBy.role}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MdDateRange className="w-4 h-4" />
                        <span>Expires: {new Date(poll.expiresAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FaChartLine className="w-4 h-4" />
                        <span>{poll.responses.length} votes</span>
                      </div>
                      {!expired && !voted && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <MdSchedule className="w-4 h-4" />
                          <span>{getTimeRemaining(poll.expiresAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-3 border-t">
                      {!expired && !voted && (
                        <Link
                          to={`/polls/${poll._id}`}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <MdHowToVote className="w-4 h-4" />
                          <span>Vote Now</span>
                        </Link>
                      )}
                      <Link
                        to={`/polls/${poll._id}/results`}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          !expired && !voted
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <MdBarChart className="w-4 h-4" />
                        <span>Results</span>
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
                      Question
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Votes
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
                  {filteredPolls.map((poll) => {
                    const status = getPollStatus(poll);
                    const expired = isExpired(poll.expiresAt);
                    const voted = hasUserVoted(poll);
                    
                    return (
                      <tr key={poll._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{poll.question}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <FaUserCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {typeof poll.createdBy.id === "object" && poll.createdBy.id?.name
                                ? poll.createdBy.id.name
                                : poll.createdBy.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(poll.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <FaVoteYea className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{poll.responses.length}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.icon}
                            <span>{status.text}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {!expired && !voted && (
                              <Link
                                to={`/polls/${poll._id}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                title="Vote"
                              >
                                <MdHowToVote className="w-5 h-5" />
                              </Link>
                            )}
                            <Link
                              to={`/polls/${poll._id}/results`}
                              className="text-green-600 hover:text-green-800 transition-colors p-1"
                              title="Results"
                            >
                              <MdBarChart className="w-5 h-5" />
                            </Link>
                            {canEditDelete && (
                              <>
                                <Link
                                  to={`/polls/${poll._id}/edit`}
                                  className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
                                  title="Edit"
                                >
                                  <MdEdit className="w-5 h-5" />
                                </Link>
                                {deleteConfirm === poll._id ? (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleDelete(poll._id)}
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
                                    onClick={() => setDeleteConfirm(poll._id)}
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center space-x-2">
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`dots-${index}`} className="px-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum as number)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'border-2 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Polls;