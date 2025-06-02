import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProviderTracking from "./pages/ProviderTracking";

const queryClient = new QueryClient();
const App = ({ user }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            <Route path="/provider/register" element={<ProviderRegister />} />

            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/request" element={<CreateRequest />} />
            <Route path="/request/:id/bids" element={<BiddingInterface />} />
            <Route path="/tracking/:id" element={<TrackingInterface />} />
            <Route
              path="/provider/tracking/:id"
              element={<ProviderTracking />}
            />
            <Route path="/payment/:id" element={<PaymentFlow />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
