import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getProjects } from "../../services/project";
import { Project } from "../../types/project";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  MdAdd, 
  MdSearch, 
  MdFilterList, 
  MdCategory, 
  MdDateRange, 
  MdPerson, 
  MdCode,
  MdVisibility
} from "react-icons/md";
import { 
  FaProjectDiagram, 
  FaCodeBranch, 
  FaGithub,
  FaExternalLinkAlt
} from "react-icons/fa";

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ domain: "", year: "", search: "" });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchProjects = async () => {
    try {
      const apiFilters: any = {};
      if (filters.domain) apiFilters.domain = filters.domain;
      if (filters.year && !isNaN(Number(filters.year))) {
        apiFilters.year = Number(filters.year);
      }
      if (filters.search) apiFilters.search = filters.search;

      const data = await getProjects(apiFilters);
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const canCreate = user && ["FACULTY", "STUDENT", "ADMIN"].includes(user.role);

  // Get unique domains without using Set spread
  const getUniqueDomains = () => {
    const domains: string[] = [];
    projects.forEach(project => {
      if (!domains.includes(project.domain)) {
        domains.push(project.domain);
      }
    });
    return domains.length;
  };

  const getUniqueYears = () => {
    const years: number[] = [];
    projects.forEach(project => {
      if (!years.includes(project.year)) {
        years.push(project.year);
      }
    });
    return years.length;
  };

  // Statistics
  const stats = {
    total: projects.length,
    domains: getUniqueDomains(),
    years: getUniqueYears(),
    totalTechStacks: projects.reduce((sum, p) => sum + p.techStack.length, 0),
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
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
                Projects
              </h1>
              <p className="text-gray-600 mt-1">
                Discover and explore innovative student projects
              </p>
            </div>
            {canCreate && (
              <Link
                to="/projects/new"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <MdAdd className="w-5 h-5" />
                <span>New Project</span>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <FaProjectDiagram className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Domains</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.domains}</p>
                </div>
                <MdCategory className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Years</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.years}</p>
                </div>
                <MdDateRange className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tech Stack Used</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalTechStacks}</p>
                </div>
                <FaCodeBranch className="w-8 h-8 text-yellow-500 opacity-50" />
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
                  placeholder="Search by title, description, or keywords..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Domain Filter */}
              <div className="w-48 relative">
                <MdFilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filters.domain}
                  onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Domains</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="IoT">IoT</option>
                  <option value="Data Science">Data Science</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
              
              {/* Year Filter */}
              <div className="w-32 relative">
                <MdDateRange className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Year"
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
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

        {/* Projects Display */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaProjectDiagram className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.domain || filters.year
                ? 'Try adjusting your filters'
                : 'No projects have been added yet'}
            </p>
            {canCreate && (
              <Link
                to="/projects/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create First Project</span>
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaProjectDiagram className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                          {project.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <MdCategory className="w-3 h-3" />
                            <span>{project.domain}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <MdDateRange className="w-3 h-3" />
                            <span>{project.year}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {project.summary || project.description.substring(0, 100)}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.techStack.slice(0, 4).map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-lg"
                      >
                        <MdCode className="w-3 h-3" />
                        <span>{tech}</span>
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Students */}
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <MdPerson className="w-4 h-4" />
                    <span>
                      {(project as any).students?.length || 0} student(s)
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-3 border-t">
                    <Link
                      to={`/projects/${project._id}`}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <MdVisibility className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>
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
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tech Stack
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FaProjectDiagram className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">{project.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {project.summary || project.description.substring(0, 60)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          <MdCategory className="w-3 h-3" />
                          <span>{project.domain}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {project.year}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.slice(0, 3).map((tech, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center space-x-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                            >
                              <MdCode className="w-3 h-3" />
                              <span>{tech}</span>
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <MdPerson className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{(project as any).students?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/projects/${project._id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="View Details"
                          >
                            <MdVisibility className="w-5 h-5" />
                          </Link>
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

export default Projects;