import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingLeaveRequests } from '../../services/leave';
import { LeaveRequest } from '../../types/leave';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdVisibility, 
  MdEventNote, 
  MdPerson, 
  MdDateRange,
  MdDescription,
  MdSchedule,
  MdPending,
  MdCheckCircle,
  MdCancel,
  MdRefresh
} from 'react-icons/md';
import { FaUserTie, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa';

const PendingLeaveRequests: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    let filtered = requests;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(req => 
        (req.user.id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(req => req.user.role === filterRole);
    }
    
    setFilteredRequests(filtered);
  }, [searchTerm, filterRole, requests]);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingLeaveRequests();
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <FaGraduationCap className="w-4 h-4 text-green-600" />;
      case 'FACULTY':
        return <FaChalkboardTeacher className="w-4 h-4 text-blue-600" />;
      case 'HOD':
        return <FaUserTie className="w-4 h-4 text-purple-600" />;
      default:
        return <MdPerson className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      case 'FACULTY':
        return 'bg-blue-100 text-blue-800';
      case 'HOD':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    students: requests.filter(r => r.user.role === 'STUDENT').length,
    faculty: requests.filter(r => r.user.role === 'FACULTY').length,
    hod: requests.filter(r => r.user.role === 'HOD').length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending requests...</p>
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
                Pending Leave Approvals
              </h1>
              <p className="text-gray-600 mt-1">
                Review and manage leave requests from students and staff
              </p>
            </div>
            <button
              onClick={fetchPending}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <MdRefresh className="w-5 h-5 text-gray-600" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {requests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Pending</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <MdPending className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Students</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.students}</p>
                </div>
                <FaGraduationCap className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Faculty</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.faculty}</p>
                </div>
                <FaChalkboardTeacher className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">HODs</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.hod}</p>
                </div>
                <FaUserTie className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        {requests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                {/* Role Filter */}
                <div className="w-48 relative">
                  <MdEventNote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Roles</option>
                    <option value="STUDENT">Students</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="HOD">HODs</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Display */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdCheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-500">
              {searchTerm || filterRole !== 'all' 
                ? 'No requests match your filters' 
                : 'All leave requests have been processed'}
            </p>
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MdPerson className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {req.user.id?.name || 'Unknown User'}
                        </h3>
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleBadgeClass(req.user.role)}`}>
                          {getRoleIcon(req.user.role)}
                          <span>{req.user.role}</span>
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <MdPending className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  </div>

                  {/* Leave Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MdDateRange className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MdSchedule className="w-4 h-4 text-gray-400" />
                      <span>Duration: {calculateDuration(req.startDate, req.endDate)}</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MdDescription className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="line-clamp-2">{req.reason}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t">
                    <Link
                      to={`/leave/approve/${req._id}`}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MdVisibility className="w-4 h-4" />
                      <span>Review Request</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PendingLeaveRequests;