import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createMarks, getMarksById, updateMarks } from '../../services/marks';
import { getStudentsByBatch } from '../../services/student';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdSave, 
  MdCancel, 
  MdEdit, 
  MdAdd,
  MdSchool,
  MdSubject,
  MdClass,
  MdGrade,
  MdPeople,
  MdWarning,
  MdInfo,
  MdCheckCircle,
  MdTrendingUp
} from 'react-icons/md';
import { FaGraduationCap, FaUserGraduate } from 'react-icons/fa';

interface Student {
  _id: string;
  name: string;
  rollNo: string;
}

const MarksForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [examName, setExamName] = useState('');
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  // Fetch students when batch changes
  useEffect(() => {
    if (!batch) {
      setStudents([]);
      setMarks({});
      return;
    }
    const fetchStudents = async () => {
      setFetching(true);
      try {
        const data = await getStudentsByBatch(batch);
        setStudents(data);
        // Initialize marks (empty, or existing if editing)
        if (!isEditing) {
          const initial: Record<string, number> = {};
          data.forEach((s: Student) => { initial[s._id] = 0; });
          setMarks(initial);
        }
      } catch (error) {
        toast.error('Failed to load students');
      } finally {
        setFetching(false);
      }
    };
    fetchStudents();
  }, [batch]);

  // If editing, fetch existing marks entry
  useEffect(() => {
    if (isEditing) {
      const fetchMarks = async () => {
        try {
          const data = await getMarksById(id!);
          setExamName(data.examName);
          setSubject(data.subject);
          setBatch(data.batch);
          setMaxMarks(data.maxMarks);
          // Map marks to student IDs
          const marksMap: Record<string, number> = {};
          data.marksObtained.forEach(m => {
            marksMap[m.student._id] = m.marks;
          });
          setMarks(marksMap);
        } catch (error) {
          toast.error('Failed to load marks entry');
          navigate('/marks');
        }
      };
      fetchMarks();
    }
  }, [id, isEditing, navigate]);

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleMarksChange = (studentId: string, value: string) => {
    const num = parseInt(value) || 0;
    if (num > maxMarks) {
      toast.error(`Marks cannot exceed ${maxMarks}`);
      return;
    }
    if (num < 0) {
      toast.error('Marks cannot be negative');
      return;
    }
    setMarks(prev => ({ ...prev, [studentId]: num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !subject || !batch || !maxMarks) {
      toast.error('Please fill all fields');
      return;
    }
    if (students.length === 0) {
      toast.error('No students in this batch');
      return;
    }

    // Validate all marks are entered
    const missingMarks = students.filter(s => marks[s._id] === undefined || marks[s._id] === null);
    if (missingMarks.length > 0) {
      toast.error(`Please enter marks for all ${students.length} students`);
      return;
    }

    const marksObtained = Object.entries(marks).map(([studentId, marksValue]) => ({
      student: studentId,
      marks: marksValue,
    }));

    setLoading(true);
    try {
      if (isEditing) {
        await updateMarks(id!, { examName, subject, batch, maxMarks, marksObtained });
        toast.success('Marks updated successfully');
      } else {
        await createMarks({ examName, subject, batch, maxMarks, marksObtained });
        toast.success('Marks saved successfully');
      }
      navigate('/marks');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || (isEditing ? 'Update failed' : 'Save failed'));
    } finally {
      setLoading(false);
    }
  };

  const getAverageMarks = () => {
    const marksValues = Object.values(marks).filter(m => m !== undefined && m !== null);
    if (marksValues.length === 0) return 0;
    const total = marksValues.reduce((sum, m) => sum + m, 0);
    return (total / marksValues.length).toFixed(1);
  };

  const getPassCount = () => {
    const passingMarks = maxMarks * 0.4; // 40% passing
    const marksValues = Object.values(marks).filter(m => m !== undefined && m !== null);
    return marksValues.filter(m => m >= passingMarks).length;
  };

  const getFailCount = () => {
    const passingMarks = maxMarks * 0.4;
    const marksValues = Object.values(marks).filter(m => m !== undefined && m !== null);
    return marksValues.filter(m => m < passingMarks).length;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-3 bg-gradient-to-r ${
              isEditing ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-indigo-500'
            } rounded-xl shadow-lg`}>
              {isEditing ? <MdEdit className="w-6 h-6 text-white" /> : <MdAdd className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isEditing ? 'Edit Marks Entry' : 'Enter Marks'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update student marks' : 'Record marks for an assessment'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.examName ? 'transform scale-[1.02]' : ''}`}>
                  <MdSchool className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.examName ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    onFocus={() => handleFocus('examName')}
                    onBlur={() => handleBlur('examName')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Midterm Exam"
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Max Marks <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.maxMarks ? 'transform scale-[1.02]' : ''}`}>
                  <MdGrade className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.maxMarks ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="number"
                    min="1"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                    onFocus={() => handleFocus('maxMarks')}
                    onBlur={() => handleBlur('maxMarks')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Student List Section */}
            {batch && (
              <>
                {fetching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading students...</p>
                    </div>
                  </div>
                ) : students.length > 0 ? (
                  <>
                    {/* Statistics Bar */}
                    <div className="flex flex-wrap gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <MdPeople className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Total: {students.length}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdTrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Average: {getAverageMarks()}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdCheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          Pass: {getPassCount()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdWarning className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium text-red-600">
                          Fail: {getFailCount()}
                        </span>
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
                                Marks (out of {maxMarks})
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => {
                              const currentMarks = marks[student._id] || 0;
                              const percentage = (currentMarks / maxMarks) * 100;
                              return (
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
                                    <div className="flex items-center space-x-3">
                                      <input
                                        type="number"
                                        min="0"
                                        max={maxMarks}
                                        value={currentMarks}
                                        onChange={(e) => handleMarksChange(student._id, e.target.value)}
                                        className={`w-24 px-3 py-1.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                          percentage >= 60 ? 'border-green-300 focus:border-green-500' :
                                          percentage >= 40 ? 'border-yellow-300 focus:border-yellow-500' :
                                          'border-red-300 focus:border-red-500'
                                        }`}
                                      />
                                      <span className="text-xs text-gray-500">
                                        {percentage.toFixed(0)}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
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
                    <p className="text-sm font-medium text-blue-800">How to enter marks:</p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• Enter exam details first (Exam Name, Subject, Batch)</li>
                      <li>• Students will load automatically for the selected batch</li>
                      <li>• Enter marks for each student (0 to max marks)</li>
                      <li>• Click Save Marks to record the data</li>
                      <li>• Average and pass/fail statistics will update automatically</li>
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
                  <span>Save Marks</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/marks')}
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

export default MarksForm;