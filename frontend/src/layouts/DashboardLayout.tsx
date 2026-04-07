import React, { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdPeople, 
  MdAnnouncement, 
  MdPoll, 
  MdBusinessCenter,
  MdClass,
  MdAttachMoney,
  MdQuiz,
  MdGrade,
  MdEventNote,
  MdDescription,
  MdFolder,
  MdSmartToy,
  MdMenu,
  MdChevronLeft,
  MdLogout,
  MdPerson,
  MdSchool,
  MdAssignment,
  MdCalendarToday,
  MdCheckCircle,
  MdPendingActions
} from 'react-icons/md';
import { 
  FaChalkboardTeacher, 
  FaUserTie,
  FaGraduationCap,
  FaProjectDiagram,
  FaFileAlt
} from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { GiSmartphone } from 'react-icons/gi';
import { toast } from 'react-hot-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Icon mapping for menu items
  const getMenuIcon = (label: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Dashboard': <MdDashboard className="w-5 h-5" />,
      'User Management': <MdPeople className="w-5 h-5" />,
      'Announcements': <MdAnnouncement className="w-5 h-5" />,
      'Polls': <MdPoll className="w-5 h-5" />,
      'Placement Drives': <MdBusinessCenter className="w-5 h-5" />,
      'Classroom Updates': <MdClass className="w-5 h-5" />,
      'Attendance': <MdCheckCircle className="w-5 h-5" />,
      'My Attendance': <MdCheckCircle className="w-5 h-5" />,
      'Marks': <MdGrade className="w-5 h-5" />,
      'Quizzes': <MdQuiz className="w-5 h-5" />,
      'Timetable': <MdCalendarToday className="w-5 h-5" />,
      'Notes': <MdDescription className="w-5 h-5" />,
      'Projects': <FaProjectDiagram className="w-5 h-5" />,
      'Leave Requests': <MdPendingActions className="w-5 h-5" />,
      'Leave Approvals': <MdAssignment className="w-5 h-5" />,
      'AI Doubt Resolver': <MdSmartToy className="w-5 h-5" />,
    };
    return iconMap[label] || <MdFolder className="w-5 h-5" />;
  };

  // Role-based menu items with icons
  const menuItems = {
    ADMIN: [
      { label: 'Dashboard', path: '/admin', icon: <MdDashboard /> },
      { label: 'User Management', path: '/admin/users', icon: <MdPeople /> },
      { label: 'Announcements', path: '/announcements', icon: <MdAnnouncement /> },
      { label: 'Polls', path: '/polls', icon: <MdPoll /> },
      { label: 'Placement Drives', path: '/placements', icon: <MdBusinessCenter /> },
      { label: 'Classroom Updates', path: '/classroom', icon: <MdClass /> },
    ],
    HOD: [
      { label: 'Dashboard', path: '/hod', icon: <MdDashboard /> },
      { label: 'Announcements', path: '/announcements', icon: <MdAnnouncement /> },
      { label: 'Polls', path: '/polls', icon: <MdPoll /> },
      { label: 'Attendance', path: '/attendance', icon: <MdCheckCircle /> },
      { label: 'Quizzes', path: '/quizzes', icon: <MdQuiz /> },
      { label: 'Marks', path: '/marks', icon: <MdGrade /> },
      { label: 'Leave Approvals', path: '/leave/pending', icon: <MdAssignment /> },
      { label: 'Classroom Updates', path: '/classroom', icon: <MdClass /> },
      { label: 'Placement Drives', path: '/placements', icon: <MdBusinessCenter /> },
      { label: 'Projects', path: '/projects', icon: <FaProjectDiagram /> },
    ],
    FACULTY: [
      { label: 'Dashboard', path: '/faculty', icon: <MdDashboard /> },
      { label: 'Announcements', path: '/announcements', icon: <MdAnnouncement /> },
      { label: 'Polls', path: '/polls', icon: <MdPoll /> },
      { label: 'Attendance', path: '/attendance', icon: <MdCheckCircle /> },
      { label: 'Marks', path: '/marks', icon: <MdGrade /> },
      { label: 'Quizzes', path: '/quizzes', icon: <MdQuiz /> },
      { label: 'Timetable', path: '/timetable', icon: <MdCalendarToday /> },
      { label: 'Notes', path: '/notes', icon: <MdDescription /> },
      { label: 'Classroom Updates', path: '/classroom', icon: <MdClass /> },
      { label: 'Projects', path: '/projects', icon: <FaProjectDiagram /> },
    ],
    STUDENT: [
      { label: 'Dashboard', path: '/student', icon: <MdDashboard /> },
      { label: 'Announcements', path: '/announcements', icon: <MdAnnouncement /> },
      { label: 'Polls', path: '/polls', icon: <MdPoll /> },
      { label: 'My Attendance', path: '/attendance/my', icon: <MdCheckCircle /> },
      { label: 'Marks', path: '/marks', icon: <MdGrade /> },
      { label: 'Quizzes', path: '/quizzes/student', icon: <MdQuiz /> },
      { label: 'Timetable', path: '/timetable', icon: <MdCalendarToday /> },
      { label: 'Notes', path: '/notes', icon: <MdDescription /> },
      { label: 'Leave Requests', path: '/leave', icon: <MdPendingActions /> },
      { label: 'Classroom Updates', path: '/classroom', icon: <MdClass /> },
      { label: 'Placement Drives', path: '/placements', icon: <MdBusinessCenter /> },
      { label: 'Projects', path: '/projects', icon: <FaProjectDiagram /> },
      { label: 'AI Doubt Resolver', path: '/ai/doubt', icon: <MdSmartToy /> },
    ],
  };

  const currentMenu = user ? menuItems[user.role] : [];
  
  // Role-based gradient and icon
  const getRoleGradient = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'from-red-500 to-pink-500';
      case 'HOD':
        return 'from-purple-500 to-indigo-500';
      case 'FACULTY':
        return 'from-blue-500 to-cyan-500';
      case 'STUDENT':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <MdPeople className="w-8 h-8" />;
      case 'HOD':
        return <FaUserTie className="w-8 h-8" />;
      case 'FACULTY':
        return <FaChalkboardTeacher className="w-8 h-8" />;
      case 'STUDENT':
        return <FaGraduationCap className="w-8 h-8" />;
      default:
        return <MdSchool className="w-8 h-8" />;
    }
  };

  const isActivePath = (path: string) => {
    if (path === '/admin' || path === '/hod' || path === '/faculty' || path === '/student') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
      >
        <MdMenu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className={`p-6 border-b border-gray-200 flex items-center justify-between ${sidebarCollapsed ? 'flex-col' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className={`bg-gradient-to-r ${getRoleGradient()} p-2 rounded-xl shadow-lg`}>
              {getRoleIcon()}
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Department Hub
                </h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:block p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdChevronLeft className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && user && (
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-12rem)]">
          {currentMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 p-3 mb-2 rounded-xl transition-all duration-200 group ${
                isActivePath(item.path)
                  ? `bg-gradient-to-r ${getRoleGradient()} text-white shadow-lg`
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className={`${isActivePath(item.path) ? 'text-white' : 'text-gray-500'} group-hover:scale-110 transition-transform`}>
                {getMenuIcon(item.label)}
              </span>
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          {!sidebarCollapsed && (
            <Link
              to="/profile"
              className="flex items-center space-x-3 p-3 mb-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
            >
              <MdPerson className="w-5 h-5 text-gray-500" />
              <span className="font-medium">My Profile</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-red-600 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <MdLogout className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        } ml-0`}
      >
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4 ml-auto">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 overflow-y-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;