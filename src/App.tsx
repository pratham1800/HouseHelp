import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ChatBot } from "@/components/ChatBot";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import Management from "./pages/Management";
import Profile from "./pages/Profile";
import WorkerLanding from "./pages/WorkerLanding";
import WorkerBenefits from "./pages/WorkerBenefits";
import WorkerRegistration from "./pages/WorkerRegistration";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerVerification from "./pages/WorkerVerification";
import WorkerAuth from "./pages/WorkerAuth";
import WorkerProfile from "./pages/WorkerProfile";
import WorkerEarnings from "./pages/WorkerEarnings";
import WorkerHowItWorks from "./pages/WorkerHowItWorks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:serviceId" element={<Services />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/management" element={<Management />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/for-workers" element={<WorkerLanding />} />
            <Route path="/for-workers/auth" element={<WorkerAuth />} />
            <Route path="/for-workers/benefits" element={<WorkerBenefits />} />
            <Route path="/for-workers/register" element={<WorkerRegistration />} />
            <Route path="/for-workers/dashboard" element={<WorkerDashboard />} />
            <Route path="/for-workers/verification" element={<WorkerVerification />} />
            <Route path="/for-workers/profile" element={<WorkerProfile />} />
            <Route path="/for-workers/earnings" element={<WorkerEarnings />} />
            <Route path="/for-workers/how-it-works" element={<WorkerHowItWorks />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
