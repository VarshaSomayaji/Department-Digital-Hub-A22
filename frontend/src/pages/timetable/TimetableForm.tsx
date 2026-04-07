import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createTimetable, getTimetableById, updateTimetable } from '../../services/timetable';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getFaculty } from '../../services/faculty';
import { 
  MdAdd, 
  MdDelete, 
  MdSave, 
  MdCancel, 
  MdEdit, 
  MdSchedule,
  MdClass,
  MdCalendarToday,
  MdSubject,
  MdPerson,
  MdAccessTime,
  MdInfo,
  MdWarning
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher,
  FaClock
} from 'react-icons/fa';

interface Faculty {
  _id: string;
  name: string;
  email?: string;
  department?: string;
}

const TimetableForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [batch, setBatch] = useState('');
  const [day, setDay] = useState('Monday');
  const [periods, setPeriods] = useState<any[]>([
    { periodNumber: 1, subject: '', faculty: '', startTime: '09:00', endTime: '10:00' },
  ]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Fetch faculties for dropdown
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const data = await getFaculty();
        setFaculties(data);
      } catch (error) {
        toast.error('Failed to load faculty list');
      }
    };
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (isEditing) {
      const fetchTimetable = async () => {
        try {
          const data = await getTimetableById(id!);
          setBatch(data.batch);
          setDay(data.day);
          setPeriods(data.periods.map(p => ({
            periodNumber: p.periodNumber,
            subject: p.subject,
            faculty: p.faculty._id,
            startTime: p.startTime,
            endTime: p.endTime,
          })));
        } catch (error) {
          toast.error('Failed to load timetable');
          navigate('/timetable');
        }
      };
      fetchTimetable();
    }
  }, [id, isEditing, navigate]);

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const addPeriod = () => {
    if (periods.length >= 10) {
      toast.error('Maximum 10 periods allowed');
      return;
    }
    setPeriods([
      ...periods,
      { periodNumber: periods.length + 1, subject: '', faculty: '', startTime: '09:00', endTime: '10:00' },
    ]);
    toast.success('Period added');
  };

  const removePeriod = (index: number) => {
    if (periods.length <= 1) {
      toast.error('At least one period is required');
      return;
    }
    const updated = periods.filter((_, i) => i !== index);
    // Renumber periods
    updated.forEach((p, idx) => { p.periodNumber = idx + 1; });
    setPeriods(updated);
    toast.success('Period removed');
  };

  const handlePeriodChange = (index: number, field: string, value: any) => {
    const updated = [...periods];
    updated[index][field] = value;
    setPeriods(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batch.trim()) {
      toast.error('Batch is required');
      return;
    }
    if (!day) {
      toast.error('Day is required');
      return;
    }
    
    // Validate periods
    for (let i = 0; i < periods.length; i++) {
      const p = periods[i];
      if (!p.subject.trim()) {
        toast.error(`Period ${i+1} subject is missing`);
        return;
      }
      if (!p.faculty) {
        toast.error(`Period ${i+1} faculty is not selected`);
        return;
      }
      if (!p.startTime) {
        toast.error(`Period ${i+1} start time is missing`);
        return;
      }
      if (!p.endTime) {
        toast.error(`Period ${i+1} end time is missing`);
        return;
      }
      if (p.startTime >= p.endTime) {
        toast.error(`Period ${i+1}: Start time must be before end time`);
        return;
      }
    }

    // Check for overlapping time slots
    for (let i = 0; i < periods.length; i++) {
      for (let j = i + 1; j < periods.length; j++) {
        if (periods[i].startTime < periods[j].endTime && periods[j].startTime < periods[i].endTime) {
          toast.error(`Periods ${i+1} and ${j+1} have overlapping time slots`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const timetableData = {
        batch: batch.trim(),
        day,
        periods: periods.map(p => ({
          periodNumber: p.periodNumber,
          subject: p.subject.trim(),
          faculty: p.faculty,
          startTime: p.startTime,
          endTime: p.endTime,
        })),
      };
      
      if (isEditing) {
        await updateTimetable(id!, timetableData);
        toast.success('Timetable updated successfully');
      } else {
        await createTimetable(timetableData);
        toast.success('Timetable created successfully');
      }
      navigate('/timetable');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || (isEditing ? 'Update failed' : 'Creation failed'));
    } finally {
      setLoading(false);
    }
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
              {isEditing ? <MdEdit className="w-6 h-6 text-white" /> : <MdSchedule className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isEditing ? 'Edit Timetable' : 'Create Timetable'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update class schedule' : 'Set up a new class schedule'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Day <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.day ? 'transform scale-[1.02]' : ''}`}>
                  <MdCalendarToday className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.day ? 'text-blue-500' : 'text-gray-400'}`} />
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    onFocus={() => handleFocus('day')}
                    onBlur={() => handleBlur('day')}
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Periods Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FaClock className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Periods</h2>
                  <span className="text-sm text-gray-500">({periods.length} periods)</span>
                </div>
                <button
                  type="button"
                  onClick={addPeriod}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                >
                  <MdAdd className="w-5 h-5" />
                  <span>Add Period</span>
                </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {periods.map((period, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{period.periodNumber}</span>
                        </div>
                        <span className="font-medium text-gray-700">Period {period.periodNumber}</span>
                      </div>
                      {periods.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePeriod(idx)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <MdDelete className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          <MdSubject className="inline w-3 h-3 mr-1" />
                          Subject
                        </label>
                        <input
                          type="text"
                          value={period.subject}
                          onChange={(e) => handlePeriodChange(idx, 'subject', e.target.value)}
                          placeholder="e.g., Mathematics"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          <FaChalkboardTeacher className="inline w-3 h-3 mr-1" />
                          Faculty
                        </label>
                        <select
                          value={period.faculty}
                          onChange={(e) => handlePeriodChange(idx, 'faculty', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          <MdAccessTime className="inline w-3 h-3 mr-1" />
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={period.startTime}
                          onChange={(e) => handlePeriodChange(idx, 'startTime', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          <MdAccessTime className="inline w-3 h-3 mr-1" />
                          End Time
                        </label>
                        <input
                          type="time"
                          value={period.endTime}
                          onChange={(e) => handlePeriodChange(idx, 'endTime', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <MdInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Tips for creating timetable:</p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>• Each batch can have one timetable per day</li>
                    <li>• Ensure time slots don't overlap</li>
                    <li>• Maximum 10 periods allowed per day</li>
                    <li>• Select faculty from the dropdown list</li>
                    <li>• Verify all periods have subjects and faculty assigned</li>
                  </ul>
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
                  <span>Save Timetable</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/timetable')}
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

export default TimetableForm;