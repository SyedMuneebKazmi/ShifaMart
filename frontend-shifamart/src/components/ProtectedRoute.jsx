import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@stores/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap = {
      patient: '/patient/dashboard',
      pharmacy: '/pharmacy/dashboard',
      doctor: '/doctor/dashboard',
      admin: '/admin/dashboard',
    };
    
    return <Navigate to={dashboardMap[user?.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
