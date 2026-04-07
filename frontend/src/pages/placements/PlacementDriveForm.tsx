import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  createPlacementDrive,
  getPlacementDriveById,
  updatePlacementDrive,
} from "../../services/placement";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  MdBusiness, 
  MdWork, 
  MdDescription, 
  MdSchool, 
  MdDateRange,
  MdSave, 
  MdCancel,
  MdEdit,
  MdAdd,
  MdAttachFile,
  MdSchedule,
  MdWarning,
  MdCheckCircle
} from "react-icons/md";
import { FaBuilding, FaBriefcase, FaCalendarAlt, FaFileAlt } from "react-icons/fa";

const PlacementDriveForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [companyName, setCompanyName] = useState("");
  const [jobProfile, setJobProfile] = useState("");
  const [description, setDescription] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [lastDateToApply, setLastDateToApply] = useState("");
  const [driveDate, setDriveDate] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (isEditing) {
      const fetchDrive = async () => {
        try {
          const data = await getPlacementDriveById(id!);
          setCompanyName(data.companyName);
          setJobProfile(data.jobProfile);
          setDescription(data.description);
          setEligibility(data.eligibility);
          setLastDateToApply(data.lastDateToApply.split("T")[0]);
          setDriveDate(data.driveDate.split("T")[0]);
        } catch (error) {
          toast.error("Failed to load placement drive");
          navigate("/placements");
        }
      };
      fetchDrive();
    }
  }, [id, isEditing, navigate]);

  const handleFocus = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field: string) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!jobProfile.trim()) {
      toast.error("Job profile is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!eligibility.trim()) {
      toast.error("Eligibility criteria is required");
      return;
    }
    if (!lastDateToApply) {
      toast.error("Last date to apply is required");
      return;
    }
    if (!driveDate) {
      toast.error("Drive date is required");
      return;
    }

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = new Date(lastDateToApply);
    const drive = new Date(driveDate);

    if (lastDate < today) {
      toast.error("Last date to apply must be today or in the future");
      return;
    }
    if (drive < lastDate) {
      toast.error("Drive date must be after the last date to apply");
      return;
    }

    const formData = new FormData();
    formData.append("companyName", companyName.trim());
    formData.append("jobProfile", jobProfile.trim());
    formData.append("description", description.trim());
    formData.append("eligibility", eligibility.trim());
    formData.append("lastDateToApply", new Date(lastDateToApply).toISOString());
    formData.append("driveDate", new Date(driveDate).toISOString());

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("attachments", files[i]);
      }
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updatePlacementDrive(id!, {
          companyName: companyName.trim(),
          jobProfile: jobProfile.trim(),
          description: description.trim(),
          eligibility: eligibility.trim(),
          lastDateToApply: new Date(lastDateToApply).toISOString(),
          driveDate: new Date(driveDate).toISOString(),
        });
        toast.success("Placement drive updated successfully");
      } else {
        await createPlacementDrive(formData);
        toast.success("Placement drive created successfully");
      }
      navigate("/placements");
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const getFileNames = () => {
    if (!files) return "";
    return Array.from(files).map(f => f.name).join(", ");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-3 bg-gradient-to-r ${
              isEditing ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-indigo-500'
            } rounded-xl shadow-lg`}>
              {isEditing ? (
                <MdEdit className="w-6 h-6 text-white" />
              ) : (
                <MdAdd className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isEditing ? "Edit Placement Drive" : "Create Placement Drive"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? "Update placement drive information" 
                  : "Add a new placement opportunity for students"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.companyName ? 'transform scale-[1.02]' : ''}`}>
                <FaBuilding className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.companyName ? 'text-blue-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onFocus={() => handleFocus('companyName')}
                  onBlur={() => handleBlur('companyName')}
                  required
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter company name"
                />
              </div>
            </div>

            {/* Job Profile */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Job Profile <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.jobProfile ? 'transform scale-[1.02]' : ''}`}>
                <FaBriefcase className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.jobProfile ? 'text-blue-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={jobProfile}
                  onChange={(e) => setJobProfile(e.target.value)}
                  onFocus={() => handleFocus('jobProfile')}
                  onBlur={() => handleBlur('jobProfile')}
                  required
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Software Engineer, Data Analyst"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.description ? 'transform scale-[1.02]' : ''}`}>
                <MdDescription className={`absolute left-3 top-4 w-5 h-5 transition-colors duration-200 ${focusedFields.description ? 'text-blue-500' : 'text-gray-400'}`} />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => handleFocus('description')}
                  onBlur={() => handleBlur('description')}
                  required
                  rows={4}
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Describe the job role, responsibilities, and benefits..."
                />
              </div>
              <p className="text-xs text-gray-500">
                Provide detailed information about the job role and responsibilities
              </p>
            </div>

            {/* Eligibility Criteria */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Eligibility Criteria <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-all duration-200 ${focusedFields.eligibility ? 'transform scale-[1.02]' : ''}`}>
                <MdSchool className={`absolute left-3 top-4 w-5 h-5 transition-colors duration-200 ${focusedFields.eligibility ? 'text-blue-500' : 'text-gray-400'}`} />
                <textarea
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  onFocus={() => handleFocus('eligibility')}
                  onBlur={() => handleBlur('eligibility')}
                  required
                  rows={3}
                  className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., B.Tech CSE/IT, 60% aggregate, 2024 batch"
                />
              </div>
              <p className="text-xs text-gray-500">
                Specify the eligibility requirements for students to apply
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Date to Apply <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.lastDate ? 'transform scale-[1.02]' : ''}`}>
                  <MdDateRange className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.lastDate ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="date"
                    value={lastDateToApply}
                    onChange={(e) => setLastDateToApply(e.target.value)}
                    onFocus={() => handleFocus('lastDate')}
                    onBlur={() => handleBlur('lastDate')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Drive Date <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedFields.driveDate ? 'transform scale-[1.02]' : ''}`}>
                  <MdSchedule className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedFields.driveDate ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="date"
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    onFocus={() => handleFocus('driveDate')}
                    onBlur={() => handleBlur('driveDate')}
                    required
                    className="w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Attachments (only for new drives) */}
            {!isEditing && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attachments (optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600"
                  />
                  <MdAttachFile className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {files && files.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MdCheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        {files.length} file(s) selected: {getFileNames()}
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Upload job description, company brochure, or any relevant documents (PDF, DOC, images)
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <MdSave className="w-5 h-5" />
                  <span>{isEditing ? 'Update Drive' : 'Create Drive'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/placements")}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
            >
              <MdCancel className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <MdWarning className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Tips for creating placement drives:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Provide accurate company and job profile information</li>
                <li>• Include detailed job description and responsibilities</li>
                <li>• Specify clear eligibility criteria</li>
                <li>• Ensure dates are correct (last date & drive date)</li>
                <li>• Upload relevant attachments for students to review</li>
                <li>• Drive date must be after the last date to apply</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preview Section (when editing) */}
        {isEditing && (companyName || jobProfile) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <MdCheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-700">Current Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {companyName && (
                <div>
                  <span className="text-gray-500">Company:</span>
                  <p className="font-medium text-gray-800">{companyName}</p>
                </div>
              )}
              {jobProfile && (
                <div>
                  <span className="text-gray-500">Job Profile:</span>
                  <p className="font-medium text-gray-800">{jobProfile}</p>
                </div>
              )}
              {lastDateToApply && (
                <div>
                  <span className="text-gray-500">Last Date:</span>
                  <p className="font-medium text-gray-800">{new Date(lastDateToApply).toLocaleDateString()}</p>
                </div>
              )}
              {driveDate && (
                <div>
                  <span className="text-gray-500">Drive Date:</span>
                  <p className="font-medium text-gray-800">{new Date(driveDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlacementDriveForm;