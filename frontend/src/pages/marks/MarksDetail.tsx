import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { deleteMarks, getMarksById } from '../../services/marks';
import { Marks } from '../../types/marks';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';

const MarksDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [marks, setMarks] = useState<Marks | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const data = await getMarksById(id!);
        setMarks(data);
      } catch (error) {
        toast.error('Marks entry not found');
        navigate('/marks');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this marks entry?')) return;
    try {
      await deleteMarks(id!);
      toast.success('Marks entry deleted');
      navigate('/marks');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const canEditDelete = user && (user.role === 'FACULTY' || user.role === 'ADMIN' || user.role === 'HOD');

  if (loading) return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  if (!marks) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">Marks Details</h1>
          {canEditDelete && (
            <div className="space-x-2">
              <Link
                to={`/marks/${id}/edit`}
                className="text-green-600 hover:text-green-900"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Exam Name</p>
            <p className="font-medium">{marks.examName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Subject</p>
            <p className="font-medium">{marks.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Batch</p>
            <p className="font-medium">{marks.batch}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Max Marks</p>
            <p className="font-medium">{marks.maxMarks}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Faculty</p>
            <p className="font-medium">{marks.faculty.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{new Date(marks.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Student Scores</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Roll No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Marks Obtained</th>
                <th className="px-4 py-2 text-left">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {marks.marksObtained.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{item.student.rollNo}</td>
                  <td className="px-4 py-2">{item.student.name}</td>
                  <td className="px-4 py-2">{item.marks}</td>
                  <td className="px-4 py-2">
                    {((item.marks / marks.maxMarks) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate('/marks')}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Back to Marks List
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MarksDetail;