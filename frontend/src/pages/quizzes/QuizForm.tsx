import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createQuiz, getQuizById, updateQuiz } from '../../services/quiz';
import { Question } from '../../types/quiz';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdAdd, 
  MdDelete, 
  MdSave, 
  MdCancel,
  MdQuiz,
  MdSubject,
  MdClass,
  MdTimeline,
  MdSchedule,
  MdDescription,
  MdEdit,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdWarning,
  MdInfo
} from 'react-icons/md';
import { FaGraduationCap, FaQuestionCircle } from 'react-icons/fa';

const QuizForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', ''], correctOption: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  useEffect(() => {
    if (isEditing) {
      const fetchQuiz = async () => {
        try {
          const data = await getQuizById(id!);
          setTitle(data.title);
          setDescription(data.description || '');
          setSubject(data.subject);
          setBatch(data.batch);
          setDuration(data.duration);
          setStartTime(data.startTime.slice(0, 16));
          setEndTime(data.endTime.slice(0, 16));
          setQuestions(data.questions);
        } catch (error) {
          toast.error('Failed to load quiz');
          navigate('/quizzes');
        }
      };
      fetchQuiz();
    }
  }, [id, isEditing, navigate]);

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    if (field === 'options') {
      updated[index].options = value;
    } else if (field === 'correctOption') {
      updated[index].correctOption = parseInt(value);
    } else {
      updated[index][field] = value;
    }
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], correctOption: 0 }]);
    setActiveQuestion(questions.length);
    toast.success('New question added');
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('At least one question is required');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
    toast.success('Question removed');
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
    toast.success('Option added');
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 2) {
      toast.error('At least two options are required');
      return;
    }
    updated[qIndex].options.splice(optIndex, 1);
    if (updated[qIndex].correctOption === optIndex) {
      updated[qIndex].correctOption = 0;
    } else if (updated[qIndex].correctOption > optIndex) {
      updated[qIndex].correctOption -= 1;
    }
    setQuestions(updated);
    toast.success('Option removed');
  };

  const validateForm = () => {
    if (!title || !subject || !batch || !duration || !startTime || !endTime) {
      toast.error('All fields except description are required');
      return false;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('End time must be after start time');
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i+1} text is empty`);
        return false;
      }
      if (q.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i+1} has empty option`);
        return false;
      }
      if (q.correctOption < 0 || q.correctOption >= q.options.length) {
        toast.error(`Question ${i+1} correct option index out of range`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const quizData = {
      title,
      description: description || undefined,
      subject,
      batch,
      duration,
      startTime,
      endTime,
      questions,
    };

    setLoading(true);
    try {
      if (isEditing) {
        await updateQuiz(id!, quizData);
        toast.success('Quiz updated successfully');
      } else {
        await createQuiz(quizData);
        toast.success('Quiz created successfully');
      }
      navigate('/quizzes');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || (isEditing ? 'Update failed' : 'Creation failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-3 bg-gradient-to-r ${
              isEditing ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-indigo-500'
            } rounded-xl shadow-lg`}>
              {isEditing ? <MdEdit className="w-6 h-6 text-white" /> : <MdQuiz className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update quiz details and questions' : 'Design an assessment for your students'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <MdInfo className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Quiz Details</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedFields.title ? 'transform scale-[1.02]' : ''}`}>
                    <MdQuiz className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.title ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onFocus={() => handleFocus('title')}
                      onBlur={() => handleBlur('title')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter quiz title"
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
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedFields.duration ? 'transform scale-[1.02]' : ''}`}>
                    <MdTimeline className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.duration ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      onFocus={() => handleFocus('duration')}
                      onBlur={() => handleBlur('duration')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedFields.startTime ? 'transform scale-[1.02]' : ''}`}>
                    <MdSchedule className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.startTime ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      onFocus={() => handleFocus('startTime')}
                      onBlur={() => handleBlur('startTime')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedFields.endTime ? 'transform scale-[1.02]' : ''}`}>
                    <MdSchedule className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.endTime ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      onFocus={() => handleFocus('endTime')}
                      onBlur={() => handleBlur('endTime')}
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                <div className={`relative transition-all duration-200 ${focusedFields.description ? 'transform scale-[1.02]' : ''}`}>
                  <MdDescription className={`absolute left-3 top-3 w-5 h-5 transition-colors duration-200 ${focusedFields.description ? 'text-blue-500' : 'text-gray-400'}`} />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => handleFocus('description')}
                    onBlur={() => handleBlur('description')}
                    rows={3}
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Provide additional information about the quiz..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <FaQuestionCircle className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
                  <span className="text-sm text-gray-500">({questions.length})</span>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                >
                  <MdAdd className="w-5 h-5" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className={`border-2 rounded-xl p-5 transition-all duration-200 ${
                    activeQuestion === qIndex ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveQuestion(qIndex)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{qIndex + 1}</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">Question</h3>
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  {/* Options */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder={`Option ${optIndex + 1}`}
                              required
                            />
                          </div>
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, optIndex)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <MdDelete className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <MdAdd className="w-4 h-4" />
                      <span>Add Option</span>
                    </button>
                  </div>

                  {/* Correct Option Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Option</label>
                    <select
                      value={q.correctOption}
                      onChange={(e) => handleQuestionChange(qIndex, 'correctOption', e.target.value)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {q.options.map((_, idx) => (
                        <option key={idx} value={idx}>
                          Option {String.fromCharCode(65 + idx)} - {q.options[idx] || `Option ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pb-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <MdSave className="w-5 h-5" />
                  <span>Save Quiz</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/quizzes')}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
            >
              <MdCancel className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <MdWarning className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Tips for creating quizzes:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Each question must have at least 2 options</li>
                <li>• Select the correct option for each question</li>
                <li>• Set appropriate start and end times for the quiz</li>
                <li>• Duration should be reasonable for the number of questions</li>
                <li>• Add a description to provide context to students</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuizForm;