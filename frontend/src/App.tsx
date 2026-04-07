import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboards
import AdminDashboard from "./pages/admin/AdminDashboard";
import HODDashboard from "./pages/hod/HODDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

import Announcements from "./pages/announcements/Announcements";
import AnnouncementForm from "./pages/announcements/AnnouncementForm";
import AnnouncementDetail from "./pages/announcements/AnnouncementDetail";
import DoubtResolver from "./pages/ai/DoubtResolver";
import Projects from "./pages/projects/Projects";
import ProjectForm from "./pages/projects/ProjectForm";
import ProjectDetail from "./pages/projects/ProjectDetail";
import { AuthProvider } from "./contexts/AuthContext";
import Polls from "./pages/polls/Polls";
import PollForm from "./pages/polls/PollForm";
import PollVote from "./pages/polls/PollVote";
import PollResults from "./pages/polls/PollResults";
import PlacementDrives from "./pages/placements/PlacementDrives";
import PlacementDriveForm from "./pages/placements/PlacementDriveForm";
import PlacementDriveDetail from "./pages/placements/PlacementDriveDetail";
import FacultyAttendanceList from "./pages/attendance/FacultyAttendanceList";
import StudentAttendanceView from "./pages/attendance/StudentAttendanceView";
import FacultyMarkAttendance from "./pages/attendance/FacultyMarkAttendance";
import AttendanceDetail from "./pages/attendance/AttendanceDetail";
import FacultyEditAttendance from "./pages/attendance/FacultyEditAttendance";
import FacultyQuizList from "./pages/quizzes/FacultyQuizList";
import StudentQuizList from "./pages/quizzes/StudentQuizList";
import QuizForm from "./pages/quizzes/QuizForm";
import QuizResultsView from "./pages/quizzes/QuizResultsView";
import TakeQuiz from "./pages/quizzes/TakeQuiz";
import QuizResult from "./pages/quizzes/QuizResult";
import FacultyMarksList from "./pages/marks/FacultyMarksList";
import StudentMarksView from "./pages/marks/StudentMarksView";
import MarksForm from "./pages/marks/MarksForm";
import TimetableView from "./pages/timetable/TimetableView";
import TimetableForm from "./pages/timetable/TimetableForm";
import NotesList from "./pages/notes/NotesList";
import NoteUpload from "./pages/notes/NoteUpload";
import MyLeaveRequests from "./pages/leave/MyLeaveRequests";
import LeaveApply from "./pages/leave/LeaveApply";
import PendingLeaveRequests from "./pages/leave/PendingLeaveRequests";
import ApproveLeave from "./pages/leave/ApproveLeave";
import ClassroomUpdatesList from "./pages/classroom/ClassroomUpdatesList";
import ClassroomUpdateForm from "./pages/classroom/ClassroomUpdateForm";
import UserManagement from "./pages/admin/UserManagement";
import UserForm from "./pages/admin/UserForm";
import UserDetail from "./pages/admin/UserDetail";
import Profile from "./pages/profile/Profile";
import MarksDetail from "./pages/marks/MarksDetail";
import LeaveDetails from "./pages/leave/LeaveDetails";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/users/new" element={<UserForm />} />
            <Route path="/admin/users/:id" element={<UserDetail />} />
            <Route path="/admin/users/:id/edit" element={<UserForm />} />
          </Route>

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "HOD", "FACULTY", "STUDENT"]}
              />
            }
          >

            <Route path="/profile" element={<Profile />} />

            <Route path="/announcements" element={<Announcements />} />
            <Route path="/announcements/new" element={<AnnouncementForm />} />
            <Route path="/announcements/:id" element={<AnnouncementDetail />} />
            <Route
              path="/announcements/:id/edit"
              element={<AnnouncementForm />}
            />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />{" "}
            <Route path="/polls" element={<Polls />} />
            <Route path="/polls/new" element={<PollForm />} />
            <Route path="/polls/:id" element={<PollVote />} />
            <Route path="/polls/:id/results" element={<PollResults />} />
            <Route path="/polls/:id/edit" element={<PollForm />} />
            <Route path="/placements" element={<PlacementDrives />} />
            <Route path="/placements/new" element={<PlacementDriveForm />} />
            <Route path="/placements/:id" element={<PlacementDriveDetail />} />
            <Route
              path="/placements/:id/edit"
              element={<PlacementDriveForm />}
            />
            <Route path="/attendance">
              <Route index element={<FacultyAttendanceList />} />
              <Route path="my" element={<StudentAttendanceView />} />
              <Route path="mark" element={<FacultyMarkAttendance />} />
              <Route path=":id" element={<AttendanceDetail />} />
              <Route path=":id/edit" element={<FacultyEditAttendance />} />
            </Route>
            <Route path="/quizzes">
              <Route index element={<FacultyQuizList />} />
              <Route path="student" element={<StudentQuizList />} />
              <Route path="new" element={<QuizForm />} />
              <Route path=":id/edit" element={<QuizForm />} />
              <Route path=":id/results" element={<QuizResultsView />} />
              <Route path="take/:id" element={<TakeQuiz />} />
              <Route path="result/:id" element={<QuizResult />} />
            </Route>
          </Route>

          <Route path="/marks">
            <Route index element={<FacultyMarksList />} />
            <Route path="student" element={<StudentMarksView />} />
            <Route path="new" element={<MarksForm />} />
            <Route path=":id" element={<MarksDetail />} />
            <Route path=":id/edit" element={<MarksForm />} />
          </Route>

          <Route path="/timetable">
            <Route index element={<TimetableView />} />
            <Route path="new" element={<TimetableForm />} />
            <Route path=":id/edit" element={<TimetableForm />} />
          </Route>

          <Route path="/notes">
            <Route index element={<NotesList />} />
            <Route path="upload" element={<NoteUpload />} />
            <Route path=":id/edit" element={<NoteUpload />} />
          </Route>

          <Route path="/leave">
            <Route index element={<MyLeaveRequests />} />
            <Route path="apply" element={<LeaveApply />} />
            <Route path="pending" element={<PendingLeaveRequests />} />
            <Route path="approve/:id" element={<ApproveLeave />} />
            <Route path=":id" element={<LeaveDetails />} />
          </Route>

          <Route path="/classroom">
            <Route index element={<ClassroomUpdatesList />} />
            <Route path="new" element={<ClassroomUpdateForm />} />
            <Route path=":id/edit" element={<ClassroomUpdateForm />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["HOD"]} />}>
            <Route path="/hod" element={<HODDashboard />} />
            {/* Add more HOD routes */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["FACULTY"]} />}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            {/* Add more faculty routes */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/ai/doubt" element={<DoubtResolver />} />
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
