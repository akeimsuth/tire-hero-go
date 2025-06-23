
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, MapPin, Shield, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'customer' | 'provider';
  status: 'active' | 'inactive' | 'pending' | 'approved';
  joinDate: string;
  location?: string;
  businessName?: string;
  serviceArea?: string;
  totalJobs?: number;
  rating?: number;
  isVerified?: boolean;
}

interface UserManagementModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserData) => void;
}

const UserManagementModal = ({ user, isOpen, onClose, onSave }: UserManagementModalProps) => {
  const [editedUser, setEditedUser] = useState<UserData | null>(null);

  // Update editedUser when user prop changes
  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
    }
  }, [user]);

  const handleSave = () => {
    if (editedUser) {
      onSave(editedUser);
      onClose();
    }
  };

  const updateField = (field: keyof UserData, value: any) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value });
    }
  };

  if (!editedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Edit {editedUser.type === 'customer' ? 'Customer' : 'Provider'} Details</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
            <div className="flex-1">
              <Badge variant={editedUser.type === 'customer' ? 'default' : 'secondary'} className="mb-2">
                {editedUser.type}
              </Badge>
              <Badge variant={
                editedUser.status === 'active' || editedUser.status === 'approved' ? 'default' : 
                editedUser.status === 'pending' ? 'outline' : 'destructive'
              }>
                {editedUser.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editedUser.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editedUser.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editedUser.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Provider-specific fields */}
          {editedUser.type === 'provider' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Provider Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={editedUser.businessName || ''}
                      onChange={(e) => updateField('businessName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceArea">Service Area</Label>
                    <Input
                      id="serviceArea"
                      value={editedUser.serviceArea || ''}
                      onChange={(e) => updateField('serviceArea', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Account Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Account Settings</h4>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Account Status</Label>
                <p className="text-sm text-gray-600">Enable or disable user account</p>
              </div>
              <Switch
                checked={editedUser.status === 'active' || editedUser.status === 'approved'}
                onCheckedChange={(checked) => 
                  updateField('status', checked ? 'active' : 'inactive')
                }
              />
            </div>
            
            {editedUser.type === 'provider' && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Verified Provider</Label>
                  <p className="text-sm text-gray-600">Mark provider as verified</p>
                </div>
                <Switch
                  checked={editedUser.isVerified || false}
                  onCheckedChange={(checked) => updateField('isVerified', checked)}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Statistics */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{editedUser.totalJobs || 0}</p>
                <p className="text-sm text-gray-600">Total Jobs</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{editedUser.rating || 'N/A'}</p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{editedUser.joinDate}</p>
                <p className="text-sm text-gray-600">Join Date</p>
              </div>
              <div>
                <Badge variant={editedUser.isVerified ? 'default' : 'outline'}>
                  {editedUser.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementModal;
