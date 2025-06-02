
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Wrench, ArrowLeft, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/services/api";

const ProviderRegister = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { register, provider, user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    serviceRadius: '',
    experience: '',
    hourlyRate: '',
    vehicleDetails: '',
    languages: '',
    serviceTypes: [] as string[]
  });

  const serviceTypes = [
    'Flat Tire Repair',
    'Tire Replacement',
    'Tire Rotation',
    'Wheel Balancing',
    'Valve Replacement',
    'Emergency Service'
  ];

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

    if (formData.serviceTypes.length === 0) {
      toast({
        title: "Service Types Required",
        description: "Please select at least one service type you offer.",
        variant: "destructive",
      });
      return;
    }
    register(formData).then(async(res: any) =>{
      console.log('Provider data:', res);
      //await authAPI.updateUserAccountType(res.user?.documentId, "provider");
      provider(formData, res?.user?.documentId).then((providerRes) =>{
        toast({
          title: "Application Submitted!",
          description: "Your provider application has been submitted successfully. We'll review it within 24 hours.",
        });
        navigate('/provider/dashboard', { replace: true });
      }).catch(err => {
        toast({
          title: "Application Failed",
          description: "Something went wrong. Please check your information and try again.",
          variant: "destructive",
        });
      })
      }).catch( err => {
        console.log('Register auth is not authenticated: ', err);
      })
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleServiceTypeChange = (serviceType: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        serviceTypes: [...formData.serviceTypes, serviceType]
      });
    } else {
      setFormData({
        ...formData,
        serviceTypes: formData.serviceTypes.filter(type => type !== serviceType)
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">My Tire Plug</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Become a Provider</h1>
          <p className="text-gray-600">Join our network of tire service professionals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provider Application</CardTitle>
            <CardDescription>
              Your application will be reviewed by our team. You'll be notified within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
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
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Years in tire service"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Your business name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                    <Input
                      id="serviceRadius"
                      name="serviceRadius"
                      type="number"
                      value={formData.serviceRadius}
                      onChange={handleChange}
                      placeholder="How far you travel"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      placeholder="Your hourly rate"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages Spoken</Label>
                    <Input
                      id="languages"
                      name="languages"
                      value={formData.languages}
                      onChange={handleChange}
                      placeholder="e.g., English, Spanish"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleDetails">Vehicle Details</Label>
                  <Textarea
                    id="vehicleDetails"
                    name="vehicleDetails"
                    value={formData.vehicleDetails}
                    onChange={handleChange}
                    placeholder="Describe your service vehicle(s)"
                    rows={3}
                  />
                </div>
              </div>

              {/* Services Offered */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Services You Offer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {serviceTypes.map((serviceType) => (
                    <div key={serviceType} className="flex items-center space-x-2">
                      <Checkbox
                        id={serviceType}
                        checked={formData.serviceTypes.includes(serviceType)}
                        onCheckedChange={(checked) => 
                          handleServiceTypeChange(serviceType, checked as boolean)
                        }
                      />
                      <Label htmlFor={serviceType} className="text-sm font-normal">
                        {serviceType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              {/* <div className="space-y-4">
                <h3 className="text-lg font-semibold">Required Documents</h3>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload Liability Insurance</p>
                    <Button variant="outline" size="sm">Choose File</Button>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload Business License</p>
                    <Button variant="outline" size="sm">Choose File</Button>
                  </div>
                </div>
              </div> */}

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Security</h3>
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
              </div>

              <Button type="submit" className="w-full">
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center space-y-2">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Already have an account? Sign in
          </Link>
          <br />
          <Link to="/" className="text-sm text-gray-600 hover:underline flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;
