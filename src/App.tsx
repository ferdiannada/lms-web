import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Login } from './pages/Login';

// Route-Level Code Splitting for ultra-fast initial page loads
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const ClassList = lazy(() => import('./pages/ClassList').then((m) => ({ default: m.ClassList })));
const ClassDetail = lazy(() => import('./pages/ClassDetail').then((m) => ({ default: m.ClassDetail })));
const AssignmentsPage = lazy(() => import('./pages/AssignmentsPage').then((m) => ({ default: m.AssignmentsPage })));
const QuizzesPage = lazy(() => import('./pages/QuizzesPage').then((m) => ({ default: m.QuizzesPage })));
const QuizPlayer = lazy(() => import('./pages/QuizPlayer').then((m) => ({ default: m.QuizPlayer })));
const GradebookPage = lazy(() => import('./pages/GradebookPage').then((m) => ({ default: m.GradebookPage })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const ForceChangePassword = lazy(() => import('./pages/ForceChangePassword').then((m) => ({ default: m.ForceChangePassword })));

// Sleek loading fallback for route transitions
const PageLoader: React.FC = () => (
  <div className="p-12 text-center text-slate-500 space-y-3 animate-in fade-in duration-200">
    <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-xs font-semibold text-slate-500">Memuat halaman...</p>
  </div>
);

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-m3-enter w-full h-full">
      {children}
    </div>
  );
};

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-m3-surface-container flex items-center justify-center text-m3-on-surface">
        <div className="text-center space-y-3">
          <div className="inline-block w-9 h-9 border-4 border-m3-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold">Memuat aplikasi PEDIA LMS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.is_initial_password) {
    if (location.pathname !== '/force-change-password') {
      return <Navigate to="/force-change-password" replace />;
    }
    return (
      <Suspense fallback={<PageLoader />}>
        <ForceChangePassword />
      </Suspense>
    );
  }

  return (
    <div className="h-screen flex bg-m3-surface text-m3-on-surface overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 relative">
        <Navbar isScrolled={isScrolled} />
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 relative"
          onScroll={handleScroll}
        >
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pb-12">
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/classes" element={<ClassList />} />
                  <Route path="/classes/:id" element={<ClassDetail />} />
                  <Route path="/assignments" element={<AssignmentsPage />} />
                  <Route path="/quizzes" element={<QuizzesPage />} />
                  <Route path="/quiz/:id" element={<QuizPlayer />} />
                  <Route path="/grades" element={<GradebookPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/force-change-password" element={<ForceChangePassword />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PageTransition>
            </Suspense>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
