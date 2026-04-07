import React, { useEffect, useState } from 'react';
import { getHODDashboardData } from '../../services/dashboard';
import { HODDashboardData } from '../../types/dashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdPeople, 
  MdSchool, 
  MdPending, 
  MdWork, 
  MdRefresh,
  MdDownload,
  MdTrendingUp,
  MdCategory,
  MdAssessment,
  MdTimer,
  MdCheckCircle,
  MdWarning
} from 'react-icons/md';
import { 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaProjectDiagram,
  FaChartLine
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC489A'];

const HODDashboard: React.FC = () => {
  const [data, setData] = useState<HODDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getHODDashboardData();
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
    
    const csvData = [
      ['Metric', 'Value'],
      ['Department', data.departmentStats.department],
      ['Total Students', data.departmentStats.totalStudents],
      ['Total Faculty', data.departmentStats.totalFaculty],
      ['Pending Leave Requests', data.pendingLeaveCount],
      ['Total Projects', data.projectDomainStats.reduce((sum, p) => sum + p.value, 0)],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hod-dashboard-${data.departmentStats.department}-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  // Custom label renderer for Pie chart
  const renderCustomLabel = ({ name, percent }: any) => {
    if (percent === undefined) return name;
    return `${name} (${(percent * 100).toFixed(0)}%)`;
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

  const totalProjects = data.projectDomainStats.reduce((sum, p) => sum + p.value, 0);
  const averageProjectsPerDomain = totalProjects / data.projectDomainStats.length || 0;

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                HOD Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Department: <span className="font-semibold text-blue-600">{data.departmentStats.department}</span>
              </p>
            </div>
            <div className="flex space-x-3">
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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaUserGraduate className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {data.departmentStats.totalStudents.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Enrolled in {data.departmentStats.department}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaChalkboardTeacher className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Faculty</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {data.departmentStats.totalFaculty.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Teaching staff members
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <MdPending className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Pending Leave Requests</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {data.pendingLeaveCount}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Awaiting approval
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaProjectDiagram className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Projects</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {totalProjects}
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Across {data.projectDomainStats.length} domains
            </div>
          </div>
        </div>

        {/* Projects by Domain Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MdCategory className="w-5 h-5 text-purple-500" />
                Projects by Domain
              </h2>
              <p className="text-sm text-gray-500 mt-1">Distribution of projects across different domains</p>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setSelectedChart('bar')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedChart === 'bar'
                    ? 'bg-white shadow-md text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setSelectedChart('pie')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedChart === 'pie'
                    ? 'bg-white shadow-md text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Pie Chart
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            {selectedChart === 'bar' ? (
              <BarChart data={data.projectDomainStats} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                  {data.projectDomainStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={data.projectDomainStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.projectDomainStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>

          {/* Domain Statistics Table */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Domain-wise Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Domain</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Projects</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Percentage</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.projectDomainStats.map((domain, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-800">{domain.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{domain.value}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 max-w-24">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${(domain.value / totalProjects) * 100}%`,
                                  backgroundColor: COLORS[idx % COLORS.length]
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {((domain.value / totalProjects) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <MdCheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Quick Actions:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Review pending leave requests from the Leave Management section</li>
                <li>• Monitor student project progress regularly</li>
                <li>• Schedule department meetings with faculty members</li>
                <li>• Track department performance metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HODDashboard;