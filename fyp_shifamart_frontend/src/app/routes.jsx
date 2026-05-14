import { createBrowserRouter, Navigate } from 'react-router-dom';
import ResponsiveShell from '@components/layout/ResponsiveShell';
import ProtectedRoute from '@components/ProtectedRoute';

// Auth Pages
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import ResetPassword from '@pages/auth/ResetPassword';

// Public Pages
import FirstAid from '@pages/FirstAid';
import Home from '@pages/Home';
import DoctorsPage from '@pages/DoctorsPage';
import PharmaciesPage from '@pages/PharmaciesPage';
import DoctorDetailPage from '@pages/DoctorDetailPage';
import PharmacyDetailPage from '@pages/PharmacyDetailPage';

// Patient Pages
import PatientDashboard from '@pages/patient/PatientDashboard';
import SymptomChecker from '@pages/patient/SymptomChecker';
import PrescriptionUpload from '@pages/patient/PrescriptionUpload';
import MedicineCompare from '@pages/patient/MedicineCompare';
import AIAgent from '@pages/patient/AIAgent';

// Pharmacy Pages
import PharmacyDashboard from '@pages/pharmacy/PharmacyDashboard';
import InventoryManager from '@pages/pharmacy/InventoryManager';

// Doctor Pages
import DoctorDashboard from '@pages/doctor/DoctorDashboard';
import PatientConsult from '@pages/doctor/PatientConsult';

// Admin Pages
import AdminDashboard from '@pages/admin/AdminDashboard';
import PharmacyApprovals from '@pages/admin/PharmacyApprovals';

const router = createBrowserRouter([
  // Public Routes (No Shell)
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/doctors',
    element: <DoctorsPage />,
  },
  {
    path: '/doctors/:id',
    element: <DoctorDetailPage />,
  },
  {
    path: '/pharmacies',
    element: <PharmaciesPage />,
  },
  {
    path: '/pharmacies/:id',
    element: <PharmacyDetailPage />,
  },
  
  // Protected Routes wrapped in Shell
  {
    element: <ResponsiveShell />,
    children: [
      {
        path: '/first-aid',
        element: <FirstAid />,
      },
      
      // Patient Routes
      {
        path: '/patient',
        element: <ProtectedRoute allowedRoles={['patient']}><Navigate to="dashboard" replace /></ProtectedRoute>,
      },
      {
        path: '/patient/dashboard',
        element: <ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>,
      },
      {
        path: '/patient/symptoms',
        element: <ProtectedRoute allowedRoles={['patient']}><SymptomChecker /></ProtectedRoute>,
      },
      {
        path: '/patient/upload',
        element: <ProtectedRoute allowedRoles={['patient']}><PrescriptionUpload /></ProtectedRoute>,
      },
      {
        path: '/patient/medicines',
        element: <ProtectedRoute allowedRoles={['patient']}><MedicineCompare /></ProtectedRoute>,
      },
      {
        path: '/patient/ai-assistant',
        element: <ProtectedRoute allowedRoles={['patient']}><AIAgent /></ProtectedRoute>,
      },
      
      // Public AI Agent (accessible without login for demo)
      {
        path: '/ai-assistant',
        element: <AIAgent />,
      },

      // Pharmacy Routes
      {
        path: '/pharmacy',
        element: <ProtectedRoute allowedRoles={['pharmacy']}><Navigate to="dashboard" replace /></ProtectedRoute>,
      },
      {
        path: '/pharmacy/dashboard',
        element: <ProtectedRoute allowedRoles={['pharmacy']}><PharmacyDashboard /></ProtectedRoute>,
      },
      {
        path: '/pharmacy/inventory',
        element: <ProtectedRoute allowedRoles={['pharmacy']}><InventoryManager /></ProtectedRoute>,
      },

      // Doctor Routes
      {
        path: '/doctor',
        element: <ProtectedRoute allowedRoles={['doctor']}><Navigate to="dashboard" replace /></ProtectedRoute>,
      },
      {
        path: '/doctor/dashboard',
        element: <ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>,
      },
      {
        path: '/doctor/consult/:id',
        element: <ProtectedRoute allowedRoles={['doctor']}><PatientConsult /></ProtectedRoute>,
      },

      // Admin Routes
      {
        path: '/admin',
        element: <ProtectedRoute allowedRoles={['admin']}><Navigate to="dashboard" replace /></ProtectedRoute>,
      },
      {
        path: '/admin/dashboard',
        element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>,
      },
      {
        path: '/admin/approvals',
        element: <ProtectedRoute allowedRoles={['admin']}><PharmacyApprovals /></ProtectedRoute>,
      },
    ],
  },
  
  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
