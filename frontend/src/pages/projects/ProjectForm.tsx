import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, extractProjectMetadata } from '../../services/project';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdTitle, 
  MdDescription, 
  MdDateRange, 
  MdFolderZip,
  MdUpload,
  MdCancel,
  MdAutoAwesome,
  MdInfo,
  MdCheckCircle,
  MdWarning,
  MdCode,
  MdCategory,
  MdTag
} from 'react-icons/md';
import { 
  FaProjectDiagram, 
  FaFileArchive,
  FaRobot
} from 'react-icons/fa';

const ProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleExtractMetadata = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title first');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description first');
      return;
    }
    setExtracting(true);
    try {
      const data = await extractProjectMetadata(title, description);
      setMetadata(data);
      toast.success('Metadata extracted successfully!');
    } catch (error) {
      toast.error('AI extraction failed. Please try again.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!year) {
      toast.error('Year is required');
      return;
    }
    if (!zipFile) {
      toast.error('Please select a ZIP file');
      return;
    }

    // File size validation (max 50MB)
    if (zipFile.size > 50 * 1024 * 1024) {
      toast.error('File size should be less than 50MB');
      return;
    }

    // Validate file is ZIP
    if (!zipFile.name.toLowerCase().endsWith('.zip')) {
      toast.error('Please select a valid ZIP file');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('year', year.toString());
    formData.append('zip', zipFile);

    setLoading(true);
    try {
      await createProject(formData);
      toast.success('Project uploaded successfully!');
      navigate('/projects');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <FaProjectDiagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Upload New Project
              </h1>
              <p className="text-gray-600 mt-1">
                Share your project with the community
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Project Title <span className="text-red-500">*</span>
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
                  placeholder="Enter your project title"
                />
              </div>
              <p className="text-xs text-gray-500">
                Choose a clear and descriptive title for your project
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.description ? 'transform scale-[1.02]' : ''}`}>
                <MdDescription className={`absolute left-3 top-4 w-5 h-5 transition-colors duration-200 ${focusedFields.description ? 'text-blue-500' : 'text-gray-400'}`} />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => handleFocus('description')}
                  onBlur={() => handleBlur('description')}
                  required
                  rows={5}
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Describe your project: what it does, technologies used, challenges overcome..."
                />
              </div>
              <p className="text-xs text-gray-500">
                Provide a detailed description of your project (minimum 50 characters recommended)
              </p>
            </div>

            {/* Year Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Year <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.year ? 'transform scale-[1.02]' : ''}`}>
                <MdDateRange className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.year ? 'text-blue-500' : 'text-gray-400'}`} />
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  onFocus={() => handleFocus('year')}
                  onBlur={() => handleBlur('year')}
                  required
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Project ZIP File <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600"
                />
                <FaFileArchive className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-xs text-gray-500">
                Upload your project as a ZIP file (Max size: 50MB). Include all source code and documentation.
              </p>
            </div>

            {/* File Preview */}
            {zipFile && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    <FaFileArchive className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <MdCheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-800">{zipFile.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <span>Size: {formatFileSize(zipFile.size)}</span>
                      <span>Type: ZIP Archive</span>
                      <span>Modified: {new Date(zipFile.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZipFile(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* AI Metadata Extraction */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FaRobot className="w-5 h-5 text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-700">AI-Powered Metadata Extraction</h3>
              </div>
              <button
                type="button"
                onClick={handleExtractMetadata}
                disabled={extracting}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200"
              >
                {extracting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <MdAutoAwesome className="w-5 h-5" />
                    <span>Auto-extract Metadata</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                Our AI will analyze your project title and description to suggest domain, tech stack, and keywords
              </p>
            </div>

            {/* Extracted Metadata Display */}
            {metadata && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <MdAutoAwesome className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Extracted Metadata</h3>
                </div>
                <div className="space-y-3">
                  {metadata.domain && (
                    <div className="flex items-start space-x-2">
                      <MdCategory className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-gray-500">Domain:</span>
                        <p className="text-sm text-gray-800">{metadata.domain}</p>
                      </div>
                    </div>
                  )}
                  {metadata.techStack && metadata.techStack.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <MdCode className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-gray-500">Tech Stack:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {metadata.techStack.map((tech: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-700">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {metadata.keywords && metadata.keywords.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <MdTag className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-gray-500">Keywords:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {metadata.keywords.map((keyword: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-700">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {metadata.summary && (
                    <div className="flex items-start space-x-2">
                      <MdDescription className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-gray-500">Summary:</span>
                        <p className="text-sm text-gray-800 mt-1">{metadata.summary}</p>
                      </div>
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
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <MdUpload className="w-5 h-5" />
                  <span>Upload Project</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/projects')}
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
              <p className="text-sm font-medium text-blue-800">Tips for uploading projects:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Ensure your project ZIP file contains all source code and documentation</li>
                <li>• Maximum file size is 50MB</li>
                <li>• Use the AI feature to automatically extract project metadata</li>
                <li>• Provide a clear and detailed description to help others understand your project</li>
                <li>• Review the extracted metadata before submitting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Format Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start space-x-3">
            <MdWarning className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Project ZIP Requirements:</p>
              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                <li>• Include all source code files</li>
                <li>• Add a README.md file with project documentation</li>
                <li>• Include any necessary configuration files</li>
                <li>• Remove unnecessary files (node_modules, build folders, etc.)</li>
                <li>• Ensure the ZIP file is not corrupted</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectForm;