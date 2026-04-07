import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getClassroomUpdates, deleteClassroomUpdate } from '../../services/classroom';
import { ClassroomUpdate } from '../../types/classroom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdClass,
  MdDateRange,
  MdPerson,
  MdAttachFile,
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdDescription,
  MdDownload,
  MdSchedule,
  MdCheckCircle
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaUserTie,
  FaFileAlt,
  FaFilePdf,
  FaFileImage
} from 'react-icons/fa';

const ClassroomUpdatesList: React.FC = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<ClassroomUpdate[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<ClassroomUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBatch, setFilterBatch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const fetchUpdates = async () => {
    try {
      const data = await getClassroomUpdates(filterBatch ? { batch: filterBatch } : {});
      setUpdates(data);
      setFilteredUpdates(data);
    } catch (error) {
      toast.error('Failed to load updates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [filterBatch]);

  useEffect(() => {
    let filtered = updates;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(update => 
        update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.postedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUpdates(filtered);
  }, [searchTerm, updates]);

  const handleDelete = async (id: string) => {
    try {
      await deleteClassroomUpdate(id);
      toast.success('Update deleted successfully');
      fetchUpdates();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Delete failed. Please try again.');
    }
  };

  const canPost = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);
  const canEditDelete = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="w-4 h-4 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return <FaFileImage className="w-4 h-4 text-green-500" />;
    return <FaFileAlt className="w-4 h-4 text-blue-500" />;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <FaGraduationCap className="w-4 h-4" />;
      case 'FACULTY':
        return <FaChalkboardTeacher className="w-4 h-4" />;
      case 'HOD':
        return <FaUserTie className="w-4 h-4" />;
      default:
        return <MdPerson className="w-4 h-4" />;
    }
  };

  // Statistics - Fixed to avoid Set iteration issue
  const getUniqueBatches = () => {
    const batches: string[] = [];
    updates.forEach(update => {
      if (!batches.includes(update.batch)) {
        batches.push(update.batch);
      }
    });
    return batches.length;
  };

  const stats = {
    total: updates.length,
    thisMonth: updates.filter(update => {
      const updateDate = new Date(update.createdAt);
      const now = new Date();
      return updateDate.getMonth() === now.getMonth() && 
             updateDate.getFullYear() === now.getFullYear();
    }).length,
    batches: getUniqueBatches(),
    withAttachments: updates.filter(u => u.attachments && u.attachments.length > 0).length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading classroom updates...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Classroom Updates
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with classroom announcements and resources
              </p>
            </div>
            {canPost && (
              <Link
                to="/classroom/new"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>New Update</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Updates</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <MdClass className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">This Month</p>
                <p className="text-2xl font-bold text-gray-800">{stats.thisMonth}</p>
              </div>
              <MdSchedule className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Batches</p>
                <p className="text-2xl font-bold text-gray-800">{stats.batches}</p>
              </div>
              <FaGraduationCap className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">With Attachments</p>
                <p className="text-2xl font-bold text-gray-800">{stats.withAttachments}</p>
              </div>
              <MdAttachFile className="w-8 h-8 text-yellow-500 opacity-50" />
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
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Search Input */}
              <div className="flex-1 relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title, content, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
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
              </div>
            </div>
          </div>
        </div>

        {/* Updates Display */}
        {filteredUpdates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdClass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No updates found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterBatch 
                ? 'Try adjusting your filters' 
                : 'No classroom updates have been posted yet'}
            </p>
            {canPost && (
              <Link
                to="/classroom/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Post First Update</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-4">
            {filteredUpdates.map((update) => (
              <div
                key={update._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MdDescription className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{update.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <FaGraduationCap className="w-3 h-3" />
                            <span>Batch {update.batch}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(update.postedBy.role)}
                            <span>
                              Posted by {update.postedBy.name} ({update.postedBy.role})
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MdDateRange className="w-3 h-3" />
                            <span>{new Date(update.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {canEditDelete && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-2">
                          <Link
                            to={`/classroom/${update._id}/edit`}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </Link>
                          {deleteConfirm === update._id ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleDelete(update._id)}
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
                              onClick={() => setDeleteConfirm(update._id)}
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

                  {/* Content */}
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{update.content}</p>

                  {/* Attachments */}
                  {update.attachments && update.attachments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                        <MdAttachFile className="w-4 h-4" />
                        <span>Attachments ({update.attachments.length})</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {update.attachments.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                          >
                            {getFileIcon(url)}
                            <span className="text-blue-600 hover:underline">
                              {url.split('/').pop()?.slice(0, 30) || 'Attachment'}
                            </span>
                            <MdDownload className="w-3 h-3 text-gray-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpdates.map((update) => (
              <div
                key={update._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
              >
                <div className="p-5 flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MdClass className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        Batch {update.batch}
                      </span>
                    </div>
                    {canEditDelete && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <Link
                            to={`/classroom/${update._id}/edit`}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <MdEdit className="w-4 h-4" />
                          </Link>
                          {deleteConfirm === update._id ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleDelete(update._id)}
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
                              onClick={() => setDeleteConfirm(update._id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <MdDelete className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                    {update.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {update.content}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(update.postedBy.role)}
                      <span>{update.postedBy.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MdDateRange className="w-3 h-3" />
                      <span>{new Date(update.createdAt).toLocaleDateString()}</span>
                    </div>
                    {update.attachments && update.attachments.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <MdAttachFile className="w-3 h-3" />
                        <span>{update.attachments.length} attachment(s)</span>
                      </div>
                    )}
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

export default ClassroomUpdatesList;