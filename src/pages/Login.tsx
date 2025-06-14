
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, User, UserCheck, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [customerData, setCustomerData] = useState({ email: '', password: '' });
  const [providerData, setProviderData] = useState({ email: '', password: '' });
  const [adminData, setAdminData] = useState({ email: '', password: '' });
  const [isCustomerSubmitting, setIsCustomerSubmitting] = useState(false);
  const [isProviderSubmitting, setIsProviderSubmitting] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCustomerSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        await login(customerData.email, customerData.password, 'customer');
        toast({
          title: "Login Successful!",
          description: "Welcome back! Redirecting to your dashboard...",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCustomerSubmitting(false);
    }
  };

  const handleProviderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProviderSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        await login(providerData.email, providerData.password, 'provider');
        toast({
          title: "Login Successful!",
          description: "Welcome back! Redirecting to your provider dashboard...",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProviderSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isValidAdmin = adminData.email === 'admin@mytireplug.com' && adminData.password === 'admin123';
      
      if (isValidAdmin) {
        await login(adminData.email, adminData.password, 'admin');
        toast({
          title: "Admin Login Successful!",
          description: "Welcome to the admin panel! Redirecting...",
        });
      } else {
        toast({
          title: "Admin Login Failed",
          description: "Invalid admin credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">My Tire Plug</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customer" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Customer</span>
            </TabsTrigger>
            <TabsTrigger value="provider" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Provider</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer">
            <Card>
              <CardHeader>
                <CardTitle>Customer Login</CardTitle>
                <CardDescription>
                  Sign in to book tire services and track your requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCustomerLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-email">Email</Label>
                      <Input 
                        id="customer-email" 
                        type="email" 
                        placeholder="Enter your email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-password">Password</Label>
                      <Input 
                        id="customer-password" 
                        type="password" 
                        placeholder="Enter your password"
                        value={customerData.password}
                        onChange={(e) => setCustomerData({...customerData, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isCustomerSubmitting}>
                      {isCustomerSubmitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </div>
                </form>
                <div className="text-center">
                  <Link to="/customer/register" className="text-sm text-blue-600 hover:underline">
                    Don't have an account? Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="provider">
            <Card>
              <CardHeader>
                <CardTitle>Provider Login</CardTitle>
                <CardDescription>
                  Sign in to manage your tire service business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleProviderLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider-email">Email</Label>
                      <Input 
                        id="provider-email" 
                        type="email" 
                        placeholder="Enter your email"
                        value={providerData.email}
                        onChange={(e) => setProviderData({...providerData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider-password">Password</Label>
                      <Input 
                        id="provider-password" 
                        type="password" 
                        placeholder="Enter your password"
                        value={providerData.password}
                        onChange={(e) => setProviderData({...providerData, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isProviderSubmitting}>
                      {isProviderSubmitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </div>
                </form>
                <div className="text-center">
                  <Link to="/provider/register" className="text-sm text-blue-600 hover:underline">
                    Don't have an account? Apply now
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>
                  Access the administrative panel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAdminLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input 
                        id="admin-email" 
                        type="email" 
                        placeholder="Enter admin email"
                        value={adminData.email}
                        onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input 
                        id="admin-password" 
                        type="password" 
                        placeholder="Enter admin password"
                        value={adminData.password}
                        onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isAdminSubmitting}>
                      {isAdminSubmitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </div>
                </form>
                <div className="text-center text-xs text-gray-500 mt-4">
                  Demo: admin@mytireplug.com / admin123
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
