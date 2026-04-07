import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPlacementDrives, deletePlacementDrive } from '../../services/placement';
import { PlacementDrive } from '../../types/placement';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdVisibility, 
  MdEdit, 
  MdDelete, 
  MdBusiness,
  MdWork,
  MdDateRange,
  MdPerson,
  MdLocationOn,
  MdAttachMoney,
  MdSchedule,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdSearch,
  MdFilterList,
  MdTimeline,
  MdTrendingUp
} from 'react-icons/md';
import { FaBuilding, FaBriefcase, FaCalendarAlt, FaUserTie } from 'react-icons/fa';

const PlacementDrives: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [filteredDrives, setFilteredDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const fetchDrives = async () => {
    try {
      const data = await getPlacementDrives();
      setDrives(data);
      setFilteredDrives(data);
    } catch (error) {
      toast.error('Failed to load placement drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  useEffect(() => {
    let filtered = drives;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(drive => 
        drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drive.jobProfile.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    const today = new Date();
    if (filterStatus === 'upcoming') {
      filtered = filtered.filter(drive => new Date(drive.lastDateToApply) >= today);
    } else if (filterStatus === 'past') {
      filtered = filtered.filter(drive => new Date(drive.lastDateToApply) < today);
    }
    
    setFilteredDrives(filtered);
  }, [searchTerm, filterStatus, drives]);

  const handleDelete = async (id: string) => {
    try {
      await deletePlacementDrive(id);
      toast.success('Placement drive deleted successfully');
      fetchDrives();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Delete failed. Please try again.');
    }
  };

  const canCreate = user && ['ADMIN', 'HOD'].includes(user.role);
  const canEditDelete = user && ['ADMIN', 'HOD'].includes(user.role);

  const getDriveStatus = (drive: PlacementDrive) => {
    const now = new Date();
    const lastDate = new Date(drive.lastDateToApply);
    const driveDate = new Date(drive.driveDate);
    
    if (lastDate < now) {
      return { text: 'Expired', color: 'text-red-600', bg: 'bg-red-100', icon: <MdCancel className="w-4 h-4" /> };
    } else if (driveDate < now) {
      return { text: 'Completed', color: 'text-gray-600', bg: 'bg-gray-100', icon: <MdCheckCircle className="w-4 h-4" /> };
    } else {
      return { text: 'Active', color: 'text-green-600', bg: 'bg-green-100', icon: <MdPending className="w-4 h-4" /> };
    }
  };

  const getDaysRemaining = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  // Statistics
  const stats = {
    total: drives.length,
    active: drives.filter(d => new Date(d.lastDateToApply) >= new Date()).length,
    expired: drives.filter(d => new Date(d.lastDateToApply) < new Date()).length,
    upcomingDrives: drives.filter(d => new Date(d.driveDate) >= new Date()).length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading placement drives...</p>
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
                Placement Drives
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track campus placement opportunities
              </p>
            </div>
            {canCreate && (
              <Link
                to="/placements/new"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>New Drive</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Drives</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <MdBusiness className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Drives</p>
                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
              </div>
              <MdPending className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming Drives</p>
                <p className="text-2xl font-bold text-gray-800">{stats.upcomingDrives}</p>
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
                  placeholder="Search by company or job profile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <MdFilterList className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Drives</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
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

        {/* Drives Display */}
        {filteredDrives.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdBusiness className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No placement drives found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No placement drives have been added yet'}
            </p>
            {canCreate && (
              <Link
                to="/placements/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create First Drive</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive) => {
              const status = getDriveStatus(drive);
              const lastDateRemaining = getDaysRemaining(drive.lastDateToApply);
              const driveDateRemaining = getDaysRemaining(drive.driveDate);
              
              return (
                <div
                  key={drive._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaBuilding className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 line-clamp-1">
                          {drive.companyName}
                        </h3>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                        {status.text}
                      </span>
                    </div>

                    {/* Job Profile */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaBriefcase className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{drive.jobProfile}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MdDateRange className="w-4 h-4" />
                        <span>Apply by: {new Date(drive.lastDateToApply).toLocaleDateString()}</span>
                        {status.text === 'Active' && (
                          <span className="text-xs text-green-600">({lastDateRemaining})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MdSchedule className="w-4 h-4" />
                        <span>Drive: {new Date(drive.driveDate).toLocaleDateString()}</span>
                        {driveDateRemaining !== 'Expired' && driveDateRemaining !== 'Today' && (
                          <span className="text-xs text-blue-600">({driveDateRemaining})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MdPerson className="w-4 h-4" />
                        <span>Posted by: {drive.postedBy.id?.name || drive.postedBy.role}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-3 border-t">
                      <Link
                        to={`/placements/${drive._id}`}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <MdVisibility className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                      {canEditDelete && (
                        <div className="flex space-x-2">
                          <Link
                            to={`/placements/${drive._id}/edit`}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </Link>
                          {deleteConfirm === drive._id ? (
                            <div className="flex space-x-1 items-center">
                              <button
                                onClick={() => handleDelete(drive._id)}
                                className="text-red-600 text-sm font-medium px-2 py-1"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-600 text-sm font-medium px-2 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(drive._id)}
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
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Job Profile
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Drive Date
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
                  {filteredDrives.map((drive) => {
                    const status = getDriveStatus(drive);
                    return (
                      <tr key={drive._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <FaBuilding className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{drive.companyName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <FaBriefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{drive.jobProfile}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(drive.lastDateToApply).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(drive.driveDate).toLocaleDateString()}
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
                              to={`/placements/${drive._id}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                              title="View"
                            >
                              <MdVisibility className="w-5 h-5" />
                            </Link>
                            {canEditDelete && (
                              <>
                                <Link
                                  to={`/placements/${drive._id}/edit`}
                                  className="text-green-600 hover:text-green-800 transition-colors p-1"
                                  title="Edit"
                                >
                                  <MdEdit className="w-5 h-5" />
                                </Link>
                                {deleteConfirm === drive._id ? (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleDelete(drive._id)}
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
                                    onClick={() => setDeleteConfirm(drive._id)}
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

export default PlacementDrives;