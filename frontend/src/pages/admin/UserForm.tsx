import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createUser, getUserById, updateUser } from '../../services/adminUser';
import { Role } from '../../types';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdPerson, 
  MdEmail, 
  MdLock, 
  MdPhone, 
  MdHome,
  MdSchool,
  MdBadge,
  MdCalendarToday,
  MdSubject,
  MdCloudUpload,
  MdSave,
  MdCancel,
  MdVisibility,
  MdVisibilityOff,
  MdBusiness,
  MdWork,
  MdPermIdentity,
  MdLocationOn,
  MdPhotoCamera
} from 'react-icons/md';
import { 
  FaChalkboardTeacher, 
  FaUserTie,
  FaGraduationCap,
  FaBuilding,
  FaIdCard,
  FaUserCircle
} from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isEditing = !!id;

  const [role, setRole] = useState<Role>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [accountStatus, setAccountStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Role-specific fields
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [batch, setBatch] = useState('');
  const [subjects, setSubjects] = useState(''); // comma-separated

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (isEditing) {
      const fetchUser = async () => {
        try {
          const user = await getUserById(id!);
          setRole(user.role);
          setName(user.name);
          setEmail(user.email);
          setMobileNumber(user.mobileNumber || '');
          setAddress(user.address || '');
          setAccountStatus(user.accountStatus);
          if (user.image) setImagePreview(user.image);

          // Role-specific fields
          if (user.role === 'STUDENT') {
            setRollNo((user as any).rollNo || '');
            setBatch((user as any).batch || '');
            setDepartment((user as any).department || '');
          } else if (user.role === 'FACULTY') {
            setDepartment((user as any).department || '');
            setEmployeeId((user as any).employeeId || '');
            setSubjects(((user as any).subjects || []).join(', '));
          } else if (user.role === 'HOD') {
            setDepartment((user as any).department || '');
            setEmployeeId((user as any).employeeId || '');
          }
        } catch (error) {
          toast.error('Failed to load user');
          navigate('/admin/users');
        } finally {
          setFetching(false);
        }
      };
      fetchUser();
    } else {
      setFetching(false);
    }
  }, [id, isEditing, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name || !email || !mobileNumber || !address) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!isEditing && !password) {
      toast.error('Password is required for new users');
      return;
    }
    if (mobileNumber.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    const formData = new FormData();
    formData.append('role', role);
    formData.append('name', name);
    formData.append('email', email);
    if (password) formData.append('password', password);
    formData.append('mobileNumber', mobileNumber);
    formData.append('address', address);
    formData.append('accountStatus', accountStatus);
    if (image) formData.append('image', image);

    // Role-specific fields
    if (role === 'HOD' || role === 'FACULTY') {
      if (!department || !employeeId) {
        toast.error('Department and Employee ID are required for this role');
        return;
      }
      formData.append('department', department);
      formData.append('employeeId', employeeId);
    }
    if (role === 'FACULTY') {
      formData.append('subjects', subjects);
    }
    if (role === 'STUDENT') {
      if (!rollNo || !batch || !department) {
        toast.error('Roll number, batch, and department are required for student');
        return;
      }
      formData.append('rollNo', rollNo);
      formData.append('batch', batch);
      formData.append('department', department);
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateUser(id!, role, formData);
        toast.success('User updated successfully');
      } else {
        await createUser(formData);
        toast.success('User created successfully');
      }
      navigate('/admin/users');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleValue: Role) => {
    switch (roleValue) {
      case 'STUDENT':
        return <FaGraduationCap className="w-6 h-6" />;
      case 'FACULTY':
        return <FaChalkboardTeacher className="w-6 h-6" />;
      case 'HOD':
        return <FaUserTie className="w-6 h-6" />;
      case 'ADMIN':
        return <GiSettingsKnobs className="w-6 h-6" />;
      default:
        return <MdPerson className="w-6 h-6" />;
    }
  };

  const getRoleGradient = () => {
    switch (role) {
      case 'STUDENT':
        return 'from-green-500 to-emerald-500';
      case 'FACULTY':
        return 'from-blue-500 to-cyan-500';
      case 'HOD':
        return 'from-purple-500 to-indigo-500';
      case 'ADMIN':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-3 bg-gradient-to-r ${getRoleGradient()} rounded-xl shadow-lg`}>
              {getRoleIcon(role)}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isEditing ? 'Edit User' : 'Add New User'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update user information' : 'Create a new user account'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Role Selection - Only when creating */}
            {!isEditing && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  User Role
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['STUDENT', 'FACULTY', 'HOD', 'ADMIN'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`relative p-3 border-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                        role === r
                          ? `bg-gradient-to-r ${r === 'STUDENT' ? 'from-green-500 to-emerald-500' : 
                             r === 'FACULTY' ? 'from-blue-500 to-cyan-500' :
                             r === 'HOD' ? 'from-purple-500 to-indigo-500' :
                             'from-red-500 to-pink-500'} text-white shadow-md`
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-xl">
                          {r === 'STUDENT' && <FaGraduationCap />}
                          {r === 'FACULTY' && <FaChalkboardTeacher />}
                          {r === 'HOD' && <FaUserTie />}
                          {r === 'ADMIN' && <GiSettingsKnobs />}
                        </span>
                        <span className="font-medium">
                          {r.charAt(0) + r.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Display Role Badge when Editing */}
            {isEditing && (
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl">
                {getRoleIcon(role)}
                <span className="font-medium text-gray-700">Role: {role}</span>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2 border-b pb-2">
                <MdPerson className="w-5 h-5 text-blue-500" />
                <span>Basic Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.name ? 'transform scale-[1.02]' : ''}`}>
                    <MdPerson className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.name ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => handleFocus('name')}
                      onBlur={() => handleBlur('name')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.email ? 'transform scale-[1.02]' : ''}`}>
                    <MdEmail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.email ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => handleFocus('email')}
                      onBlur={() => handleBlur('email')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.mobile ? 'transform scale-[1.02]' : ''}`}>
                    <MdPhone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.mobile ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      onFocus={() => handleFocus('mobile')}
                      onBlur={() => handleBlur('mobile')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password {isEditing && '(leave blank to keep current)'} *
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedFields.password ? 'transform scale-[1.02]' : ''}`}>
                    <MdLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.password ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => handleFocus('password')}
                      onBlur={() => handleBlur('password')}
                      required={!isEditing}
                      className="w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <MdVisibilityOff className="w-5 h-5" /> : <MdVisibility className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Address *</label>
                <div className={`relative transition-all duration-200 ${focusedFields.address ? 'transform scale-[1.02]' : ''}`}>
                  <MdHome className={`absolute left-3 top-4 w-5 h-5 transition-colors duration-200 ${focusedFields.address ? 'text-blue-500' : 'text-gray-400'}`} />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={() => handleFocus('address')}
                    onBlur={() => handleBlur('address')}
                    required
                    rows={3}
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Role-specific Information Section */}
            {(role === 'HOD' || role === 'FACULTY') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2 border-b pb-2">
                  <MdWork className="w-5 h-5 text-purple-500" />
                  <span>Professional Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Department *</label>
                    <div className={`relative transition-all duration-200 ${focusedFields.department ? 'transform scale-[1.02]' : ''}`}>
                      <FaBuilding className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.department ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        onFocus={() => handleFocus('department')}
                        onBlur={() => handleBlur('department')}
                        required
                        className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Employee ID *</label>
                    <div className={`relative transition-all duration-200 ${focusedFields.employeeId ? 'transform scale-[1.02]' : ''}`}>
                      <FaIdCard className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.employeeId ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        onFocus={() => handleFocus('employeeId')}
                        onBlur={() => handleBlur('employeeId')}
                        required
                        className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="EMP001"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === 'FACULTY' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Subjects (comma-separated)</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.subjects ? 'transform scale-[1.02]' : ''}`}>
                    <MdSubject className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.subjects ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={subjects}
                      onChange={(e) => setSubjects(e.target.value)}
                      onFocus={() => handleFocus('subjects')}
                      onBlur={() => handleBlur('subjects')}
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Mathematics, Physics, Chemistry"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'STUDENT' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2 border-b pb-2">
                  <MdSchool className="w-5 h-5 text-green-500" />
                  <span>Academic Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Roll Number *</label>
                    <div className={`relative transition-all duration-200 ${focusedFields.rollNo ? 'transform scale-[1.02]' : ''}`}>
                      <MdBadge className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.rollNo ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        onFocus={() => handleFocus('rollNo')}
                        onBlur={() => handleBlur('rollNo')}
                        required
                        className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="CS2024001"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Batch *</label>
                    <div className={`relative transition-all duration-200 ${focusedFields.batch ? 'transform scale-[1.02]' : ''}`}>
                      <MdCalendarToday className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.batch ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        onFocus={() => handleFocus('batch')}
                        onBlur={() => handleBlur('batch')}
                        required
                        className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Department *</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.studentDept ? 'transform scale-[1.02]' : ''}`}>
                    <FaBuilding className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.studentDept ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      onFocus={() => handleFocus('studentDept')}
                      onBlur={() => handleBlur('studentDept')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Account Status (only for editing) */}
            {isEditing && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2 border-b pb-2">
                  <MdPermIdentity className="w-5 h-5 text-orange-500" />
                  <span>Account Settings</span>
                </h3>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <select
                    value={accountStatus}
                    onChange={(e) => setAccountStatus(e.target.value as any)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            )}

            {/* Profile Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2 border-b pb-2">
                <MdPhotoCamera className="w-5 h-5 text-pink-500" />
                <span>Profile Image</span>
              </h3>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-4">
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-24 w-24 rounded-full object-cover border-4 border-blue-500"
                    />
                  )}
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600"
                      />
                      <MdCloudUpload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
                  <span>{isEditing ? 'Update User' : 'Create User'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
            >
              <MdCancel className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UserForm;