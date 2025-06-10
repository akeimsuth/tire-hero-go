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
import { Wrench, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, customer, user } = useAuth();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    register({...formData, role: 6 })
      .then(async (res: any) => {
        // 1) Extract the Strapi‐assigned user ID and JWT
        const userId = res?.user?.id; // correct numeric ID
        const documentId = res?.user?.documentId;
        console.log("DATA: ", res);
        await fetch(`${import.meta.env.VITE_STRAPI_URL}/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${res?.jwt}` },
          body: JSON.stringify({ role: 6 })
        });
    
        // if (userId) {
        //   try {
        //     await authAPI.updateUserAccountType(userId, "customer");
        //   } catch (updateErr) {
        //     console.error("Could not set accountType:", updateErr);
        //     toast({
        //       title: "Registration Error",
        //       description: "Account created but failed to set role. Please contact support.",
        //       variant: "destructive",
        //     });
        //     return;
        //   }
        // }
        customer(formData, documentId)
          .then((res) => {
            toast({
              title: "Registration Successful!",
              description:
                "Welcome to My Tire Plug! You can now start booking services.",
            });
            navigate("/dashboard", { replace: true });
          })
          .catch((err) => {
            toast({
              title: "Registration Failed",
              description: "Something.",
              variant: "destructive",
            });
          });
      })
      .catch((err) => {
        console.log("ERROR: ", err);
        toast({
          title: "Registration Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
          <h1 className="text-2xl font-bold text-gray-900">Join as Customer</h1>
          <p className="text-gray-600">Get tire service at your location</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Customer Account</CardTitle>
            <CardDescription>
              Start booking professional tire services
            </CardDescription>
          </CardHeader>
          <span color="red">{error}</span>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center space-y-2">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Already have an account? Sign in
          </Link>
          <br />
          <Link
            to="/"
            className="text-sm text-gray-600 hover:underline flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
