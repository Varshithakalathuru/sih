import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ContractorDashboard from './pages/ContractorDashboard';
import ContractorUpload from './pages/ContractorUpload';
import ContractorProjectDetail from './pages/ContractorProjectDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminProjects from './pages/AdminProjects';
import AdminProjectDetail from './pages/AdminProjectDetail';
import AdminContractors from './pages/AdminContractors';
import AdminContractorProfile from './pages/AdminContractorProfile';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="contractor">
            <Layout>
              <ContractorDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/submit"
        element={
          <ProtectedRoute role="contractor">
            <Layout>
              <ContractorUpload />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute role="contractor">
            <Layout>
              <ContractorProjectDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminProjects />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects/:id"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminProjectDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/contractors"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminContractors />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/contractors/:id"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <AdminContractorProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
    </Routes>
  );
}
