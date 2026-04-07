import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentMarks } from '../../services/marks';
import { Marks } from '../../types/marks';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';

const StudentMarksView: React.FC = () => {
  const { user } = useAuth();
  const [marksEntries, setMarksEntries] = useState<Marks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchMarks = async () => {
      try {
        const studentBatch = (user as any).batch || '';
        const data = await getStudentMarks(studentBatch, user._id);
        setMarksEntries(data);
      } catch (error) {
        toast.error('Failed to load marks');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">My Marks</h1>
      {loading ? (
        <p>Loading...</p>
      ) : marksEntries.length === 0 ? (
        <p>No marks entries found.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Exam</th>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Marks Obtained</th>
                <th className="px-4 py-2 text-left">Max Marks</th>
                <th className="px-4 py-2 text-left">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {marksEntries.map((entry) => {
                const myMarks = entry.marksObtained[0]?.marks || 0;
                const percentage = ((myMarks / entry.maxMarks) * 100).toFixed(1);
                return (
                  <tr key={entry._id} className="border-t">
                    <td className="px-4 py-2">{entry.examName}</td>
                    <td className="px-4 py-2">{entry.subject}</td>
                    <td className="px-4 py-2">{myMarks}</td>
                    <td className="px-4 py-2">{entry.maxMarks}</td>
                    <td className="px-4 py-2">{percentage}%</td>
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

export default StudentMarksView;