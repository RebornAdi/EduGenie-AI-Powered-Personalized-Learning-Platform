import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SubjectsPage from "./pages/SubjectsPage";
import CursorMathTrail from "./components/CursorMathTrail";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <>
      <CursorMathTrail />

      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={<Navigate to="/dashboard" />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<DashboardPage />}
            />

            <Route
              path="subjects"
              element={<SubjectsPage />}
            />
          </Route>

        </Routes>
      </BrowserRouter>
    </>
  );
}