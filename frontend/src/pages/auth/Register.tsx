import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Role } from '../../types';
import { register } from '../../services/auth';
import toast from 'react-hot-toast';
import { 
  MdPerson, 
  MdEmail, 
  MdLock, 
  MdPhone, 
  MdHome,
  MdSchool,MdVisibilityOff,MdVisibility,
  MdBadge,
  MdCalendarToday,
  MdSubject,
  MdCloudUpload,
  MdArrowBack
} from 'react-icons/md';
import { 
  FaChalkboardTeacher, 
  FaUserTie,
  FaGraduationCap,
  FaBuilding,
  FaIdCard
} from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';

const Register: React.FC = () => {
  const [role, setRole] = useState<Role>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  // role-specific fields
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [batch, setBatch] = useState('');
  const [subjects, setSubjects] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Focus states for animations
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('role', role);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('mobileNumber', mobileNumber);
    formData.append('address', address);
    if (image) formData.append('image', image);

    // Add role-specific fields
    if (role === 'HOD' || role === 'FACULTY') {
      formData.append('department', department);
      formData.append('employeeId', employeeId);
    }
    if (role === 'FACULTY') {
      formData.append('subjects', subjects);
    }
    if (role === 'STUDENT') {
      formData.append('rollNo', rollNo);
      formData.append('batch', batch);
      formData.append('department', department);
    }

    try {
      await register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    STUDENT: <FaGraduationCap className="w-5 h-5" />,
    FACULTY: <FaChalkboardTeacher className="w-5 h-5" />,
    HOD: <FaUserTie className="w-5 h-5" />,
    ADMIN: <GiSettingsKnobs className="w-5 h-5" />,
  };

  const roleColors = {
    STUDENT: 'bg-green-50 border-green-200 hover:border-green-400 text-green-700',
    FACULTY: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-700',
    HOD: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-700',
    ADMIN: 'bg-red-50 border-red-200 hover:border-red-400 text-red-700',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <MdSchool className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-600 mt-2">Join our educational platform</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 transform transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['STUDENT', 'FACULTY', 'HOD'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`relative p-3 border-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      role === r
                        ? `${roleColors[r]} border-current shadow-md scale-105`
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xl">{roleIcons[r]}</span>
                      <span className={`font-medium ${role === r ? 'font-semibold' : ''}`}>
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </span>
                    </div>
                    {role === r && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Common Fields - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
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
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className={`relative transition-all duration-200 ${focusedFields.email ? 'transform scale-[1.02]' : ''}`}>
                  <MdEmail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.email ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Common Fields - Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className={`relative transition-all duration-200 ${focusedFields.password ? 'transform scale-[1.02]' : ''}`}>
                  <MdLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.password ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    required
                    className="w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff className="w-5 h-5" /> : <MdVisibility className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
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
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <div className={`relative transition-all duration-200 ${focusedFields.address ? 'transform scale-[1.02]' : ''}`}>
                <MdHome className={`absolute left-3 top-4 w-5 h-5 transition-colors duration-200 ${focusedFields.address ? 'text-blue-500' : 'text-gray-400'}`} />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={() => handleFocus('address')}
                  onBlur={() => handleBlur('address')}
                  required
                  rows={2}
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                  placeholder="123 Main St, City, Country"
                />
              </div>
            </div>

            {/* Role-specific Fields */}
            {(role === 'HOD' || role === 'FACULTY') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.department ? 'transform scale-[1.02]' : ''}`}>
                    <FaBuilding className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.department ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      onFocus={() => handleFocus('department')}
                      onBlur={() => handleBlur('department')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.employeeId ? 'transform scale-[1.02]' : ''}`}>
                    <FaIdCard className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.employeeId ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      onFocus={() => handleFocus('employeeId')}
                      onBlur={() => handleBlur('employeeId')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                      placeholder="EMP001"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'FACULTY' && (
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
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="Mathematics, Physics, Chemistry"
                  />
                </div>
              </div>
            )}

            {role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                    <div className={`relative transition-all duration-200 ${focusedFields.rollNo ? 'transform scale-[1.02]' : ''}`}>
                      <MdBadge className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.rollNo ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        onFocus={() => handleFocus('rollNo')}
                        onBlur={() => handleBlur('rollNo')}
                        required
                        className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                        placeholder="CS2024001"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Batch</label>
                    <div className={`relative transition-all duration-200 ${focusedFields.batch ? 'transform scale-[1.02]' : ''}`}>
                      <MdCalendarToday className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.batch ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        onFocus={() => handleFocus('batch')}
                        onBlur={() => handleBlur('batch')}
                        required
                        className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <div className={`relative transition-all duration-200 ${focusedFields.studentDept ? 'transform scale-[1.02]' : ''}`}>
                    <FaBuilding className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.studentDept ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      onFocus={() => handleFocus('studentDept')}
                      onBlur={() => handleBlur('studentDept')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Profile Image Upload */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Profile Image (optional)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 rounded-xl bg-gray-50/50 hover:bg-white transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600"
                />
                <MdCloudUpload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <MdSchool className="w-5 h-5" />
                  <span>Register Now</span>
                </div>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline inline-flex items-center gap-1"
              >
                <MdArrowBack className="w-4 h-4" />
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;