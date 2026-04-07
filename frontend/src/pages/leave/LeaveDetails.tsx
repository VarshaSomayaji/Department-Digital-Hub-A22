import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { LeaveRequest } from '../../types/leave';
import { deleteLeaveRequest, getLeaveRequestById, approveLeaveRequest } from '../../services/leave';

const LeaveDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leave, setLeave] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const data = await getLeaveRequestById(id!);
        setLeave(data);
      } catch (error) {
        toast.error('Leave request not found');
        navigate('/leave');
      } finally {
        setLoading(false);
      }
    };
    fetchLeave();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    try {
      await deleteLeaveRequest(id!);
      toast.success('Leave request deleted');
      navigate('/leave');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  if (!leave) return null;

  const isRequester = user?._id === leave.user.id._id;
  const isAdmin = user?.role === 'ADMIN';
  const isHOD = user?.role === 'HOD';
  const isFaculty = user?.role === 'FACULTY';
  const canApprove = (isHOD || isFaculty) && leave.status === 'PENDING' && !isRequester; // HOD can approve faculty/student; faculty can approve student? depends on business logic
  const canEditDelete = isAdmin || isRequester;

  // Determine approver display
  const approverDisplay = leave.approvedBy
    ? `${leave.approvedBy.id.name} (${leave.approvedBy.role})`
    : 'Not yet approved';

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">Leave Request Details</h1>
          {canEditDelete && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Applicant</p>
            <p className="font-medium">{leave.user.id.name}</p>
            <p className="text-sm text-gray-600">{leave.user.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p>
              <span className={`px-2 py-1 rounded text-xs ${
                leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {leave.status}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p>{new Date(leave.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p>{new Date(leave.endDate).toLocaleDateString()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Reason</p>
            <p className="whitespace-pre-wrap">{leave.reason}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Applied On</p>
            <p>{new Date(leave.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Approved By</p>
            <p>{approverDisplay}</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate('/leave')}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Back to List
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeaveDetails;