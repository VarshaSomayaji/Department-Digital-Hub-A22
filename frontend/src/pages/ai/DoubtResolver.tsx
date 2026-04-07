import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { askDoubt } from '../../services/ai';
import toast from 'react-hot-toast';

const DoubtResolver: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(''); // optional context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    setLoading(true);
    setAnswer('');
    try {
      const result = await askDoubt(question, context || undefined);
      setAnswer(result);
    } catch (error) {
      toast.error('Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">AI Doubt Resolver</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Explain the concept of closures in JavaScript..."
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Context (optional)</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any relevant context or notes..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Providing context helps the AI give more accurate answers.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Thinking...' : 'Ask AI'}
            </button>
          </form>

          {answer && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h2 className="font-bold mb-2">Answer:</h2>
              <div className="prose max-w-none whitespace-pre-wrap">{answer}</div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoubtResolver;