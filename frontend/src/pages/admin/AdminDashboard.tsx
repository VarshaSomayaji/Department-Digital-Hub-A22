import React, { useEffect, useState } from 'react';
import { getAdminDashboardData } from '../../services/dashboard';
import { AdminDashboardData } from '../../types/dashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdPeople, 
  MdWork, 
  MdSchool, 
  MdTrendingUp,
  MdRefresh,
  MdDownload,
  MdCalendarToday,
  MdTimeline,
  MdCategory,
  MdAssessment
} from 'react-icons/md';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC489A'];

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'students' | 'faculty' | 'total'>('total');
  const [timeRange, setTimeRange] = useState<'6months' | '1year' | 'all'>('6months');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getAdminDashboardData();
      setData(result);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
    toast.success('Dashboard refreshed');
  };

  const handleExport = () => {
    if (!data) return;
    
    // Create CSV data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', data.userStats.totalUsers],
      ['Total Projects', data.projectStats.totalProjects],
      ['Total Faculty', data.userStats.totalFaculty],
      ['Total Students', data.userStats.totalStudents],
      ['Total HODs', data.userStats.totalHODs],
      ['Total Admins', data.userStats.totalAdmins],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No data available</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Prepare user distribution pie chart data
  const userPieData = [
    { name: 'Students', value: data.userStats.totalStudents, color: COLORS[0], icon: '🎓' },
    { name: 'Faculty', value: data.userStats.totalFaculty, color: COLORS[1], icon: '👨‍🏫' },
    { name: 'HODs', value: data.userStats.totalHODs, color: COLORS[2], icon: '👔' },
    { name: 'Admins', value: data.userStats.totalAdmins, color: COLORS[3], icon: '⚙️' },
  ].filter(item => item.value > 0);

  // Calculate percentages for user distribution
  const totalUsers = data.userStats.totalUsers;
  const userPercentages = userPieData.map(item => ({
    ...item,
    percentage: ((item.value / totalUsers) * 100).toFixed(1)
  }));

  // Project domain distribution
  const domainData = data.projectStats.byDomain;

  // Project year distribution
  const yearData = data.projectStats.byYear;

  // Growth data with formatting
  const growthData = data.growthStats.map(item => ({
    ...item,
    formattedMonth: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }));

  // Calculate growth percentages
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return '+100%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const userGrowth = growthData.length >= 2 
    ? calculateGrowth(
        growthData[growthData.length - 1].total,
        growthData[growthData.length - 2].total
      )
    : '+0%';

  const projectGrowth = yearData.length >= 2
    ? calculateGrowth(
        yearData[yearData.length - 1].count,
        yearData[yearData.length - 2].count
      )
    : '+0%';

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label renderer for Pie chart
  const renderCustomLabel = ({ name, percent }: any) => {
    if (percent === undefined) return name;
    return `${name} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Overview of platform analytics and statistics
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MdRefresh className="w-5 h-5 text-gray-600" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors"
            >
              <MdDownload className="w-5 h-5" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MdPeople className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {data.userStats.totalUsers.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              {data.userStats.totalStudents} students • {data.userStats.totalFaculty} faculty
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <MdWork className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Projects</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {data.projectStats.totalProjects.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Across {domainData.length} domains
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaUserGraduate className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {data.userStats.totalStudents.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              {((data.userStats.totalStudents / data.userStats.totalUsers) * 100).toFixed(1)}% of total users
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FaChalkboardTeacher className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Faculty</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {data.userStats.totalFaculty.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Including {data.userStats.totalHODs} HODs
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* User Distribution and Domain Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MdPeople className="w-5 h-5 text-blue-500" />
                  User Distribution
                </h2>
                <p className="text-sm text-gray-500 mt-1">Breakdown by role</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={userPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
              {userPercentages.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projects by Domain Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MdCategory className="w-5 h-5 text-purple-500" />
                  Projects by Domain
                </h2>
                <p className="text-sm text-gray-500 mt-1">Distribution across domains</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={domainData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8884d8">
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects by Year and User Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects by Year Line Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MdTimeline className="w-5 h-5 text-green-500" />
                  Projects by Year
                </h2>
                <p className="text-sm text-gray-500 mt-1">Year-over-year project trends</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 6 }}
                  activeDot={{ r: 8 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="none" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Area Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MdTrendingUp className="w-5 h-5 text-orange-500" />
                  User Growth
                </h2>
                <p className="text-sm text-gray-500 mt-1">Last 6 months trend</p>
              </div>
              <div className="flex space-x-2">
                {(['students', 'faculty', 'total'] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      selectedMetric === metric
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {metric === 'students' ? 'Students' : metric === 'faculty' ? 'Faculty' : 'Total'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedMonth" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedMetric === 'students' && (
                  <Area 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                  />
                )}
                {selectedMetric === 'faculty' && (
                  <Area 
                    type="monotone" 
                    dataKey="faculty" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                  />
                )}
                {selectedMetric === 'total' && (
                  <>
                    <Area 
                      type="monotone" 
                      dataKey="students" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="faculty" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hods" 
                      stackId="1"
                      stroke="#F59E0B" 
                      fill="#F59E0B" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="admins" 
                      stackId="1"
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <MdAssessment className="w-8 h-8 text-blue-600" />
              <MdCalendarToday className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Active Projects</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {data.projectStats.totalProjects}
            </p>
            <p className="text-xs text-gray-500 mt-2">Across all departments</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <MdCategory className="w-8 h-8 text-purple-600" />
              <MdTrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Unique Domains</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {domainData.length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Project categories</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <MdTimeline className="w-8 h-8 text-green-600" />
              <MdTrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Growth Rate</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {userGrowth}
            </p>
            <p className="text-xs text-gray-500 mt-2">Month over month</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;