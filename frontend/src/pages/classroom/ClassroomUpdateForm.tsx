import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createClassroomUpdate, getClassroomUpdateById, updateClassroomUpdate } from '../../services/classroom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdTitle, 
  MdDescription, 
  MdClass, 
  MdAttachFile, 
  MdSave, 
  MdCancel,
  MdEdit,
  MdAdd,
  MdInfo,
  MdWarning,
  MdCheckCircle,
  MdCloudUpload
} from 'react-icons/md';
import { FaGraduationCap, FaFileAlt } from 'react-icons/fa';

const ClassroomUpdateForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [batch, setBatch] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (isEditing) {
      const fetchUpdate = async () => {
        try {
          const data = await getClassroomUpdateById(id!);
          setTitle(data.title);
          setContent(data.content);
          setBatch(data.batch);
        } catch (error) {
          toast.error('Failed to load update');
          navigate('/classroom');
        }
      };
      fetchUpdate();
    }
  }, [id, isEditing, navigate]);

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }
    if (!batch.trim()) {
      toast.error('Batch is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('batch', batch.trim());
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i]);
      }
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateClassroomUpdate(id!, { title: title.trim(), content: content.trim(), batch: batch.trim() });
        toast.success('Update saved successfully');
      } else {
        await createClassroomUpdate(formData);
        toast.success('Update created successfully');
      }
      navigate('/classroom');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || (isEditing ? 'Update failed' : 'Creation failed'));
    } finally {
      setLoading(false);
    }
  };

  const getFileNames = () => {
    if (!files) return '';
    return Array.from(files).map(f => f.name).join(', ');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-3 bg-gradient-to-r ${
              isEditing ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-indigo-500'
            } rounded-xl shadow-lg`}>
              {isEditing ? <MdEdit className="w-6 h-6 text-white" /> : <MdAdd className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isEditing ? 'Edit Classroom Update' : 'New Classroom Update'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? 'Update your classroom announcement' 
                  : 'Share important information with your students'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.title ? 'transform scale-[1.02]' : ''}`}>
                <MdTitle className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.title ? 'text-blue-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => handleFocus('title')}
                  onBlur={() => handleBlur('title')}
                  required
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter a clear and descriptive title"
                />
              </div>
              <p className="text-xs text-gray-500">
                Choose a title that clearly communicates the purpose of this update
              </p>
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Content <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.content ? 'transform scale-[1.02]' : ''}`}>
                <MdDescription className={`absolute left-3 top-4 w-5 h-5 transition-colors duration-200 ${focusedFields.content ? 'text-blue-500' : 'text-gray-400'}`} />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => handleFocus('content')}
                  onBlur={() => handleBlur('content')}
                  required
                  rows={6}
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Write your announcement or update here..."
                />
              </div>
              <p className="text-xs text-gray-500">
                Provide detailed information about the announcement or update
              </p>
            </div>

            {/* Batch Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Batch <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.batch ? 'transform scale-[1.02]' : ''}`}>
                <FaGraduationCap className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.batch ? 'text-blue-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  onFocus={() => handleFocus('batch')}
                  onBlur={() => handleBlur('batch')}
                  required
                  placeholder="e.g., 2024"
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <p className="text-xs text-gray-500">
                Specify which batch this update is intended for
              </p>
            </div>

            {/* Attachments Section (only for new updates) */}
            {!isEditing && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attachments (optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600"
                  />
                  <MdCloudUpload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {files && files.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MdCheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        {files.length} file(s) selected: {getFileNames()}
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Upload PDF, images, documents, or any relevant files (max 10MB per file)
                </p>
              </div>
            )}

            {/* Preview Section (optional) */}
            {title && content && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MdInfo className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{content}</p>
                  <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                    <FaGraduationCap className="w-3 h-3" />
                    <span>Batch {batch || 'Not set'}</span>
                  </div>
                  {files && files.length > 0 && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                      <MdAttachFile className="w-3 h-3" />
                      <span>{files.length} attachment(s)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <MdSave className="w-5 h-5" />
                  <span>{isEditing ? 'Update' : 'Publish'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/classroom')}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
            >
              <MdCancel className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <MdWarning className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Tips for effective classroom updates:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Keep titles clear and concise</li>
                <li>• Include all relevant details in the content</li>
                <li>• Select the correct batch to target the right students</li>
                <li>• Attach supporting materials like notes, assignments, or reference links</li>
                <li>• Updates will be visible immediately after publishing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Editing Notice */}
        {isEditing && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start space-x-3">
              <MdInfo className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Editing Mode</p>
                <p className="text-xs text-yellow-700">
                  You are editing an existing classroom update. Changes will be applied immediately.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassroomUpdateForm;