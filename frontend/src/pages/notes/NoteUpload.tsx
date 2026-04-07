import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNote } from '../../services/note';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdTitle, 
  MdDescription, 
  MdSubject, 
  MdClass, 
  MdAttachFile,
  MdCloudUpload,
  MdSave, 
  MdCancel,
  MdUpload,
  MdInfo,
  MdWarning,
  MdCheckCircle
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileWord
} from 'react-icons/fa';

const NoteUpload: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

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
    if (!subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    if (!batch.trim()) {
      toast.error('Batch is required');
      return;
    }
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    // File size validation (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());
    formData.append('subject', subject.trim());
    formData.append('batch', batch.trim());
    formData.append('note', file);

    setLoading(true);
    try {
      await createNote(formData);
      toast.success('Note uploaded successfully');
      navigate('/notes');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FaFileAlt className="w-12 h-12 text-gray-400" />;
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="w-12 h-12 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return <FaFileImage className="w-12 h-12 text-green-500" />;
    if (extension === 'doc' || extension === 'docx') return <FaFileWord className="w-12 h-12 text-blue-500" />;
    return <FaFileAlt className="w-12 h-12 text-gray-500" />;
  };

  const getFileType = () => {
    if (!file) return '';
    const extension = file.name.split('.').pop()?.toUpperCase();
    if (extension === 'PDF') return 'PDF Document';
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(extension || '')) return 'Image';
    if (extension === 'DOC' || extension === 'DOCX') return 'Word Document';
    return 'File';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <MdCloudUpload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Upload Note
              </h1>
              <p className="text-gray-600 mt-1">
                Share study materials and resources with students
              </p>
            </div>
          </div>
        </div>

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
                  placeholder="Enter a descriptive title"
                />
              </div>
              <p className="text-xs text-gray-500">
                Choose a clear title that describes the content
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.description ? 'transform scale-[1.02]' : ''}`}>
                <MdDescription className={`absolute left-3 top-4 w-5 h-5 transition-colors duration-200 ${focusedFields.description ? 'text-blue-500' : 'text-gray-400'}`} />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => handleFocus('description')}
                  onBlur={() => handleBlur('description')}
                  rows={3}
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Provide additional details about this note..."
                />
              </div>
            </div>

            {/* Subject and Batch Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.subject ? 'transform scale-[1.02]' : ''}`}>
                  <MdSubject className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.subject ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onFocus={() => handleFocus('subject')}
                    onBlur={() => handleBlur('subject')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>

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
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                File <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.ppt,.pptx,.xls,.xlsx"
                />
                <MdAttachFile className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, Images, PPT, Excel, Text (Max size: 10MB)
              </p>
            </div>

            {/* File Preview Section */}
            {file && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow">
                    {getFileIcon()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <MdCheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-800">{file.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <span>Type: {getFileType()}</span>
                      <span>Size: {formatFileSize(file.size)}</span>
                      <span>Modified: {new Date(file.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
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
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <MdUpload className="w-5 h-5" />
                  <span>Upload Note</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/notes')}
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
            <MdInfo className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Tips for uploading notes:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Use clear and descriptive titles for easy search</li>
                <li>• Add a brief description to help students understand the content</li>
                <li>• Maximum file size is 10MB</li>
                <li>• Supported formats: PDF, DOC, DOCX, Images, PPT, Excel, Text</li>
                <li>• Notes will be visible to students immediately after upload</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Format Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start space-x-3">
            <MdWarning className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Supported File Formats:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">PDF</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">DOC</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">DOCX</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">JPG</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">PNG</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">PPT</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">PPTX</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">XLS</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">XLSX</span>
                <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border">TXT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NoteUpload;