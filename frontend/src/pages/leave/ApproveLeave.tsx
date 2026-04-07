import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeaveRequestById, approveLeaveRequest } from '../../services/leave';
import { LeaveRequest } from '../../types/leave';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';

const ApproveLeave: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await getLeaveRequestById(id!);
        setRequest(data);
      } catch (error) {
        toast.error('Leave request not found');
        navigate('/leave/pending');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id, navigate]);

  const handleApprove = async (status: 'APPROVED' | 'REJECTED') => {
    setSubmitting(true);
    try {
      await approveLeaveRequest(id!, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      navigate('/leave/pending');
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  if (!request) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Approve Leave Request</h1>
        <div className="mb-4">
          <p><strong>Employee:</strong> {request.user.id.name} ({request.user.role})</p>
          <p><strong>Start Date:</strong> {new Date(request.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> {new Date(request.endDate).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> {request.reason}</p>
          <p><strong>Status:</strong> {request.status}</p>
        </div>
        {request.status === 'PENDING' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleApprove('APPROVED')}
              disabled={submitting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Approve
            </button>
            <button
              onClick={() => handleApprove('REJECTED')}
              disabled={submitting}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Reject
            </button>
            <button
              onClick={() => navigate('/leave/pending')}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApproveLeave;