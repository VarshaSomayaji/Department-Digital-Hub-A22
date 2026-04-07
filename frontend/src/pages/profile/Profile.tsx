import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, changePassword } from '../../services/user';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdHome, 
  MdCamera, 
  MdSave,
  MdLock,
  MdVpnKey,
  MdCheckCircle,
  MdInfo,
  MdSchool,
  MdWork,
  MdBadge,
  MdCalendarToday,
  MdSubject
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaUserTie,
  FaBuilding,
  FaIdCard
} from 'react-icons/fa';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [roleSpecific, setRoleSpecific] = useState<Record<string, any>>({});

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setMobileNumber(user.mobileNumber || '');
      setAddress(user.address || '');
      if (user.image) setImagePreview(user.image);

      // Store role-specific fields
      if (user.role === 'STUDENT') {
        setRoleSpecific({
          rollNo: (user as any).rollNo,
          batch: (user as any).batch,
          department: (user as any).department,
        });
      } else if (user.role === 'FACULTY') {
        setRoleSpecific({
          department: (user as any).department,
          employeeId: (user as any).employeeId,
          subjects: ((user as any).subjects || []).join(', '),
        });
      } else if (user.role === 'HOD') {
        setRoleSpecific({
          department: (user as any).department,
          employeeId: (user as any).employeeId,
        });
      }
    }
  }, [user]);

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!mobileNumber.trim()) {
      toast.error('Mobile number is required');
      return;
    }
    if (mobileNumber.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('mobileNumber', mobileNumber.trim());
    formData.append('address', address.trim());
    if (image) {
      formData.append('image', image);
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(newPassword, user!.role);
      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'STUDENT':
        return <FaGraduationCap className="w-12 h-12 text-green-600" />;
      case 'FACULTY':
        return <FaChalkboardTeacher className="w-12 h-12 text-blue-600" />;
      case 'HOD':
        return <FaUserTie className="w-12 h-12 text-purple-600" />;
      case 'ADMIN':
        return <MdWork className="w-12 h-12 text-red-600" />;
      default:
        return <MdPerson className="w-12 h-12 text-gray-600" />;
    }
  };

  const getRoleBadgeClass = () => {
    switch (user?.role) {
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

  if (!user) return <DashboardLayout><p>Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>
              <div className="relative px-6 pb-6">
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                      <MdCamera className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadgeClass()}`}>
                    {user.role}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MdPhone className="w-4 h-4 text-gray-400" />
                      <span>{user.mobileNumber || 'Not set'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MdHome className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-2">{user.address || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Form */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <MdPerson className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
                </div>
              </div>
              <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.name ? 'transform scale-[1.02]' : ''}`}>
                    <MdPerson className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.name ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => handleFocus('name')}
                      onBlur={() => handleBlur('name')}
                      required
                      className="w-full pl-10 pr-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.mobile ? 'transform scale-[1.02]' : ''}`}>
                    <MdPhone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.mobile ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      onFocus={() => handleFocus('mobile')}
                      onBlur={() => handleBlur('mobile')}
                      required
                      className="w-full pl-10 pr-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your mobile number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.address ? 'transform scale-[1.02]' : ''}`}>
                    <MdHome className={`absolute left-3 top-3 w-5 h-5 transition-colors duration-200 ${focusedFields.address ? 'text-blue-500' : 'text-gray-400'}`} />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onFocus={() => handleFocus('address')}
                      onBlur={() => handleBlur('address')}
                      required
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

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
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Role-Specific Info */}
            {Object.keys(roleSpecific).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <MdSchool className="w-5 h-5 text-green-500" />
                    <h2 className="text-xl font-semibold text-gray-800">Additional Information</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(roleSpecific).map(([key, value]) => {
                      const getIcon = () => {
                        switch (key) {
                          case 'rollNo':
                            return <MdBadge className="w-4 h-4 text-gray-400" />;
                          case 'batch':
                            return <MdCalendarToday className="w-4 h-4 text-gray-400" />;
                          case 'department':
                            return <FaBuilding className="w-4 h-4 text-gray-400" />;
                          case 'employeeId':
                            return <FaIdCard className="w-4 h-4 text-gray-400" />;
                          case 'subjects':
                            return <MdSubject className="w-4 h-4 text-gray-400" />;
                          default:
                            return <MdInfo className="w-4 h-4 text-gray-400" />;
                        }
                      };
                      
                      return (
                        <div key={key} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          {getIcon()}
                          <div>
                            <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-sm font-medium text-gray-800">{value || 'Not provided'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Form */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <MdLock className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
                </div>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.newPassword ? 'transform scale-[1.02]' : ''}`}>
                    <MdVpnKey className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.newPassword ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => handleFocus('newPassword')}
                      onBlur={() => handleBlur('newPassword')}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.confirmPassword ? 'transform scale-[1.02]' : ''}`}>
                    <MdCheckCircle className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.confirmPassword ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showPassword" className="text-sm text-gray-600">
                    Show passwords
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 transform hover:scale-105"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <MdLock className="w-5 h-5" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;