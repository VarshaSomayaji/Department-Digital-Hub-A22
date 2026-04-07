import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProjectById, deleteProject } from "../../services/project";
import { Project } from "../../types/project";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  MdEdit, 
  MdDelete, 
  MdArrowBack, 
  MdCategory, 
  MdDateRange, 
  MdPerson, 
  MdCode,
  MdTag,
  MdDescription,
  MdAutoAwesome,
  MdFolderZip,
  MdDownload,
  MdInfo,
  MdTrendingUp,
  MdStar,
  MdStarOutline
} from "react-icons/md";
import { 
  FaProjectDiagram, 
  FaGraduationCap,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileArchive
} from "react-icons/fa";

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(id!);
        setProject(data);
      } catch (error) {
        toast.error("Project not found");
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await deleteProject(id!);
      toast.success("Project deleted successfully");
      navigate('/projects');
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="w-5 h-5 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return <FaFileImage className="w-5 h-5 text-green-500" />;
    if (extension === 'zip') return <FaFileArchive className="w-5 h-5 text-yellow-500" />;
    return <FaFileAlt className="w-5 h-5 text-blue-500" />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  const canEditDelete = user && (
    user.role === 'ADMIN' || 
    (user.role === project.uploadedBy.role && user._id === project.uploadedBy.id._id)
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          <span>Back to Projects</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FaProjectDiagram className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {project.title}
                  </h1>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <MdDateRange className="w-4 h-4 text-white/80" />
                  <p className="text-white/80 text-sm">{project.year}</p>
                </div>
              </div>
              {canEditDelete && (
                <div className="flex space-x-2">
                  <Link
                    to={`/projects/${id}/edit`}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-200"
                  >
                    <MdEdit className="w-5 h-5" />
                    <span>Edit</span>
                  </Link>
                  {deleteConfirm ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-200"
                    >
                      <MdDelete className="w-5 h-5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MdCategory className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-500">Domain:</span>
                  <span className="text-gray-800">{project.domain || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdPerson className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-500">Uploaded by:</span>
                  <span className="text-gray-800">{project.uploadedBy.id?.name || project.uploadedBy.role}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdDateRange className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-500">Uploaded on:</span>
                  <span className="text-gray-800">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MdCode className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-gray-500">Tech Stack:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack?.length ? (
                      project.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">None specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MdTag className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-medium text-gray-500">Keywords:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.keywords?.length ? (
                      project.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <MdDescription className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Description</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>

            {/* AI Summary */}
            {project.summary && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <MdAutoAwesome className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-semibold text-gray-800">AI Summary</h2>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-gray-700 leading-relaxed">{project.summary}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <MdTag className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Files */}
            {project.fileUrls && project.fileUrls.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <MdFolderZip className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Project Files</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {project.fileUrls.map((url, idx) => {
                    const fileName = url.split('/').pop();
                    return (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(url)}
                          <span className="text-blue-600 group-hover:text-blue-800">
                            {fileName || `File ${idx + 1}`}
                          </span>
                        </div>
                        <MdDownload className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats Row (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center space-x-2 text-gray-600">
                <MdTrendingUp className="w-5 h-5 text-blue-500" />
                <span>Views: {(project as any).views || 0}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <FaGraduationCap className="w-5 h-5 text-green-500" />
                <span>Batch: {project.year}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MdStar className="w-5 h-5 text-yellow-500" />
                <span>Rating: {(project as any).rating || 'Not rated'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <MdInfo className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">About this project:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• This project was uploaded by {project.uploadedBy.id?.name || project.uploadedBy.role}</li>
                <li>• All project files are available for download</li>
                <li>• The AI summary provides an overview of the project</li>
                <li>• Contact the uploader for more information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;