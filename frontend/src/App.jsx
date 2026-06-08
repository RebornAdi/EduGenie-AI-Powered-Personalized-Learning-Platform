import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import CursorMathTrail from "./components/CursorMathTrail";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SubjectsPage from "./pages/SubjectsPage";
import TutorPage from "./pages/TutorPage";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <>
      <CursorMathTrail />

      <BrowserRouter>
        <Routes>

          {/* Redirect Root */}

          <Route
            path="/"
            element={<Navigate to="/dashboard" />}
          />

          {/* Public Routes */}

          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Protected Routes */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Home */}

            <Route
              index
              element={<DashboardPage />}
            />

            {/* Subjects */}

            <Route
              path="subjects"
              element={<SubjectsPage />}
            />

            {/* AI Tutor */}

            <Route
              path="tutor"
              element={<TutorPage />}
            />

          </Route>

        </Routes>
      </BrowserRouter>
    </>
  );
}