import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Tutor from './pages/Tutor';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';
import Planner from './pages/Planner';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-600 font-medium">Loading...</div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="materials" element={<Materials />} />
            <Route path="tutor" element={<Tutor />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="planner" element={<Planner />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
