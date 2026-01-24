import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ChatBot } from "@/components/ChatBot";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import Management from "./pages/Management";
import Profile from "./pages/Profile";
import MyEmployees from "./pages/MyEmployees";
import WorkerLanding from "./pages/WorkerLanding";
import WorkerBenefits from "./pages/WorkerBenefits";
import WorkerRegistration from "./pages/WorkerRegistration";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerVerification from "./pages/WorkerVerification";
import WorkerAuth from "./pages/WorkerAuth";
import WorkerProfile from "./pages/WorkerProfile";
import WorkerBookings from "./pages/WorkerBookings";
import WorkerEarnings from "./pages/WorkerEarnings";
import WorkerHowItWorks from "./pages/WorkerHowItWorks";
import WorkerMyEmployers from "./pages/WorkerMyEmployers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:serviceId" element={<Services />} />
              
              {/* Owner protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="owner">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/management" element={
                <ProtectedRoute requiredRole="owner">
                  <Management />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute requiredRole="owner">
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/employees" element={
                <ProtectedRoute requiredRole="owner">
                  <MyEmployees />
                </ProtectedRoute>
              } />
              
              {/* Worker public routes */}
              <Route path="/for-workers" element={<WorkerLanding />} />
              <Route path="/for-workers/auth" element={<WorkerAuth />} />
              <Route path="/for-workers/benefits" element={<WorkerBenefits />} />
              <Route path="/for-workers/how-it-works" element={<WorkerHowItWorks />} />
              
              {/* Worker protected routes */}
              <Route path="/for-workers/register" element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerRegistration />
                </ProtectedRoute>
              } />
              <Route path="/for-workers/dashboard" element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/for-workers/verification" element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerVerification />
                </ProtectedRoute>
              } />
              <Route path="/for-workers/profile" element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerProfile />
                </ProtectedRoute>
              } />
              <Route path="/for-workers/bookings" element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerBookings />
                </ProtectedRoute>
              } />
              <Route path="/for-workers/earnings" element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerEarnings />
                </ProtectedRoute>
              } />
              <Route path="/for-workers/my-employers" element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerMyEmployers />
                </ProtectedRoute>
              } />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatBot />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
