import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createPoll, getPollById, updatePoll } from '../../services/poll';
import { Role } from '../../types';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdDelete, 
  MdSave, 
  MdCancel,
  MdPoll,
  MdQuestionAnswer,
  MdDateRange,
  MdPeople,
  MdSchedule,
  MdEdit,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdWarning
} from 'react-icons/md';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaUserTie,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';

const PollForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [targetAudience, setTargetAudience] = useState<Role[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (isEditing) {
      const fetchPoll = async () => {
        try {
          const data = await getPollById(id!);
          setQuestion(data.question);
          setOptions(data.options);
          setTargetAudience(data.targetAudience);
          // Format date for input (YYYY-MM-DDTHH:mm)
          setExpiresAt(new Date(data.expiresAt).toISOString().slice(0, 16));
        } catch (error) {
          toast.error('Failed to load poll');
          navigate('/polls');
        }
      };
      fetchPoll();
    }
  }, [id, isEditing, navigate]);

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length >= 10) {
      toast.error('Maximum 10 options allowed');
      return;
    }
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error('At least two options are required');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleRoleToggle = (role: Role) => {
    if (targetAudience.includes(role)) {
      setTargetAudience(targetAudience.filter((r) => r !== role));
    } else {
      setTargetAudience([...targetAudience, role]);
    }
  };

  const getRoleIcon = (role: Role, size: string = "w-5 h-5") => {
    switch (role) {
      case 'STUDENT':
        return <FaGraduationCap className={`${size} text-green-600`} />;
      case 'FACULTY':
        return <FaChalkboardTeacher className={`${size} text-blue-600`} />;
      case 'HOD':
        return <FaUserTie className={`${size} text-purple-600`} />;
      case 'ADMIN':
        return <GiSettingsKnobs className={`${size} text-red-600`} />;
      default:
        return <MdPeople className={`${size} text-gray-600`} />;
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'STUDENT':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'FACULTY':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'HOD':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      case 'ADMIN':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getRoleTextColor = (role: Role) => {
    switch (role) {
      case 'STUDENT':
        return 'text-green-700';
      case 'FACULTY':
        return 'text-blue-700';
      case 'HOD':
        return 'text-purple-700';
      case 'ADMIN':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      toast.error('All options must be filled');
      return;
    }
    if (targetAudience.length === 0) {
      toast.error('Please select at least one target audience');
      return;
    }
    if (!expiresAt) {
      toast.error('Expiry date is required');
      return;
    }
    if (new Date(expiresAt) <= new Date()) {
      toast.error('Expiry date must be in the future');
      return;
    }

    const pollData = {
      question: question.trim(),
      options: options.map((opt) => opt.trim()),
      targetAudience,
      expiresAt: new Date(expiresAt).toISOString(),
    };

    setLoading(true);
    try {
      if (isEditing) {
        await updatePoll(id!, pollData);
        toast.success('Poll updated successfully');
      } else {
        await createPoll(pollData);
        toast.success('Poll created successfully');
      }
      navigate('/polls');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || (isEditing ? 'Update failed' : 'Creation failed'));
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: Role[] = ['ADMIN', 'HOD', 'FACULTY', 'STUDENT'];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-3 bg-gradient-to-r ${
              isEditing ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-indigo-500'
            } rounded-xl shadow-lg`}>
              {isEditing ? (
                <MdEdit className="w-6 h-6 text-white" />
              ) : (
                <MdPoll className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isEditing ? 'Edit Poll' : 'Create New Poll'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? 'Update your poll question and options' 
                  : 'Create a new poll to gather feedback'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Question Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Question <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.question ? 'transform scale-[1.02]' : ''}`}>
                <MdQuestionAnswer className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.question ? 'text-blue-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onFocus={() => handleFocus('question')}
                  onBlur={() => handleBlur('question')}
                  required
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="What would you like to ask?"
                />
              </div>
              <p className="text-xs text-gray-500">
                Ask a clear and concise question (max 200 characters)
              </p>
            </div>

            {/* Options Field */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Options <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">{options.length} options</span>
              </div>
              
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        {String.fromCharCode(65 + idx)}.
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        required
                        className="w-full pl-8 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    {idx >= 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove option"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Option</span>
              </button>
              
              <p className="text-xs text-gray-500">
                At least 2 options required. Maximum 10 options.
              </p>
            </div>

            {/* Target Audience Field */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {targetAudience.length} selected
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {roleOptions.map((role) => {
                  const isSelected = targetAudience.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleToggle(role)}
                      className={`relative p-3 border-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? `${getRoleColor(role)} border-current shadow-md scale-105`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(role, "w-5 h-5")}
                          <span className={`font-medium ${isSelected ? getRoleTextColor(role) : 'text-gray-700'}`}>
                            {role}
                          </span>
                        </div>
                        {isSelected ? (
                          <MdCheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <MdRadioButtonUnchecked className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <MdPeople className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {targetAudience.length === 0 
                    ? 'No audiences selected' 
                    : `Will be visible to ${targetAudience.length} audience type${targetAudience.length > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            {/* Expiry Date Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Expires At <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.expiresAt ? 'transform scale-[1.02]' : ''}`}>
                <MdSchedule className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.expiresAt ? 'text-blue-500' : 'text-gray-400'}`} />
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  onFocus={() => handleFocus('expiresAt')}
                  onBlur={() => handleBlur('expiresAt')}
                  required
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <p className="text-xs text-gray-500">
                The poll will automatically close after this date and time
              </p>
            </div>

            {/* Preview Section (Optional) */}
            {question && options.some(opt => opt.trim()) && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MdPoll className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">{question || 'Your question here'}</h4>
                  <div className="space-y-2">
                    {options.map((opt, idx) => opt.trim() && (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        <span className="text-sm text-gray-600">{opt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <MdDateRange className="w-3 h-3" />
                      <span>Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  <span>{isEditing ? 'Update Poll' : 'Create Poll'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/polls')}
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
            <MdWarning className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Tips for creating effective polls:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Keep questions clear and specific</li>
                <li>• Provide balanced and unbiased options</li>
                <li>• Select appropriate target audience</li>
                <li>• Set a reasonable expiry date</li>
                <li>• Minimum 2 options, maximum 10 options</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PollForm;