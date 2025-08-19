import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import VotingPage from '../pages/VotingPage';
import ResultPage from '../pages/ResultPage';
import AdminDashboard from '../pages/AdminDashboard';
import AddPost from '../pages/AddPost';
import AddCandidate from '../pages/AddCandidate';
import VoterList from '../pages/VoterList';
import VoterLimits from '../pages/VoterLimits';
import ElectionReportPage from '../pages/ElectionReportPage';
import DetailedResults from '../pages/DetailedResults';
import NotFound from '../pages/NotFound';
import DashboardLayout from '../components/Layout/DashboardLayout';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vote" element={<VotingPage />} />
        <Route path="results" element={<ResultPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/add-post"
          element={
            <ProtectedRoute adminOnly>
              <AddPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/add-candidate"
          element={
            <ProtectedRoute adminOnly>
              <AddCandidate />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/voters"
          element={
            <ProtectedRoute adminOnly>
              <VoterList />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/voter-limits"
          element={
            <ProtectedRoute adminOnly>
              <VoterLimits />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/election-report"
          element={
            <ProtectedRoute adminOnly>
              <ElectionReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/detailed-results"
          element={
            <ProtectedRoute adminOnly>
              <DetailedResults />
            </ProtectedRoute>
          }
        />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;