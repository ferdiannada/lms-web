import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
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

// Sleek loading fallback for route transitions
const PageLoader: React.FC = () => (
  <div className="p-12 text-center text-slate-500 space-y-3 animate-in fade-in duration-200">
    <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-xs font-semibold text-slate-500">Memuat halaman...</p>
  </div>
);

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600">
        <div className="text-center space-y-3">
          <div className="inline-block w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold">Memuat aplikasi PEDIA LMS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4 lg:p-6 xl:p-8">
          <div className="max-w-[1600px] mx-auto w-full pb-12">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/classes" element={<ClassList />} />
                <Route path="/classes/:id" element={<ClassDetail />} />
                <Route path="/assignments" element={<AssignmentsPage />} />
                <Route path="/quizzes" element={<QuizzesPage />} />
                <Route path="/quiz/:id" element={<QuizPlayer />} />
                <Route path="/grades" element={<GradebookPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
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
