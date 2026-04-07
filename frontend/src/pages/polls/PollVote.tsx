import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPollById, votePoll } from '../../services/poll';
import { Poll } from '../../types/poll';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';

const PollVote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const data = await getPollById(id!);
        setPoll(data);
        // If user already voted, redirect to results
        const hasVoted = data.responses.some((r) => r.user.id === user?._id);
        if (hasVoted) {
          toast('You have already voted', { icon: 'ℹ️' });
          navigate(`/polls/${id}/results`);
        }
      } catch (error) {
        toast.error('Poll not found');
        navigate('/polls');
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [id, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedOption) {
    toast.error('Please select an option');
    return;
  }
  setSubmitting(true);
  try {
    
    await votePoll(id!, selectedOption);
    toast.success('Vote recorded');
    navigate(`/polls/${id}/results`);
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Vote failed');
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  if (!poll) return null;

  const expired = new Date(poll.expiresAt) < new Date();
  if (expired) {
    return (
      <DashboardLayout>
        <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4">{poll.question}</h2>
          <p className="text-red-600">This poll has expired.</p>
          <button
            onClick={() => navigate(`/polls/${id}/results`)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            View Results
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">{poll.question}</h1>
        <p className="text-sm text-gray-600 mb-4">
          Expires: {new Date(poll.expiresAt).toLocaleString()}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 mb-4">
            {poll.options.map((opt, idx) => (
              <label key={idx} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                <input
                  type="radio"
                  name="pollOption"
                  value={opt}
                  checked={selectedOption === opt}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="form-radio"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/polls')}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PollVote;