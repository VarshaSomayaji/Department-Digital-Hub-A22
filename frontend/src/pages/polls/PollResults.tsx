import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPollResults } from '../../services/poll';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdBarChart, 
  MdArrowBack, 
  MdHowToVote, 
  MdPeople,
  MdCheckCircle,
  MdPoll,
  MdEmojiEvents,
} from 'react-icons/md';
import { 
  FaChartLine, 
  FaTrophy,
  FaMedal
} from 'react-icons/fa';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface ResultsData {
  totalVotes: number;
  optionCounts: Record<string, number>;
  userVoted?: boolean;
  userSelectedOption?: string;
  pollQuestion?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC489A', '#14B8A6', '#F97316'];

const PollResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getPollResults(id!);
        const transformed: ResultsData = {
          totalVotes: data.totalResponses || 0,
          optionCounts: data.results || {},
          userVoted: data.userVoted,
          userSelectedOption: data.userSelectedOption,
          pollQuestion: data.pollQuestion,
        };
        setResults(transformed);
      } catch (error) {
        toast.error('Failed to load results');
        navigate('/polls');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id, navigate]);

  const handleBack = () => {
    navigate('/polls');
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
            <p className="text-gray-600">Loading poll results...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!results) return null;

  // Calculate percentages and prepare data for charts
  const total = results.totalVotes || 0;
  const options = Object.keys(results.optionCounts);
  
  const chartData = options.map((opt) => ({
    name: opt,
    votes: results.optionCounts[opt] || 0,
    percentage: total ? Math.round((results.optionCounts[opt] / total) * 100) : 0,
  })).sort((a, b) => b.votes - a.votes);

  const maxVotes = Math.max(...chartData.map(d => d.votes), 0);
  const winningOption = chartData[0];
  const participationRate = total > 0 ? 100 : 0;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">Votes: {payload[0].value}</p>
          <p className="text-sm text-blue-600">
            Percentage: {total ? Math.round((payload[0].value / total) * 100) : 0}%
          </p>
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
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="Back to Polls"
            >
              <MdArrowBack className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Poll Results
              </h1>
              {results.pollQuestion && (
                <p className="text-gray-600 mt-2 text-lg">{results.pollQuestion}</p>
              )}
            </div>
          </div>
        </div>

        {/* User Vote Indicator */}
        {results.userVoted && results.userSelectedOption && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MdCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-green-800 font-medium">
                  You voted for: <strong>{results.userSelectedOption}</strong>
                </p>
                <p className="text-green-600 text-sm">
                  Thank you for participating in this poll!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Votes</p>
                <p className="text-3xl font-bold text-gray-800">{total}</p>
              </div>
              <MdHowToVote className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Participation Rate</p>
                <p className="text-3xl font-bold text-gray-800">{participationRate}%</p>
              </div>
              <MdPeople className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Options</p>
                <p className="text-3xl font-bold text-gray-800">{options.length}</p>
              </div>
              <MdPoll className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Leading Option</p>
                <p className="text-lg font-bold text-gray-800 truncate">
                  {winningOption?.name || 'N/A'}
                </p>
              </div>
              <FaTrophy className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaChartLine className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700">Visualization</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    chartType === 'bar'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Bar Chart
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    chartType === 'pie'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Pie Chart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="p-6">
            {total === 0 ? (
              <div className="text-center py-12">
                <MdPoll className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No votes yet</h3>
                <p className="text-gray-500">Be the first to vote in this poll!</p>
              </div>
            ) : chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="votes" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="votes"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detailed Results Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <MdBarChart className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800">Detailed Results</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Option
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Votes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((item, index) => {
                  const isWinner = item.votes === maxVotes && maxVotes > 0;
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                          {isWinner && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              <FaMedal className="w-3 h-3" />
                              <span>Leading</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MdHowToVote className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{item.votes}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 max-w-32">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${item.percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 min-w-12">
                            {item.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isWinner ? (
                          <span className="inline-flex items-center space-x-1 text-green-600">
                            <MdEmojiEvents className="w-4 h-4" />
                            <span className="text-sm font-medium">Winner</span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
          >
            <MdArrowBack className="w-5 h-5" />
            <span>Back to Polls</span>
          </button>
          <button
            onClick={() => navigate(`/polls/${id}`)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <MdHowToVote className="w-5 h-5" />
            <span>View Poll</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PollResults;