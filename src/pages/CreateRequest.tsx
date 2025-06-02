import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wrench, MapPin, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import StrapiConfig, { StrapiConfig as StrapiConfigType } from "@/components/StrapiConfig";
import { uploadImagesToStrapi } from "@/services/strapiService";
import { useToast } from "@/hooks/use-toast";

const CreateRequest = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    serviceType: '',
    tireSize: '',
    tireBrand: '',
    location: '',
    description: '',
    budget: '',
    priority: 'normal',
    scheduledTime: ''
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [strapiConfig, setStrapiConfig] = useState<StrapiConfigType>({
    apiUrl: '',
    apiToken: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const serviceTypes = [
    'Flat Tire Repair',
    'Tire Replacement',
    'Tire Rotation',
    'Wheel Balancing',
    'Valve Replacement',
    'Emergency Service'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let uploadedImageIds: number[] = [];
    
    // Upload images to Strapi if files are selected
    if (selectedFiles.length > 0) {
      if (!strapiConfig.apiUrl || !strapiConfig.apiToken) {
        toast({
          title: "Configuration Required",
          description: "Please configure your Strapi API settings to upload images.",
          variant: "destructive",
        });
        return;
      }
      
      setIsUploading(true);
      
      try {
        const uploadResult = await uploadImagesToStrapi(selectedFiles, strapiConfig);
        
        if (uploadResult.success && uploadResult.data) {
          uploadedImageIds = uploadResult.data.map((file: any) => file.id);
          toast({
            title: "Images Uploaded",
            description: `Successfully uploaded ${selectedFiles.length} image(s) to Strapi.`,
          });
        } else {
          toast({
            title: "Upload Failed",
            description: uploadResult.error || "Failed to upload images.",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "An error occurred while uploading images.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
      
      setIsUploading(false);
    }
    
    const requestData = {
      ...formData,
      imageIds: uploadedImageIds
    };
    
    console.log('Service request:', requestData);
    
    toast({
      title: "Request Submitted",
      description: "Your tire service request has been submitted successfully!",
    });
    
    // Handle request submission logic here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">My Tire Plug</span>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Tire Service</h1>
          <p className="text-gray-600">Tell us what you need and get quotes from nearby providers</p>
        </div>

        <div className="space-y-6">
          {/* Strapi Configuration */}
          <StrapiConfig onConfigChange={setStrapiConfig} />

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
                        onClick={() => setFormData({ ...formData, serviceType: type })}
                        className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                          formData.serviceType === type
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
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
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter your address or use current location"
                      className="pl-10"
                      required
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-2">
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
                  <div className="space-y-3">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range (Optional)</Label>
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
                {formData.priority === 'normal' && (
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
                )}

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading Images...' : 'Submit Request & Get Quotes'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    You'll receive bids from nearby providers within minutes
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
