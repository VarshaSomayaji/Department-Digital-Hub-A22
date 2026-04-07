import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizResults } from "../../services/quiz";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";

const QuizResultsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getQuizResults(id!);
        setTotalQuestions(data.totalQuestions);
        setResults(data.results);
      } catch (error) {
        toast.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Quiz Results</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Student Name</th>
                <th className="px-4 py-2 text-left">Roll No</th>
                <th className="px-4 py-2 text-left">Score</th>
                <th className="px-4 py-2 text-left">Percentage</th>
                <th className="px-4 py-2 text-left">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => {
                const percentage = totalQuestions
                  ? ((r.score / totalQuestions) * 100).toFixed(1)
                  : "0";
                return (
                  <tr key={idx}>
                    <td>{r.student.name}</td>
                    <td>{r.student.rollNo || "-"}</td>
                    <td>{r.score}</td>
                    <td>{percentage}%</td>
                    <td>{new Date(r.submittedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default QuizResultsView;
