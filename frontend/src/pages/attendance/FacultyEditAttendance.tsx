import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAttendanceById, updateAttendance } from '../../services/attendance';
import { getStudentsByBatch } from '../../services/student';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';

const FacultyEditAttendance: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attendanceData = await getAttendanceById(id!);
        setDate(attendanceData.date.split('T')[0]);
        setSubject(attendanceData.subject);
        setBatch(attendanceData.batch);

        // Fetch students in this batch
        const studentsData = await getStudentsByBatch(attendanceData.batch);
        setStudents(studentsData);

        // Map existing attendance
        const statusMap: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        attendanceData.records.forEach(r => {
          statusMap[r.student._id] = r.status;
        });
        // Ensure all students have a status (default to Absent if missing)
        studentsData.forEach((s: any) => {
          if (!statusMap[s._id]) statusMap[s._id] = 'Absent';
        });
        setAttendance(statusMap);
      } catch (error) {
        toast.error('Failed to load attendance');
        navigate('/attendance');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student: studentId,
      status,
    }));

    setLoading(true);
    try {
      await updateAttendance(id!, { date, subject, batch, records });
      toast.success('Attendance updated');
      navigate(`/attendance/${id}`);
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <DashboardLayout><p>Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Edit Attendance</h1>
      <form onSubmit={handleSubmit} className="max-w-4xl bg-white p-6 rounded shadow">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Batch</label>
            <input type="text" value={batch} disabled className="w-full px-3 py-2 border rounded bg-gray-100" />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto border rounded">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Roll No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-t">
                  <td className="px-4 py-2">{student.rollNo}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">
                    <select
                      value={attendance[student._id] || 'Absent'}
                      onChange={(e) => handleStatusChange(student._id, e.target.value as any)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex space-x-2 mt-6">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? 'Saving...' : 'Update Attendance'}
          </button>
          <button type="button" onClick={() => navigate(`/attendance/${id}`)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default FacultyEditAttendance;