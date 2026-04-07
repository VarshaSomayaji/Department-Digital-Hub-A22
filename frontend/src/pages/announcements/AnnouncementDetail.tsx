import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnnouncementById, markAnnouncementAsSeen } from '../../services/announcement';
import { Announcement } from '../../types/announcement';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  MdEdit,
  MdArrowBack,
  MdPerson,
  MdDateRange,
  MdPeople,
  MdShare,
  MdPrint,
  MdAnnouncement,
} from 'react-icons/md';
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserTie,
  FaRegEye
} from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';

const AnnouncementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [markedSeen, setMarkedSeen] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const data = await getAnnouncementById(id!);
        setAnnouncement(data);

        if (!markedSeen) {
          await markAnnouncementAsSeen(id!);
          setMarkedSeen(true);
        }
      } catch (error) {
        toast.error('Announcement not found');
        navigate('/announcements');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, [id, navigate, markedSeen]);

  const getRoleIcon = (role: string, size: string = "w-4 h-4") => {
    switch (role) {
      case 'STUDENT':
        return <FaGraduationCap className={`${size} text-green-600`} />;
      case 'FACULTY':
        return <FaChalkboardTeacher className={`${size} text-blue-600`} />;
      case 'HOD':
        return <FaUserTie className={`${size} text-purple-600`} />;
      case 'ADMIN':
        return <GiSettingsKnobs className={`${size} text-red-600`} />;
      default:
        return <MdPeople className={`${size} text-gray-600`} />;
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      case 'FACULTY':
        return 'bg-blue-100 text-blue-800';
      case 'HOD':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const postedDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: announcement?.title,
          text: announcement?.content,
          url: window.location.href,
        });
        toast.success('Shared successfully');
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading announcement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!announcement) return null;

  const canEditDelete = user && ['ADMIN', 'HOD', 'FACULTY'].includes(user.role);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/announcements')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
            <span>Back to Announcements</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2"></div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MdAnnouncement className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {getRelativeTime(announcement.createdAt)}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  {announcement.title}
                </h1>
              </div>

              {canEditDelete && (
                <Link
                  to={`/announcements/${id}/edit`}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200"
                >
                  <MdEdit className="w-5 h-5" />
                  <span>Edit</span>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <MdPerson className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Posted by</p>
                  <p className="text-sm font-medium text-gray-800">
                    {announcement.postedBy.id?.name || announcement.postedBy.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <MdDateRange className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Published on</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <MdPeople className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Target Audience</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {announcement.targetAudience.map((audience) => (
                      <span
                        key={audience}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getAudienceColor(audience)}`}
                      >
                        {getRoleIcon(audience, "w-3 h-3")}
                        <span>{audience}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MdPrint className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MdShare className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {announcement.seenBy && announcement.seenBy.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <FaRegEye className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800">View Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Views</span>
                <span className="text-lg font-bold text-gray-800">
                  {announcement.seenBy.length}
                </span>
              </div>
              {announcement.seenBy.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-2">Recently viewed by:</p>
                  <div className="flex flex-wrap gap-2">
                    {announcement.seenBy.slice(0, 5).map((viewer, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        <MdPerson className="w-3 h-3" />
                        <span>{viewer.user?.role || 'User'}</span>
                      </span>
                    ))}
                    {announcement.seenBy.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{announcement.seenBy.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/announcements')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
          >
            <MdArrowBack className="w-5 h-5" />
            <span>Back to All Announcements</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementDetail;