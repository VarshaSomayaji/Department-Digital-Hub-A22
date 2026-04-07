import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserById } from '../../services/adminUser';
import { User } from '../../types/user';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdEdit, 
  MdArrowBack, 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdBadge,
  MdCalendarToday,
  MdPerson,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdDateRange,
  MdAccessTime
} from 'react-icons/md';
import { 
  FaChalkboardTeacher, 
  FaUserTie,
  FaGraduationCap,
  FaBuilding,
  FaIdCard,
} from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(id!);
        setUser(data);
      } catch (error) {
        toast.error('User not found');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <FaGraduationCap className="w-8 h-8 text-green-600" />;
      case 'FACULTY':
        return <FaChalkboardTeacher className="w-8 h-8 text-blue-600" />;
      case 'HOD':
        return <FaUserTie className="w-8 h-8 text-purple-600" />;
      case 'ADMIN':
        return <GiSettingsKnobs className="w-8 h-8 text-red-600" />;
      default:
        return <MdPerson className="w-8 h-8 text-gray-600" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <MdCheckCircle className="w-5 h-5 text-green-500" />;
      case 'Inactive':
        return <MdCancel className="w-5 h-5 text-red-500" />;
      default:
        return <MdPending className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="Back to Users"
              >
                <MdArrowBack className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  User Details
                </h1>
                <p className="text-gray-600 mt-1">
                  View complete user information
                </p>
              </div>
            </div>
            <Link
              to={`/admin/users/${id}/edit`}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <MdEdit className="w-5 h-5" />
              <span>Edit User</span>
            </Link>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center -mt-16 mb-6">
              <div className="relative">
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name} 
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-5xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <MdEmail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <MdPhone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-600">{user.mobileNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b">
              <MdPerson className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Account Status</span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(user.accountStatus)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(user.accountStatus)}`}>
                    {user.accountStatus}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Login</span>
                <span className="text-sm text-gray-800 flex items-center space-x-1">
                  <MdAccessTime className="w-4 h-4 text-gray-400" />
                  <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="text-sm text-gray-800 flex items-center space-x-1">
                  <MdDateRange className="w-4 h-4 text-gray-400" />
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b">
              <MdLocationOn className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 block mb-1">Address</span>
                <p className="text-gray-800">{user.address || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">Mobile Number</span>
                <p className="text-gray-800 flex items-center space-x-2">
                  <MdPhone className="w-4 h-4 text-gray-400" />
                  <span>{user.mobileNumber || 'Not provided'}</span>
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">Email Address</span>
                <p className="text-gray-800 flex items-center space-x-2">
                  <MdEmail className="w-4 h-4 text-gray-400" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Role-specific Information */}
          {user.role === 'STUDENT' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b">
                <FaGraduationCap className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800">Academic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Roll Number</span>
                  <p className="text-gray-800 font-medium flex items-center space-x-2">
                    <MdBadge className="w-4 h-4 text-gray-400" />
                    <span>{(user as any).rollNo || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Batch</span>
                  <p className="text-gray-800 font-medium flex items-center space-x-2">
                    <MdCalendarToday className="w-4 h-4 text-gray-400" />
                    <span>{(user as any).batch || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Department</span>
                  <p className="text-gray-800 font-medium flex items-center space-x-2">
                    <FaBuilding className="w-4 h-4 text-gray-400" />
                    <span>{(user as any).department || 'Not provided'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {user.role === 'FACULTY' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b">
                <FaChalkboardTeacher className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800">Faculty Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Department</span>
                    <p className="text-gray-800 font-medium flex items-center space-x-2">
                      <FaBuilding className="w-4 h-4 text-gray-400" />
                      <span>{(user as any).department || 'Not provided'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Employee ID</span>
                    <p className="text-gray-800 font-medium flex items-center space-x-2">
                      <FaIdCard className="w-4 h-4 text-gray-400" />
                      <span>{(user as any).employeeId || 'Not provided'}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Subjects</span>
                  <div className="flex flex-wrap gap-2">
                    {((user as any).subjects || []).length > 0 ? (
                      ((user as any).subjects || []).map((subject: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {subject.trim()}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-800">No subjects assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.role === 'HOD' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b">
                <FaUserTie className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-800">HOD Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Department</span>
                  <p className="text-gray-800 font-medium flex items-center space-x-2">
                    <FaBuilding className="w-4 h-4 text-gray-400" />
                    <span>{(user as any).department || 'Not provided'}</span>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Employee ID</span>
                  <p className="text-gray-800 font-medium flex items-center space-x-2">
                    <FaIdCard className="w-4 h-4 text-gray-400" />
                    <span>{(user as any).employeeId || 'Not provided'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {user.role === 'ADMIN' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b">
                <GiSettingsKnobs className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800">Administrator Information</h3>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">Admin Privileges</span>
                <p className="text-gray-800">Full system access and management capabilities</p>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
          >
            <MdArrowBack className="w-5 h-5" />
            <span>Back to User List</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetail;