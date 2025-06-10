import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Wrench, User, UserCheck, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading, login } = useAuth();
  const { user } = useAppSelector((state) => state.auth);
  const [isCustomer, setIsCustomer] = useState(true);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState({ email: "", password: "" });
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle navigation after successful login
  useEffect(() => {
    if (!isLoading && user) {
      console.log('User role:', user.role); // Debug log
      if (user.role === 'customer') {
        navigate("/dashboard", { replace: true });
      } else if (user.role === 'provider') {
        navigate("/provider/dashboard", { replace: true });
      } else if (user.role === 'admin') {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });
    } catch (err) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminSubmitting(true);

    login(formData.email, formData.password)
      .then((res) => {
        toast({
          title: "Login Successful!",
          description: "Welcome back!",
        });
        navigate("/admin", { replace: true });
      })
      .catch((err) => {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsAdminSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              My Tire Plug
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Tabs value={isCustomer ? "customer" : "provider"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="customer"
              onClick={() => setIsCustomer(true)}
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Customer</span>
            </TabsTrigger>
            <TabsTrigger
              value="provider"
              onClick={() => setIsCustomer(false)}
              className="flex items-center space-x-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>Provider</span>
            </TabsTrigger>
            {/* <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </TabsTrigger> */}
          </TabsList>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Login</CardTitle>
                  <CardDescription>
                    Sign in to book tire services and track your requests
                  </CardDescription>
                </CardHeader>
                <span color="red">{error}</span>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <Input
                      id="customer-password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <Button className="w-full">Sign In</Button>
                  <div className="text-center">
                    <Link
                      to="/customer/register"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Don't have an account? Sign up
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <TabsContent value="provider">
              <Card>
                <CardHeader>
                  <CardTitle>Provider Login</CardTitle>
                  <CardDescription>
                    Sign in to manage your tire service business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label style={{ color: "red" }}>{error}</Label>
                  <div className="space-y-2">
                    <Label htmlFor="provider-email">Email</Label>
                    <Input
                      id="provider-email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-password">Password</Label>
                    <Input
                      id="provider-password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <Button className="w-full">Sign In</Button>
                  <div className="text-center">
                    <Link
                      to="/provider/register"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Don't have an account? Apply now
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
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
                        onChange={(e) =>
                          setAdminData({ ...adminData, email: e.target.value })
                        }
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
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isAdminSubmitting}
                    >
                      {isAdminSubmitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </div>
                </form>
                {/* <div className="text-center text-xs text-gray-500 mt-4">
                  Demo: admin@mytireplug.com / admin123
                </div> */}
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
