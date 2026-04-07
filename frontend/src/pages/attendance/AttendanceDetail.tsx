import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAttendanceById } from '../../services/attendance';
import { Attendance } from '../../types/attendance';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';

const AttendanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await getAttendanceById(id!);
        setAttendance(data);
      } catch (error) {
        toast.error('Attendance record not found');
        navigate('/attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [id, navigate]);

  if (loading) return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  if (!attendance) return null;

  const canEdit = user && (user.role === 'FACULTY' || user.role === 'HOD' || user.role === 'ADMIN');

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">Attendance Details</h1>
          {canEdit && (
            <Link
              to={`/attendance/${id}/edit`}
              className="text-green-600 hover:text-green-900"
            >
              Edit
            </Link>
          )}
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <p><strong>Date:</strong> {new Date(attendance.date).toLocaleDateString()}</p>
          <p><strong>Subject:</strong> {attendance.subject}</p>
          <p><strong>Batch:</strong> {attendance.batch}</p>
          <p><strong>Faculty:</strong> {attendance.faculty.name}</p>
        </div>
        <h2 className="font-semibold mb-2">Student Records</h2>
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Roll No</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.records.map((record, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{record.student.rollNo}</td>
                <td className="px-4 py-2">{record.student.name}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    record.status === 'Present' ? 'bg-green-100 text-green-800' :
                    record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6">
          <button
            onClick={() => navigate('/attendance')}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Back to List
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceDetail;