import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
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
import AuthMiddleware from "@/components/AuthMiddleware";
import ProviderTracking from "./pages/ProviderTracking";
import ProviderSettings from "./pages/ProviderSettings";
import ProviderComplete from './pages/ProviderComplete';
import ProviderProfile from "@/pages/ProviderProfile";

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <AuthProvider>
                <AuthMiddleware>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/customer/register" element={<CustomerRegister />} />
                  <Route path="/provider/register" element={<ProviderRegister />} />
                  <Route
                    path="/dashboard"
                    element={
                      <AuthMiddleware>
                        <CustomerDashboard />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/provider/dashboard"
                    element={
                      <AuthMiddleware>
                        <ProviderDashboard />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/create-request"
                    element={
                      <AuthMiddleware>
                        <CreateRequest />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/bidding/:id"
                    element={
                      <AuthMiddleware>
                        <BiddingInterface />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/tracking/:id"
                    element={
                      <AuthMiddleware>
                        <TrackingInterface />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/payment/:id"
                    element={
                      <AuthMiddleware>
                        <PaymentFlow />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AuthMiddleware>
                        <AdminPanel />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/provider/tracking/:id"
                    element={
                      <AuthMiddleware>
                        <ProviderTracking />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/provider/settings"
                    element={
                      <AuthMiddleware>
                        <ProviderSettings />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/provider/complete"
                    element={
                      <AuthMiddleware>
                        <ProviderComplete />
                      </AuthMiddleware>
                    }
                  />
                  <Route
                    path="/provider/profile"
                    element={
                      <AuthMiddleware>
                        <ProviderProfile />
                      </AuthMiddleware>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </AuthMiddleware>
              </AuthProvider>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
