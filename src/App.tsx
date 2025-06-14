
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthMiddleware from "@/components/AuthMiddleware";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CustomerRegister from "./pages/CustomerRegister";
import ProviderRegister from "./pages/ProviderRegister";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import CreateRequest from "./pages/CreateRequest";
import BiddingInterface from "./pages/BiddingInterface";
import TrackingInterface from "./pages/TrackingInterface";
import PaymentFlow from "./pages/PaymentFlow";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AuthMiddleware>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/customer/register" element={<CustomerRegister />} />
              <Route path="/provider/register" element={<ProviderRegister />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/request" element={<CreateRequest />} />
              <Route path="/request/:id/bids" element={<BiddingInterface />} />
              <Route path="/tracking" element={<TrackingInterface />} />
              <Route path="/payment" element={<PaymentFlow />} />
              <Route path="/admin" element={<AdminPanel />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthMiddleware>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
