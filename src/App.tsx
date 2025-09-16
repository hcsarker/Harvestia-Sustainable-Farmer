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
const AgriculturalSimulation = lazy(() => import('@/pages/AgriculturalSimulation').then(m => ({ default: m.AgriculturalSimulation })));
const MiniGames = lazy(() => import('./pages/MiniGames'));
const Facts = lazy(() => import('./pages/Facts'));
const Profile = lazy(() => import('./pages/Profile'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Auth = lazy(() => import('./pages/Auth'));
const NotFound = lazy(() => import('./pages/NotFound'));
import { useAuth } from "@/hooks/useAuth";
const DebugOverlay: React.FC = import.meta.env.DEV
  ? (lazy(() => import('./components/DebugOverlay')) as unknown as React.FC)
  : (() => null);

const queryClient = new QueryClient();

function LayoutWrapper() {
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
        <Route path="/" element={<LayoutWrapper />}>
          <Route index element={<Index />} />
          <Route path="story" element={<StoryJourney />} />
          <Route path="courses" element={<Courses />} />
          <Route path="simulation" element={<AgriculturalSimulation />} />
          <Route path="games" element={<MiniGames />} />
          <Route path="facts" element={<Facts />} />
          <Route path="profile" element={<Profile />} />
          <Route path="certificates" element={<Certificates />} />
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
          {import.meta.env.DEV && (
            <Suspense>
              <DebugOverlay />
            </Suspense>
          )}
        </Suspense>
      </AppErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
