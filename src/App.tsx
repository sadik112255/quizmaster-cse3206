import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageQuizzesPage } from './pages/admin/ManageQuizzesPage';
import { QuizEditorPage } from './pages/admin/QuizEditorPage';
import { QuestionsPage } from './pages/admin/QuestionsPage';
import { AdminResultsPage } from './pages/admin/AdminResultsPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AvailableQuizzesPage } from './pages/student/AvailableQuizzesPage';
import { QuizInstructionsPage } from './pages/student/QuizInstructionsPage';
import { QuizAttemptPage } from './pages/student/QuizAttemptPage';
import { ResultPage } from './pages/student/ResultPage';
import { QuizHistoryPage } from './pages/student/QuizHistoryPage';
import { ProfilePage } from './pages/student/ProfilePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <ManageQuizzesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes/new"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <QuizEditorPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <QuizEditorPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes/:id/questions"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <QuestionsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <AdminResultsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <AppLayout>
                  <StudentDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quizzes"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <AppLayout>
                  <AvailableQuizzesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quizzes/:id/instructions"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <AppLayout>
                  <QuizInstructionsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attempts/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <AppLayout>
                  <QuizAttemptPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <AppLayout>
                  <ResultPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/history"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <AppLayout>
                  <QuizHistoryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
