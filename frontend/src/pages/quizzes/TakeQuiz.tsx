import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, submitQuiz } from '../../services/quiz';
import { Quiz } from '../../types/quiz';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<number | null>(null); // Correct type for browser

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await getQuizById(id!);
        setQuiz(data);
        // Calculate end time based on startTime + duration
        const endTime = new Date(data.endTime).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);
      } catch (error) {
        toast.error('Quiz not found or not available');
        navigate('/quizzes/student');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    // Clear any existing timer before setting a new one
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft]);

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    // Clear timer to prevent further countdown
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      // Convert answers object to array
      const answersArray = Object.entries(answers).map(([qIdx, optIdx]) => ({
        questionIndex: parseInt(qIdx),
        selectedOption: optIdx,
      }));
      const result = await submitQuiz(id!, answersArray);
      navigate(`/quizzes/result/${id}`, { state: result });
    } catch (error) {
      toast.error('Submission failed');
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><p>Loading quiz...</p></DashboardLayout>;
  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="text-lg font-mono bg-gray-100 px-4 py-2 rounded">
            Time left: {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Question {currentQuestion + 1} of {totalQuestions} • Answered {answeredCount}/{totalQuestions}
        </p>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">{question.question}</h3>
          <div className="space-y-2">
            {question.options.map((opt, optIndex) => (
              <label key={optIndex} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                <input
                  type="radio"
                  name={`q${currentQuestion}`}
                  checked={answers[currentQuestion] === optIndex}
                  onChange={() => handleAnswerChange(currentQuestion, optIndex)}
                  className="form-radio"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentQuestion === totalQuestions - 1}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TakeQuiz;