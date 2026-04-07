import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getNotes, deleteNote } from '../../services/note';
import { Note } from '../../types/note';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdDownload,
  MdDescription,
  MdSubject,
  MdClass,
  MdPerson,
  MdDateRange,
  MdSearch,
  MdFilterList,
  MdCloudDownload,
  MdVisibility,
  MdFilePresent,
  MdPictureAsPdf,
  MdImage
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileWord
} from 'react-icons/fa';

const NotesList: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ batch: '', subject: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchNotes = async () => {
    try {
      const data = await getNotes(filters);
      setNotes(data);
      setFilteredNotes(data);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filters]);

  useEffect(() => {
    let filtered = notes;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredNotes(filtered);
  }, [searchTerm, notes]);

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      toast.success('Note deleted successfully');
      fetchNotes();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Delete failed. Please try again.');
    }
  };

  const canUpload = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);
  const canEditDelete = user && ['FACULTY', 'HOD', 'ADMIN'].includes(user.role);

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="w-8 h-8 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return <FaFileImage className="w-8 h-8 text-green-500" />;
    if (extension === 'doc' || extension === 'docx') return <FaFileWord className="w-8 h-8 text-blue-500" />;
    return <FaFileAlt className="w-8 h-8 text-gray-500" />;
  };

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'PDF';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'Image';
    if (extension === 'doc' || extension === 'docx') return 'Word';
    return 'File';
  };

  // Statistics
  const getUniqueBatches = () => {
    const batches: string[] = [];
    notes.forEach(note => {
      if (!batches.includes(note.batch)) {
        batches.push(note.batch);
      }
    });
    return batches.length;
  };

  const getUniqueSubjects = () => {
    const subjects: string[] = [];
    notes.forEach(note => {
      if (!subjects.includes(note.subject)) {
        subjects.push(note.subject);
      }
    });
    return subjects.length;
  };

  const stats = {
    total: notes.length,
    batches: getUniqueBatches(),
    subjects: getUniqueSubjects(),
    thisMonth: notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      const now = new Date();
      return noteDate.getMonth() === now.getMonth() && 
             noteDate.getFullYear() === now.getFullYear();
    }).length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notes...</p>
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
                Notes & Resources
              </h1>
              <p className="text-gray-600 mt-1">
                Access study materials and lecture notes
              </p>
            </div>
            {canUpload && (
              <Link
                to="/notes/upload"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>Upload Note</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {notes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Notes</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <MdDescription className="w-8 h-8 text-blue-500 opacity-50" />
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
                  <p className="text-gray-600 text-sm">Subjects</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.subjects}</p>
                </div>
                <MdSubject className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">This Month</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.thisMonth}</p>
                </div>
                <MdDateRange className="w-8 h-8 text-yellow-500 opacity-50" />
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
                  placeholder="Search by title, subject, or description..."
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

        {/* Notes Display */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MdDescription className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filters.batch || filters.subject
                ? 'Try adjusting your filters'
                : 'No notes have been uploaded yet'}
            </p>
            {canUpload && (
              <Link
                to="/notes/upload"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Upload First Note</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-5">
                  {/* File Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-100 rounded-2xl">
                      {getFileIcon(note.fileUrl)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                    {note.title}
                  </h3>

                  {/* Subject & Batch */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MdSubject className="w-4 h-4" />
                      <span>{note.subject}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FaGraduationCap className="w-4 h-4" />
                      <span>Batch {note.batch}</span>
                    </div>
                  </div>

                  {/* Description Preview */}
                  {note.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {note.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="space-y-1 text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <MdPerson className="w-3 h-3" />
                      <span>By {note.uploadedBy.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MdDateRange className="w-3 h-3" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MdFilePresent className="w-3 h-3" />
                      <span>{getFileType(note.fileUrl)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <MdCloudDownload className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                    {canEditDelete && (
                      <div className="flex space-x-1">
                        <Link
                          to={`/notes/${note._id}/edit`}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <MdEdit className="w-5 h-5" />
                        </Link>
                        {deleteConfirm === note._id ? (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleDelete(note._id)}
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
                            onClick={() => setDeleteConfirm(note._id)}
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
            ))}
          </div>
        ) : (
          /* List View */
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
                      Uploaded By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotes.map((note) => (
                    <tr key={note._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <MdDescription className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-900">{note.title}</span>
                        </div>
                        {note.description && (
                          <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                            {note.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MdSubject className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{note.subject}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FaGraduationCap className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">Batch {note.batch}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MdPerson className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{note.uploadedBy.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {getFileIcon(note.fileUrl)}
                          <span>{getFileType(note.fileUrl)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="Download"
                          >
                            <MdDownload className="w-5 h-5" />
                          </a>
                          {canEditDelete && (
                            <>
                              <Link
                                to={`/notes/${note._id}/edit`}
                                className="text-green-600 hover:text-green-800 transition-colors p-1"
                                title="Edit"
                              >
                                <MdEdit className="w-5 h-5" />
                              </Link>
                              {deleteConfirm === note._id ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleDelete(note._id)}
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
                                  onClick={() => setDeleteConfirm(note._id)}
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

export default NotesList;