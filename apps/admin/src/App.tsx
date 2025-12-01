import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/layout";
import ProtectedRoute from "./components/auth/protected-route";
import LoginPage from "./components/auth/login-page";
import DashboardPage from "./pages/dashboard-page";
import TeamsManagementPage from "./pages/teams-management-page";
import MatchManagementPage from "./pages/match-management-page";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <Layout>
              <TeamsManagementPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <Layout>
              <MatchManagementPage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
