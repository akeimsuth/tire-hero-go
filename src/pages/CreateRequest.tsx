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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wrench, Upload, MapPin, Clock, DollarSign, Banknote, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { customerAPI, serviceRequestAPI } from "@/services/api";
import PhotoUpload from "@/components/modals/PhotoUpload";
import { MyFile, ServiceRequest, ServiceType } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { uploadImagesToStrapi } from "@/services/ImageService";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from '@/store/hooks';
import { addRequest } from '@/store/requestSlice';
import socket from '@/socket';
// import { CardElement } from "@stripe/stripe-js";
import { Stripe } from "@stripe/stripe-js";
import StripeElementsWrapper from "@/components/modals/StripeElementsWrapper";

const CreateRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: "" });
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<Stripe | null>(null);

  const [formData, setFormData] = useState({
    serviceType: "",
    tireStatus: "Bids Open",
    tireSize: "",
    tireBrand: "",
    address: "",
    lat: 0,
    lng: 0,
    description: "",
    budget: 0,
    priority: "normal",
    scheduledTime: "",
  });

  const serviceTypes = [
    "Flat Tire Repair",
    "Tire Replacement",
    "Tire Rotation",
    "Wheel Balancing",
    "Valve Replacement",
    "Emergency Service",
  ];

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude, address: "" });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        setFormData((prev) => ({ ...prev, lat: data.lat, lng: data.lon, address: data.display_name }));
      },
      (error) => console.error("Error getting location:", error),
      { enableHighAccuracy: true }
    );
  };

  // New function to handle the actual service request creation
  const createServiceRequest = async () => {
    setIsSubmitting(true);
    let uploadedImageIds: number[] = [];
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadImagesToStrapi(selectedFiles);
        if (uploadResult.success && uploadResult.data) {
          uploadedImageIds = uploadResult.data.map((file: MyFile) => file.id);
        } else {
          toast({
            title: "Upload Failed",
            description: uploadResult.error || "Failed to upload images.",
            variant: "destructive",
          });
          setIsUploading(false);
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "An error occurred while uploading images.",
          variant: "destructive",
        });
        setIsUploading(false);
        setIsSubmitting(false);
        return;
      }
      setIsUploading(false);
    }
    try {
      const response = await serviceRequestAPI.create(
        { 
          ...formData,
          location: {
            address: formData.address,
            lat: formData.lat,
            lng: formData.lng,
          },
          photos: uploadedImageIds[0],
          customer: user?.customer?.documentId,
          status: "Bids Open",
          //timePosted: new Date().toISOString(),
        },
        user?.customer?.documentId
      );

      // Add the new request to Redux store
      dispatch(addRequest(response.data));



      toast({
        title: "Request Created",
        description: "Your service request has been created successfully.",
      });

      navigate(`/bidding/${response.data.documentId}`);
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // handleSubmit now only opens the payment modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    await createServiceRequest();
  }

  // handlePaymentMethodConfirm will call createServiceRequest after payment is confirmed
  const handlePaymentMethodConfirm = async () => {
    try {
      setIsProcessingPayment(true);
      await customerAPI.update(user?.customer?.documentId, {
        paymentMethod: paymentMethod,
      });
      await createServiceRequest();
    } catch (error) {
      setIsProcessingPayment(false);
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
    }
    // if (paymentMethod === "card") {
    //   setShowPaymentModal(false);
    // } else {
    //   await createServiceRequest();
    // }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const logoutFunc = () => {
    logout();
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              My Tire Plug
            </span>
          </div>
            <Button onClick={() => logoutFunc()} variant="outline">Logout</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Request Tire Service
          </h1>
          <p className="text-gray-600">
            Tell us what you need and get quotes from nearby providers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Provide details about your tire service needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type */}
              <div className="space-y-3">
                <Label>Service Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, serviceType: type })
                      }
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        formData.serviceType === type
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tire Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tireSize">Tire Size</Label>
                  <Input
                    id="tireSize"
                    name="tireSize"
                    value={formData.tireSize}
                    onChange={handleChange}
                    placeholder="e.g., 225/65R17"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tireBrand">Tire Brand (Optional)</Label>
                  <Input
                    id="tireBrand"
                    name="tireBrand"
                    value={formData.tireBrand}
                    onChange={handleChange}
                    placeholder="e.g., Michelin, Goodyear"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Service Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    name="location"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address or use current location"
                    className="pl-10"
                    required
                  />
                </div>
                <Button
                  onClick={handleGetLocation}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Use Current Location
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Problem Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue with your tire..."
                  rows={3}
                  required
                />
              </div>

              {/* Photo Upload */}
              {/* <div className="space-y-2">
                <Label>Photos (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload photos of your tire
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Choose Files
                  </Button>
                </div>
              </div> */}
              <div className="space-y-2">
                  <Label>Photos (Optional)</Label>
                  <PhotoUpload 
                    onFilesChange={setSelectedFiles}
                    maxFiles={5}
                    maxFileSize={5}
                  />
                </div>
              {/* Priority & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div className="space-y-3">
                  <Label>Priority</Label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: 'normal' })}
                      className={`w-full p-3 border rounded-lg text-left ${
                        formData.priority === 'normal'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Normal</p>
                          <p className="text-sm text-gray-600">Within 2-4 hours</p>
                        </div>
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: 'urgent' })}
                      className={`w-full p-3 border rounded-lg text-left ${
                        formData.priority === 'urgent'
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-700">Urgent</p>
                          <p className="text-sm text-red-600">ASAP (+$15 fee)</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">+$15</Badge>
                      </div>
                    </button>
                  </div>
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="e.g., $50-100"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Help providers understand your budget expectations
                  </p>
                </div>
              </div>

              {/* Scheduled Time */}
              {/* {formData.priority === 'normal' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Preferred Time (Optional)</Label>
                  <Input
                    id="scheduledTime"
                    name="scheduledTime"
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                  />
                </div>
              )} */}

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  Submit Request & Get Quotes
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You'll receive bids from nearby providers within minutes
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Selection Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              How would you like to pay for your tire service?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="cash" id="cash" onClick={() => setPaymentMethod("cash")} />
                <Label htmlFor="cash" className="flex items-center space-x-3 flex-1 cursor-pointer">
                  <Banknote className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Pay with Cash</p>
                    <p className="text-sm text-gray-600">Pay the provider directly in cash</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="card" id="card" onClick={() => setPaymentMethod("card")} />
                <Label htmlFor="card" className="flex items-center space-x-3 flex-1 cursor-pointer">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Pay with Card</p>
                    <p className="text-sm text-gray-600">Secure payment via Stripe (+$10 processing fee)</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentModal(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentMethodConfirm}
              disabled={!paymentMethod || isProcessingPayment}
            >
              {isProcessingPayment ? "Processing..." : "Continue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* { paymentMethod === "card" && (
      <StripeElementsWrapper
        total={formData.budget}
        onPaymentSuccess={handlePaymentSuccess}
      />
      )} */}
    </div>
  );
};

export default CreateRequest;
