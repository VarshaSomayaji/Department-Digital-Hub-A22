import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
} from '../../services/announcement';
import { Role } from '../../types';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdTitle, 
  MdDescription, 
  MdPeople, 
  MdSave, 
  MdCancel,
  MdAnnouncement,
  MdEdit,
  MdAdd,
  MdCheckCircle,
  MdRadioButtonUnchecked
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaUserTie,
} from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';

const AnnouncementForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (isEditing) {
      const fetchAnnouncement = async () => {
        try {
          const data = await getAnnouncementById(id!);
          setTitle(data.title);
          setContent(data.content);
          setTargetAudience(data.targetAudience);
        } catch (error) {
          toast.error('Failed to load announcement');
          navigate('/announcements');
        }
      };
      fetchAnnouncement();
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
      toast.error('Please enter a title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }
    if (targetAudience.length === 0) {
      toast.error('Please select at least one target audience');
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing) {
        await updateAnnouncement(id!, { title, content, targetAudience });
        toast.success('Announcement updated successfully');
      } else {
        await createAnnouncement({ title, content, targetAudience });
        toast.success('Announcement created successfully');
      }
      navigate('/announcements');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || (isEditing ? 'Update failed' : 'Creation failed'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: Role, size: string = "w-5 h-5") => {
    switch (role) {
      case 'STUDENT':
        return <FaGraduationCap className={`${size} text-green-600`} />;
      case 'FACULTY':
        return <FaChalkboardTeacher className={`${size} text-blue-600`} />;
      case 'HOD':
        return <FaUserTie className={`${size} text-purple-600`} />;
      case 'ADMIN':
        return <GiSettingsKnobs className={`${size} text-red-600`} />;
      default:
        return <MdPeople className={`${size} text-gray-600`} />;
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'STUDENT':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'FACULTY':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'HOD':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      case 'ADMIN':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getRoleTextColor = (role: Role) => {
    switch (role) {
      case 'STUDENT':
        return 'text-green-700';
      case 'FACULTY':
        return 'text-blue-700';
      case 'HOD':
        return 'text-purple-700';
      case 'ADMIN':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  // Available roles based on user role (if user is not admin, restrict options)
  const getAvailableRoles = (): Role[] => {
    if (!user) return ['STUDENT', 'FACULTY', 'HOD', 'ADMIN'];
    
    switch (user.role) {
      case 'ADMIN':
        return ['ADMIN', 'HOD', 'FACULTY', 'STUDENT'];
      case 'HOD':
        return ['HOD', 'FACULTY', 'STUDENT'];
      case 'FACULTY':
        return ['FACULTY', 'STUDENT'];
      default:
        return ['STUDENT'];
    }
  };

  const roleOptions = getAvailableRoles();

  const handleRoleToggle = (role: Role) => {
    if (targetAudience.includes(role)) {
      setTargetAudience(targetAudience.filter((r) => r !== role));
    } else {
      setTargetAudience([...targetAudience, role]);
    }
  };

  const getSelectedCount = () => {
    return targetAudience.length;
  };

  const getAudienceLabel = () => {
    if (targetAudience.length === 0) return 'No audiences selected';
    if (targetAudience.length === roleOptions.length) return 'All audiences';
    return `${targetAudience.length} audience${targetAudience.length > 1 ? 's' : ''} selected`;
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
              {isEditing ? (
                <MdEdit className="w-6 h-6 text-white" />
              ) : (
                <MdAdd className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isEditing ? 'Edit Announcement' : 'Create Announcement'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? 'Update your announcement details' 
                  : 'Share important information with your audience'}
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
                  placeholder="Enter announcement title..."
                />
              </div>
              <p className="text-xs text-gray-500">
                Choose a clear and descriptive title (max 100 characters)
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
                  placeholder="Write your announcement content here..."
                />
              </div>
              <p className="text-xs text-gray-500">
                Provide detailed information (max 5000 characters)
              </p>
            </div>

            {/* Target Audience Field */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {getSelectedCount()} selected
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {roleOptions.map((role) => {
                  const isSelected = targetAudience.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleToggle(role)}
                      className={`relative p-4 border-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? `${getRoleColor(role)} border-current shadow-md scale-105`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getRoleIcon(role, "w-6 h-6")}
                          <div className="text-left">
                            <div className={`font-semibold ${isSelected ? getRoleTextColor(role) : 'text-gray-700'}`}>
                              {role}
                            </div>
                            <div className="text-xs text-gray-500">
                              {role === 'STUDENT' && 'Undergraduate & Graduate'}
                              {role === 'FACULTY' && 'Teaching Staff'}
                              {role === 'HOD' && 'Department Heads'}
                              {role === 'ADMIN' && 'Administrators'}
                            </div>
                          </div>
                        </div>
                        {isSelected ? (
                          <MdCheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <MdRadioButtonUnchecked className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <MdPeople className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{getAudienceLabel()}</span>
              </div>
            </div>

            {/* Preview Section (Optional) */}
            {title && content && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MdAnnouncement className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{content}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {targetAudience.map((audience) => (
                      <span
                        key={audience}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(audience)} ${getRoleTextColor(audience)}`}
                      >
                        {getRoleIcon(audience, "w-3 h-3")}
                        <span>{audience}</span>
                      </span>
                    ))}
                  </div>
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
                  <span>{isEditing ? 'Update Announcement' : 'Publish Announcement'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/announcements')}
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
            <MdAnnouncement className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Tips for effective announcements:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Keep titles clear and concise</li>
                <li>• Include all relevant details in the content</li>
                <li>• Select appropriate target audience to ensure the right people see it</li>
                <li>• Announcements will be visible immediately after publishing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementForm;