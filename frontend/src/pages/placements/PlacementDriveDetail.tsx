import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlacementDriveById } from '../../services/placement';
import { PlacementDrive } from '../../types/placement';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  MdArrowBack, 
  MdEdit, 
  MdBusiness, 
  MdWork, 
  MdDateRange, 
  MdDescription, 
  MdSchool, 
  MdAttachFile,
  MdDownload,
  MdPerson,
  MdCalendarToday,
  MdSchedule,
  MdCheckCircle,
  MdLocationOn,
  MdEmail,
  MdPhone,
  MdInfo
} from 'react-icons/md';
import { 
  FaBuilding, 
  FaBriefcase, 
  FaCalendarAlt, 
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaGraduationCap
} from 'react-icons/fa';

const PlacementDriveDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drive, setDrive] = useState<PlacementDrive | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrive = async () => {
      try {
        const data = await getPlacementDriveById(id!);
        setDrive(data);
      } catch (error) {
        toast.error('Placement drive not found');
        navigate('/placements');
      } finally {
        setLoading(false);
      }
    };
    fetchDrive();
  }, [id, navigate]);

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="w-5 h-5 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return <FaFileImage className="w-5 h-5 text-green-500" />;
    return <FaFileAlt className="w-5 h-5 text-blue-500" />;
  };

  const getDaysRemaining = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading placement drive details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!drive) return null;

  const canEditDelete = user && ['ADMIN', 'HOD'].includes(user.role);
  const isExpired = new Date(drive.lastDateToApply) < new Date();
  const daysRemaining = getDaysRemaining(drive.lastDateToApply);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/placements')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          <span>Back to Placement Drives</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FaBuilding className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {drive.companyName}
                  </h1>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <FaBriefcase className="w-4 h-4 text-white/80" />
                  <p className="text-white/90 text-lg">{drive.jobProfile}</p>
                </div>
              </div>
              {canEditDelete && (
                <Link
                  to={`/placements/${id}/edit`}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-200"
                >
                  <MdEdit className="w-5 h-5" />
                  <span>Edit Drive</span>
                </Link>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-xl ${isExpired ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center space-x-3">
                {isExpired ? (
                  <MdSchedule className="w-6 h-6 text-red-600" />
                ) : (
                  <MdCheckCircle className="w-6 h-6 text-green-600" />
                )}
                <div>
                  <p className={`font-semibold ${isExpired ? 'text-red-800' : 'text-green-800'}`}>
                    {isExpired ? 'Application Closed' : 'Applications Open'}
                  </p>
                  <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                    {isExpired ? 'Last date to apply has passed' : `${daysRemaining} to apply`}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <MdCalendarToday className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-700">Last Date to Apply</h3>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(drive.lastDateToApply).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {daysRemaining}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <MdSchedule className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-700">Drive Date</h3>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(drive.driveDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Posted By Information */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MdPerson className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-700">Posted By</h3>
              </div>
              <p className="text-gray-800">
                {drive.postedBy.id?.name || drive.postedBy.role}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Posted on {new Date(drive.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <MdDescription className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Job Description</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {drive.description}
                </p>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <MdSchool className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-800">Eligibility Criteria</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {drive.eligibility}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {drive.attachments && drive.attachments.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <MdAttachFile className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Attachments</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-2">
                    {drive.attachments.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(url)}
                          <span className="text-blue-600 group-hover:text-blue-800">
                            {url.split('/').pop()}
                          </span>
                        </div>
                        <MdDownload className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={() => navigate('/placements')}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                <MdArrowBack className="w-5 h-5" />
                <span>Back to List</span>
              </button>
              
             
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <MdInfo className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Important Notes:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Ensure you meet all eligibility criteria before applying</li>
                <li>• Keep your documents ready for verification</li>
                <li>• Check your email regularly for updates</li>
                <li>• Contact placement cell for any queries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlacementDriveDetail;