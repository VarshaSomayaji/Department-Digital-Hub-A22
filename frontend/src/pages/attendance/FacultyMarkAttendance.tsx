import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createAttendance } from '../../services/attendance';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getStudentsByBatch } from '../../services/student';
import { 
  MdDateRange, 
  MdSubject, 
  MdClass, 
  MdSave, 
  MdCancel,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdSchedule,
  MdPeople,
  MdInfo,
  MdWarning
} from 'react-icons/md';
import { FaGraduationCap, FaUserGraduate } from 'react-icons/fa';

interface Student {
  _id: string;
  name: string;
  rollNo: string;
}

const FacultyMarkAttendance: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  // Fetch students when batch changes
  useEffect(() => {
    if (!batch) {
      setStudents([]);
      setAttendance({});
      return;
    }
    const fetchStudents = async () => {
      setFetchingStudents(true);
      try {
        const data = await getStudentsByBatch(batch);
        setStudents(data);
        // Initialize attendance status (default 'Absent')
        const initial: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        data.forEach((s: Student) => { initial[s._id] = 'Absent'; });
        setAttendance(initial);
      } catch (error) {
        toast.error('Failed to load students for this batch');
      } finally {
        setFetchingStudents(false);
      }
    };
    fetchStudents();
  }, [batch]);

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !subject || !batch) {
      toast.error('Please fill all fields');
      return;
    }
    if (students.length === 0) {
      toast.error('No students in this batch');
      return;
    }

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student: studentId,
      status,
    }));

    setLoading(true);
    try {
      await createAttendance({
        date,
        subject,
        batch,
        records,
      });
      toast.success('Attendance saved successfully');
      navigate('/attendance');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  // Bulk actions
  const markAllPresent = () => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    students.forEach(s => { updated[s._id] = 'Present'; });
    setAttendance(updated);
    toast.success('All students marked as Present');
  };

  const markAllAbsent = () => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    students.forEach(s => { updated[s._id] = 'Absent'; });
    setAttendance(updated);
    toast.success('All students marked as Absent');
  };

  const getStatusCounts = () => {
    const counts = { Present: 0, Absent: 0, Late: 0 };
    Object.values(attendance).forEach(status => {
      counts[status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const presentCount = statusCounts.Present;
  const absentCount = statusCounts.Absent;
  const lateCount = statusCounts.Late;

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <MdSchedule className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Mark Attendance
              </h1>
              <p className="text-gray-600 mt-1">
                Record student attendance for your class
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.date ? 'transform scale-[1.02]' : ''}`}>
                  <MdDateRange className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.date ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onFocus={() => handleFocus('date')}
                    onBlur={() => handleBlur('date')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.subject ? 'transform scale-[1.02]' : ''}`}>
                  <MdSubject className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.subject ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onFocus={() => handleFocus('subject')}
                    onBlur={() => handleBlur('subject')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>

              {/* Batch Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Batch <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.batch ? 'transform scale-[1.02]' : ''}`}>
                  <FaGraduationCap className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.batch ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    onFocus={() => handleFocus('batch')}
                    onBlur={() => handleBlur('batch')}
                    required
                    placeholder="e.g., 2024"
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Student List Section */}
            {batch && (
              <>
                {fetchingStudents ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading students...</p>
                    </div>
                  </div>
                ) : students.length > 0 ? (
                  <>
                    {/* Statistics and Bulk Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MdPeople className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Total: {students.length}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MdCheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            Present: {presentCount}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MdCancel className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium text-red-600">
                            Absent: {absentCount}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MdSchedule className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600">
                            Late: {lateCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={markAllPresent}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <MdCheckCircle className="w-4 h-4" />
                          <span>All Present</span>
                        </button>
                        <button
                          type="button"
                          onClick={markAllAbsent}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <MdCancel className="w-4 h-4" />
                          <span>All Absent</span>
                        </button>
                      </div>
                    </div>

                    {/* Student Table */}
                    <div className="border rounded-xl overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Roll No
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Student Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                              <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <FaUserGraduate className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {student.rollNo}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm text-gray-700">{student.name}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <select
                                    value={attendance[student._id] || 'Absent'}
                                    onChange={(e) => handleStatusChange(student._id, e.target.value as any)}
                                    className={`px-3 py-1.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                      attendance[student._id] === 'Present'
                                        ? 'border-green-300 bg-green-50 text-green-700'
                                        : attendance[student._id] === 'Late'
                                        ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                                        : 'border-red-300 bg-red-50 text-red-700'
                                    }`}
                                  >
                                    <option value="Present" className="text-green-700">✓ Present</option>
                                    <option value="Absent" className="text-red-700">✗ Absent</option>
                                    <option value="Late" className="text-yellow-700">⏰ Late</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <MdWarning className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-yellow-800 font-medium">No students found</p>
                        <p className="text-yellow-700 text-sm">No students are registered for batch {batch}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Help Text */}
            {!batch && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <MdInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">How to mark attendance:</p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• Enter the date, subject, and batch details</li>
                      <li>• Students will load automatically for the selected batch</li>
                      <li>• Use bulk actions to mark all students at once</li>
                      <li>• Individual status can be adjusted using the dropdown</li>
                      <li>• Click Save Attendance to record the data</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t flex space-x-3">
            <button
              type="submit"
              disabled={loading || students.length === 0}
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
                  <span>Save Attendance</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/attendance')}
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

export default FacultyMarkAttendance;