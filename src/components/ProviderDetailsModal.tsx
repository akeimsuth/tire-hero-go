
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Calendar, Shield, User } from "lucide-react";

interface ProviderDetailsModalProps {
  provider: {
    id: string;
    name: string;
    email: string;
    phone: string;
    businessName: string;
    serviceArea: string;
    submittedDate: string;
    status: string;
    businessLicense?: string;
    yearsExperience?: number;
    specializations?: string[];
    profileImage?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (providerId: string) => void;
  onReject: (providerId: string) => void;
}

const ProviderDetailsModal = ({ provider, isOpen, onClose, onApprove, onReject }: ProviderDetailsModalProps) => {
  if (!provider) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Provider Application Details</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {provider.profileImage ? (
                <img src={provider.profileImage} alt={provider.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{provider.businessName}</h3>
              <p className="text-gray-600">{provider.name}</p>
              <Badge variant={provider.status === 'pending' ? 'outline' : 'secondary'} className="mt-2">
                {provider.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{provider.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{provider.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{provider.serviceArea}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Applied: {provider.submittedDate}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Business Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Business Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provider.businessLicense && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Business License</label>
                  <p className="text-sm">{provider.businessLicense}</p>
                </div>
              )}
              {provider.yearsExperience && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                  <p className="text-sm">{provider.yearsExperience} years</p>
                </div>
              )}
            </div>
            
            {provider.specializations && provider.specializations.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {provider.specializations.map((spec, index) => (
                    <Badge key={index} variant="outline">{spec}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onReject(provider.id);
                onClose();
              }}
            >
              Reject
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                onApprove(provider.id);
                onClose();
              }}
            >
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderDetailsModal;
