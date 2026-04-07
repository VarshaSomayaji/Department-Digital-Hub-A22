import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAnnouncements, deleteAnnouncement } from '../../services/announcement';
import { Announcement } from '../../types/announcement';
import { Role } from '../../types';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdVisibility, 
  MdEdit, 
  MdDelete, 
  MdAnnouncement,
  MdPeople,
  MdPerson,
  MdWork,
  MdDateRange,
  MdSearch,
  MdFilterList
} from 'react-icons/md';
import { FaChalkboardTeacher, FaUserTie, FaGraduationCap } from 'react-icons/fa';

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTarget, setFilterTarget] = useState<Role | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
      setFilteredAnnouncements(data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    let filtered = announcements;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ann => 
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply target audience filter
    if (filterTarget !== 'all') {
      filtered = filtered.filter(ann => 
        ann.targetAudience.includes(filterTarget as Role)
      );
    }
    
    setFilteredAnnouncements(filtered);
  }, [searchTerm, filterTarget, announcements]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Delete failed. Please try again.');
    }
  };

  const canCreate = user && ['ADMIN', 'HOD', 'FACULTY'].includes(user.role);
  const canEditDelete = user && ['ADMIN', 'HOD', 'FACULTY'].includes(user.role);

  const getTargetAudienceIcon = (audience: Role) => {
    switch (audience) {
      case 'STUDENT':
        return <FaGraduationCap className="w-4 h-4" />;
      case 'FACULTY':
        return <FaChalkboardTeacher className="w-4 h-4" />;
      case 'HOD':
        return <FaUserTie className="w-4 h-4" />;
      case 'ADMIN':
        return <MdWork className="w-4 h-4" />;
      default:
        return <MdPeople className="w-4 h-4" />;
    }
  };

  const getAudienceColor = (audience: Role) => {
    switch (audience) {
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      case 'FACULTY':
        return 'bg-blue-100 text-blue-800';
      case 'HOD':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'STUDENT':
        return <FaGraduationCap className="w-4 h-4" />;
      case 'FACULTY':
        return <FaChalkboardTeacher className="w-4 h-4" />;
      case 'HOD':
        return <FaUserTie className="w-4 h-4" />;
      case 'ADMIN':
        return <MdWork className="w-4 h-4" />;
      default:
        return <MdPerson className="w-4 h-4" />;
    }
  };

  // Statistics
  const stats = {
    total: announcements.length,
    thisMonth: announcements.filter(ann => {
      const annDate = new Date(ann.createdAt);
      const now = new Date();
      return annDate.getMonth() === now.getMonth() && 
             annDate.getFullYear() === now.getFullYear();
    }).length,
    students: announcements.filter(ann => ann.targetAudience.includes('STUDENT')).length,
    faculty: announcements.filter(ann => ann.targetAudience.includes('FACULTY')).length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading announcements...</p>
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
                Announcements
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with latest news and notifications
              </p>
            </div>
            {canCreate && (
              <Link
                to="/announcements/new"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>New Announcement</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Announcements</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <MdAnnouncement className="w-8 h-8 text-blue-500 opacity-50" />
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
                <p className="text-gray-600 text-sm">For Students</p>
                <p className="text-2xl font-bold text-gray-800">{stats.students}</p>
              </div>
              <FaGraduationCap className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">For Faculty</p>
                <p className="text-2xl font-bold text-gray-800">{stats.faculty}</p>
              </div>
              <FaChalkboardTeacher className="w-8 h-8 text-orange-500 opacity-50" />
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
                  placeholder="Search announcements by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Target Audience Filter */}
              <div className="flex items-center space-x-2">
                <MdFilterList className="w-5 h-5 text-gray-400" />
                <select
                  value={filterTarget}
                  onChange={(e) => setFilterTarget(e.target.value as Role | 'all')}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Audiences</option>
                  <option value="STUDENT">Students</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="HOD">HODs</option>
                  <option value="ADMIN">Admins</option>
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

        {/* Announcements Display */}
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdAnnouncement className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterTarget !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No announcements have been posted yet'}
            </p>
            {canCreate && (
              <Link
                to="/announcements/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create First Announcement</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((ann) => (
              <div
                key={ann._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MdAnnouncement className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 line-clamp-2">
                        {ann.title}
                      </h3>
                    </div>
                    {canEditDelete && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-2">
                          <Link
                            to={`/announcements/${ann._id}`}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="View"
                          >
                            <MdVisibility className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/announcements/${ann._id}/edit`}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </Link>
                          {deleteConfirm === ann._id ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleDelete(ann._id)}
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
                              onClick={() => setDeleteConfirm(ann._id)}
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

                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {ann.content || 'No content provided'}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MdPerson className="w-4 h-4" />
                      <span>
                        By {ann.postedBy.id?.name || ann.postedBy.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MdDateRange className="w-4 h-4" />
                      <span>
                        {new Date(ann.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ann.targetAudience.map((audience, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getAudienceColor(audience)}`}
                        >
                          {getTargetAudienceIcon(audience)}
                          <span>{audience}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t">
                  <Link
                    to={`/announcements/${ann._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>Read More</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
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
                      Posted By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Target Audience
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnnouncements.map((ann) => (
                    <tr key={ann._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{ann.title}</div>
                        {ann.content && (
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {ann.content}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(ann.postedBy.role)}
                          <span className="text-sm text-gray-900">
                            {ann.postedBy.id?.name || ann.postedBy.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {ann.targetAudience.map((audience, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getAudienceColor(audience)}`}
                            >
                              {getTargetAudienceIcon(audience)}
                              <span>{audience}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/announcements/${ann._id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="View"
                          >
                            <MdVisibility className="w-5 h-5" />
                          </Link>
                          {canEditDelete && (
                            <>
                              <Link
                                to={`/announcements/${ann._id}/edit`}
                                className="text-green-600 hover:text-green-800 transition-colors p-1"
                                title="Edit"
                              >
                                <MdEdit className="w-5 h-5" />
                              </Link>
                              {deleteConfirm === ann._id ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleDelete(ann._id)}
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
                                  onClick={() => setDeleteConfirm(ann._id)}
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

export default Announcements;