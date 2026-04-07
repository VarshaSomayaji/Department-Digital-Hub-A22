import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyLeaveRequests, deleteLeaveRequest } from '../../services/leave';
import { LeaveRequest } from '../../types/leave';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdDelete, 
  MdVisibility, 
  MdDateRange, 
  MdDescription,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdRefresh,
  MdInfo,
  MdCalendarToday,
  MdSchedule
} from 'react-icons/md';
import { 
  FaCalendarAlt, 
  FaClock,
  FaHourglassHalf
} from 'react-icons/fa';

const MyLeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const fetchRequests = async () => {
    try {
      const data = await getMyLeaveRequests();
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }
    
    setFilteredRequests(filtered);
  }, [filterStatus, requests]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLeaveRequest(id);
      toast.success('Leave request cancelled successfully');
      fetchRequests();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const canCreate = user && ['STUDENT', 'FACULTY', 'HOD'].includes(user.role);

  const statusColors = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <MdPending className="w-4 h-4" />, label: 'Pending' },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: <MdCheckCircle className="w-4 h-4" />, label: 'Approved' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: <MdCancel className="w-4 h-4" />, label: 'Rejected' },
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leave requests...</p>
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
                My Leave Requests
              </h1>
              <p className="text-gray-600 mt-1">
                Track and manage your leave applications
              </p>
            </div>
            {canCreate && (
              <Link
                to="/leave/apply"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>Apply for Leave</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {requests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <MdCalendarToday className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                </div>
                <MdPending className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
                </div>
                <MdCheckCircle className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
                </div>
                <MdCancel className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        {requests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <MdInfo className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Requests</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
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
                    Card View
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'table'
                        ? 'bg-white shadow-md text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Table View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Requests Display */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdCalendarToday className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
            <p className="text-gray-500 mb-4">
              {filterStatus !== 'all' 
                ? 'No requests match the selected filter'
                : 'You haven\'t submitted any leave requests yet'}
            </p>
            {canCreate && (
              <Link
                to="/leave/apply"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Apply for Leave</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => {
              const status = statusColors[req.status];
              const duration = calculateDuration(req.startDate, req.endDate);
              return (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-3">
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {deleteConfirm === req._id ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleDelete(req._id)}
                                className="text-red-600 text-xs font-medium"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-600 text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(req._id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Cancel Request"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaHourglassHalf className="w-4 h-4 text-gray-400" />
                        <span>Duration: {duration}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-1 mb-1">
                        <MdDescription className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">Reason</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{req.reason}</p>
                    </div>

                    {/* Applied Date */}
                    <div className="pt-3 border-t text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MdSchedule className="w-3 h-3" />
                        <span>Applied on: {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
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
                      <div className="flex items-center space-x-1">
                        <FaCalendarAlt className="w-4 h-4" />
                        <span>Start Date</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <FaCalendarAlt className="w-4 h-4" />
                        <span>End Date</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <MdDescription className="w-4 h-4" />
                        <span>Reason</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <MdSchedule className="w-4 h-4" />
                        <span>Duration</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <MdInfo className="w-4 h-4" />
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((req) => {
                    const status = statusColors[req.status];
                    const duration = calculateDuration(req.startDate, req.endDate);
                    return (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(req.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(req.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs truncate">
                            {req.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.icon}
                            <span>{status.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {req.status === 'PENDING' && (
                            deleteConfirm === req._id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleDelete(req._id)}
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
                                onClick={() => setDeleteConfirm(req._id)}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
                              >
                                <MdDelete className="w-5 h-5" />
                                <span className="text-sm">Cancel</span>
                              </button>
                            )
                          )}
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

export default MyLeaveRequests;