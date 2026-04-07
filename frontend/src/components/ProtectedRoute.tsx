import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return(
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-medium text-gray-600">
          Checking authentication...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  

  if (!allowedRoles.includes(user.role)) {
    const dashboardMap: Record<Role, string> = {
      ADMIN: '/admin',
      HOD: '/hod',
      FACULTY: '/faculty',
      STUDENT: '/student',
    };
    const fallback = dashboardMap[user.role] || '/';
    return <Navigate to={dashboardMap[user.role]} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;