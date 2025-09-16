import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import StoryJourney from "./pages/StoryJourney";
import Courses from "./pages/Courses";
import { AgriculturalSimulation } from "@/pages/AgriculturalSimulation";
import MiniGames from "./pages/MiniGames";
import Facts from "./pages/Facts";
import Profile from "./pages/Profile";
import Certificates from "./pages/Certificates";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useAuth } from "@/hooks/useAuth";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
