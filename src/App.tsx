import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import React, { Suspense, lazy } from 'react';
import { Layout } from "./components/Layout";
const Index = lazy(() => import('./pages/Index'));
const StoryJourney = lazy(() => import('./pages/StoryJourney'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const AgriculturalSimulation = lazy(() => import('@/pages/AgriculturalSimulation').then(m => ({ default: m.AgriculturalSimulation })));
const MiniGames = lazy(() => import('./pages/MiniGames'));
const Facts = lazy(() => import('./pages/Facts'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const QuizExam = lazy(() => import('./pages/QuizExam'));
const ChapterContent = lazy(() => import('./pages/ChapterContent'));
const Profile = lazy(() => import('./pages/Profile'));
const Certificates = lazy(() => import('./pages/Certificates'));
const MyResults = lazy(() => import('./pages/MyResults'));
const QuizAdmin = lazy(() => import('./pages/admin/QuizAdmin'));
const CourseAdmin = lazy(() => import('./pages/admin/CourseAdmin'));
const Auth = lazy(() => import('./pages/Auth'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Contact = lazy(() => import('./pages/Contact'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const AdminHealth = lazy(() => import('./pages/admin/AdminHealth'));

import { useAuth } from "@/hooks/useAuth";
// Debug overlay removed per request

const queryClient = new QueryClient();

function LayoutWrapper() {
  // Color consistency enforcer
  React.useEffect(() => {
    // Ensure consistent color scheme across environments
    const enforceColorConsistency = () => {
      const root = document.documentElement;
      
      // Force reload CSS variables in production
      if (import.meta.env.PROD) {
        root.style.setProperty('--primary', '82 84% 32%');
        root.style.setProperty('--secondary', '25 45% 85%'); 
        root.style.setProperty('--accent', '35 65% 55%');
        root.style.setProperty('--background', '45 20% 97%');
        root.style.setProperty('--foreground', '25 15% 15%');
      }
    };

    enforceColorConsistency();
    
    // Re-enforce on page load
    window.addEventListener('load', enforceColorConsistency);
    return () => window.removeEventListener('load', enforceColorConsistency);
  }, []);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<LayoutWrapper />}>
          <Route index element={<Index />} />
          <Route path="story" element={<StoryJourney />} />
          <Route path="story/chapters/:chapterId" element={<ChapterContent />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="simulation" element={<AgriculturalSimulation />} />
          <Route path="mini-games" element={<MiniGames />} />
          <Route path="facts" element={<Facts />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="quizzes/:quizId" element={<QuizExam />} />
          <Route path="profile" element={<Profile />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="verify/:code" element={<VerifyCertificate />} />
          <Route path="results" element={<MyResults />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="contact" element={<Contact />} />
          <Route path="admin/quizzes" element={<QuizAdmin />} />
          <Route path="admin/courses" element={<CourseAdmin />} />
          <Route path="admin/health" element={<AdminHealth />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('[AppErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 text-red-600 font-mono">
          <h1 className="text-2xl mb-4">App crashed</h1>
          <pre className="whitespace-pre-wrap text-sm">{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppErrorBoundary>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <AppContent />
        </Suspense>
      </AppErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
