import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuizResult as ResultType } from '../../types/quiz';
import DashboardLayout from '../../layouts/DashboardLayout';

const QuizResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as ResultType;

  if (!result) {
    navigate('/quizzes/student');
    return null;
  }

  const percentage = result.percentage; // already a number
  const passed = percentage >= 40;      // numeric comparison

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz Result</h1>
        <div className="text-6xl mb-4">{passed ? '🎉' : '😞'}</div>
        <p className="text-xl mb-2">
          You scored <span className="font-bold">{result.score}</span> out of {result.total}
        </p>
        <p className="text-lg mb-6">
          Percentage: <span className="font-bold">{percentage.toFixed(1)}%</span>
        </p>
        <p className="mb-6">
          {passed ? 'Congratulations! You passed.' : 'Better luck next time.'}
        </p>
        <button
          onClick={() => navigate('/quizzes/student')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Back to Quizzes
        </button>
      </div>
    </DashboardLayout>
  );
};

export default QuizResult;