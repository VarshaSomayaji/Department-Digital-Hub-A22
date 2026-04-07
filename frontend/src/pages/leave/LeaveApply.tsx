import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLeaveRequest } from '../../services/leave';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdDateRange, 
  MdDescription, 
  MdSend, 
  MdCancel,
  MdCalendarToday,
  MdInfo,
  MdWarning,
  MdCheckCircle,
  MdSchedule
} from 'react-icons/md';
import { 
  FaCalendarAlt, 
  FaHourglassHalf,
  FaClipboardList
} from 'react-icons/fa';

const LeaveApply: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason for leave');
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      toast.error('Start date cannot be in the past');
      return;
    }
    if (end < start) {
      toast.error('End date must be after start date');
      return;
    }
    
    setLoading(true);
    try {
      await createLeaveRequest({ startDate, endDate, reason: reason.trim() });
      toast.success('Leave request submitted successfully');
      navigate('/leave');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return null;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  const duration = calculateDuration();
  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <FaClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Apply for Leave
              </h1>
              <p className="text-gray-600 mt-1">
                Submit a leave request for approval
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.startDate ? 'transform scale-[1.02]' : ''}`}>
                  <FaCalendarAlt className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.startDate ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onFocus={() => handleFocus('startDate')}
                    onBlur={() => handleBlur('startDate')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.endDate ? 'transform scale-[1.02]' : ''}`}>
                  <FaCalendarAlt className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.endDate ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onFocus={() => handleFocus('endDate')}
                    onBlur={() => handleBlur('endDate')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Duration Preview */}
            {duration && startDateObj && endDateObj && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <FaHourglassHalf className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Leave Duration</p>
                    <p className="text-lg font-semibold text-blue-600">{duration}</p>
                    <p className="text-xs text-gray-500">
                      {startDateObj.toLocaleDateString()} - {endDateObj.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reason Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Leave <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.reason ? 'transform scale-[1.02]' : ''}`}>
                <MdDescription className={`absolute left-3 top-4 w-5 h-5 transition-colors duration-200 ${focusedFields.reason ? 'text-blue-500' : 'text-gray-400'}`} />
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onFocus={() => handleFocus('reason')}
                  onBlur={() => handleBlur('reason')}
                  required
                  rows={5}
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Please provide a detailed reason for your leave request..."
                />
              </div>
              <p className="text-xs text-gray-500">
                Be specific about the reason for better approval chances
              </p>
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
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <MdSend className="w-5 h-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/leave')}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
            >
              <MdCancel className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <MdInfo className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Leave Application Guidelines:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Submit leave requests at least 2 days in advance</li>
                <li>• Provide a clear and valid reason for the leave</li>
                <li>• Leave requests will be reviewed by your HOD/Faculty</li>
                <li>• You will receive notification once your request is processed</li>
                <li>• Medical leave requires a medical certificate upon return</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-start space-x-3">
            <MdWarning className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Important Notes:</p>
              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                <li>• Maximum 5 consecutive leave days without special approval</li>
                <li>• Attendance below 75% may affect exam eligibility</li>
                <li>• Unauthorized absence will be marked as absent</li>
                <li>• Cancellation is only possible before approval</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {(startDate || endDate || reason) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <MdCheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-700">Request Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {startDate && (
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <p className="font-medium text-gray-800">{new Date(startDate).toLocaleDateString()}</p>
                </div>
              )}
              {endDate && (
                <div>
                  <span className="text-gray-500">End Date:</span>
                  <p className="font-medium text-gray-800">{new Date(endDate).toLocaleDateString()}</p>
                </div>
              )}
              {duration && (
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium text-gray-800">{duration}</p>
                </div>
              )}
              {reason && (
                <div className="md:col-span-2">
                  <span className="text-gray-500">Reason:</span>
                  <p className="font-medium text-gray-800 mt-1">{reason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeaveApply;