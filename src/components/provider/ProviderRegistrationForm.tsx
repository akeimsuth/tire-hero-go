
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProviderFormData {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  serviceArea: string;
  experience: string;
  vehicleInfo: string;
  insurance: string;
  password: string;
  confirmPassword: string;
}

const ProviderRegistrationForm = () => {
  const [formData, setFormData] = useState<ProviderFormData>({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    serviceArea: '',
    experience: '',
    vehicleInfo: '',
    insurance: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        toast({
          title: "Application Submitted!",
          description: "Thank you for applying! We'll review your application and get back to you within 2-3 business days.",
        });
        
        setTimeout(() => {
          navigate('/provider/dashboard');
        }, 1000);
      } else {
        toast({
          title: "Submission Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Enter your business name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <Input
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            placeholder="e.g., Mobile Tire Service"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="serviceArea">Service Area</Label>
          <Input
            id="serviceArea"
            name="serviceArea"
            value={formData.serviceArea}
            onChange={handleChange}
            placeholder="e.g., Downtown, Midtown"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Experience & Qualifications</Label>
        <Textarea
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="Describe your experience in tire services..."
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleInfo">Vehicle & Equipment Information</Label>
        <Textarea
          id="vehicleInfo"
          name="vehicleInfo"
          value={formData.vehicleInfo}
          onChange={handleChange}
          placeholder="Describe your service vehicle and equipment..."
          className="min-h-[80px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="insurance">Insurance Information</Label>
        <Input
          id="insurance"
          name="insurance"
          value={formData.insurance}
          onChange={handleChange}
          placeholder="Insurance provider and policy details"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting Application..." : "Submit Application"}
      </Button>
    </form>
  );
};

export default ProviderRegistrationForm;
