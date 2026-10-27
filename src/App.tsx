import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CardSkeleton } from './components/common/LoadingSkeleton';

// Lazy-load all application pages
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const KanbanPage = lazy(() => import('./pages/KanbanPage').then((m) => ({ default: m.KanbanPage })));
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then((m) => ({ default: m.SubmissionsPage })));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage').then((m) => ({ default: m.AIAssistantPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Protected Route Component
interface ProtectedRouteProps {
  allowedRole?: 'teacher' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { isAuthenticated, currentUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    // Redirect students attempting to access teacher routes
    if (allowedRole === 'teacher' && currentUser.role === 'student') {
      return <Navigate to="/student-portal" replace />;
    }
    // Redirect teachers attempting to access student portal
    if (allowedRole === 'student' && currentUser.role === 'teacher') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

// Authenticated App Shell with Header and Sidebar
const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Suspense fallback={<CardSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

// Top-level Dashboard Resolver (redirects to correct portal according to server role)
const DashboardResolver: React.FC = () => {
  const { currentUser } = useApp();
  return currentUser.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />;
};

// Public Route Wrappers
const PublicLandingWrapper: React.FC = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><CardSkeleton /></div>}>
      <LandingPage
        onEnterApp={() => {
          window.location.href = '/dashboard';
        }}
        onOpenLogin={() => {
          window.location.href = '/login';
        }}
      />
    </Suspense>
  );
};

const PublicLoginWrapper: React.FC = () => {
  const { isAuthenticated, currentUser } = useApp();

  if (isAuthenticated) {
    return <Navigate to={currentUser.role === 'student' ? '/student-portal' : '/dashboard'} replace />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><CardSkeleton /></div>}>
      <LoginPage
        onLoginSuccess={() => {
          // Handled via state and navigation
        }}
        onGoToLanding={() => {
          window.location.href = '/';
        }}
      />
    </Suspense>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLandingWrapper />} />
          <Route path="/login" element={<PublicLoginWrapper />} />

          {/* Authenticated Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardResolver />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/kanban" element={<KanbanPage />} />
              <Route path="/submissions" element={<SubmissionsPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />

              {/* Student Only Route */}
              <Route element={<ProtectedRoute allowedRole="student" />}>
                <Route path="/student-portal" element={<StudentDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<Suspense fallback={<div />}><NotFoundPage /></Suspense>} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
