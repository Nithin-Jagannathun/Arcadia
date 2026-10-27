import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DoodleStudioPage } from './pages/DoodleStudioPage';
import { IdeationPage } from './pages/IdeationPage';
import { LoginPage } from './pages/LoginPage';
import { MilestonesPage } from './pages/MilestonesPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner text="Restoring Arcadia session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            path="/assignments"
            element={
              <ProtectedRoute>
                <Layout>
                  <AssignmentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/milestones"
            element={
              <ProtectedRoute>
                <Layout>
                  <MilestonesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ideation"
            element={
              <ProtectedRoute>
                <Layout>
                  <IdeationPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doodle"
            element={
              <ProtectedRoute>
                <Layout>
                  <DoodleStudioPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
