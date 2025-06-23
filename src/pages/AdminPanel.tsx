import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Wrench, 
  Users, 
  DollarSign, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  Bell,
  Shield,
  Key,
  Percent,
  Eye,
  Edit
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProviderDetailsModal from "@/components/ProviderDetailsModal";
import UserManagementModal from "@/components/UserManagementModal";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  const [settings, setSettings] = useState({
    messaging: true,
    voip: true,
    pushNotifications: true,
    tipping: true,
    advertising: true,
    serviceFeePercent: 10,
    lowWalletThreshold: 20,
    disableBiddingThreshold: 10
  });

  const pendingProviders = [
    {
      id: "1",
      name: "John's Mobile Tire",
      email: "john@mobiletire.com",
      phone: "+1 (555) 123-4567",
      businessName: "John's Mobile Tire Service",
      serviceArea: "Downtown, Midtown",
      submittedDate: "2024-01-15",
      status: "pending",
      businessLicense: "BL-2024-001",
      yearsExperience: 8,
      specializations: ["Tire Repair", "Tire Replacement", "Emergency Service"]
    },
    {
      id: "2", 
      name: "Sarah Wilson",
      email: "sarah@tirefix.com",
      phone: "+1 (555) 987-6543",
      businessName: "Quick Tire Fix",
      serviceArea: "Westside, Airport",
      submittedDate: "2024-01-14",
      status: "pending",
      businessLicense: "BL-2024-002",
      yearsExperience: 5,
      specializations: ["Tire Repair", "Mobile Service"]
    }
  ];

  // Sample user data for user management
  const [users, setUsers] = useState([
    {
      id: "1",
      name: "John Customer",
      email: "john@customer.com",
      phone: "+1 (555) 111-1111",
      type: "customer" as const,
      status: "active" as const,
      joinDate: "2024-01-10",
      location: "Downtown",
      totalJobs: 12,
      rating: 4.8
    },
    {
      id: "2",
      name: "Sarah Provider",
      email: "sarah@provider.com",
      phone: "+1 (555) 222-2222",
      type: "provider" as const,
      status: "approved" as const,
      joinDate: "2024-01-05",
      businessName: "Sarah's Tire Service",
      serviceArea: "Westside",
      totalJobs: 45,
      rating: 4.9,
      isVerified: true
    }
  ]);

  const systemStats = {
    totalUsers: 1247,
    activeProviders: 89,
    totalRevenue: 45890,
    todayJobs: 34,
    avgRating: 4.6,
    reportedIssues: 3
  };

  const handleViewProvider = (provider: any) => {
    setSelectedProvider(provider);
    setIsProviderModalOpen(true);
  };

  const handleApproveProvider = (providerId: string) => {
    toast({
      title: "Provider Approved",
      description: "The provider has been successfully approved and can now accept jobs."
    });
  };

  const handleRejectProvider = (providerId: string) => {
    toast({
      title: "Provider Rejected",
      description: "The provider application has been rejected.",
      variant: "destructive"
    });
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (userData: any) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userData.id ? userData : user
      )
    );
    toast({
      title: "User Updated",
      description: "User information has been successfully updated."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">My Tire Plug Admin</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-600" />
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Providers</p>
                  <p className="text-2xl font-bold">{systemStats.activeProviders}</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${systemStats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Jobs</p>
                  <p className="text-2xl font-bold">{systemStats.todayJobs}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">{systemStats.avgRating}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reports</p>
                  <p className="text-2xl font-bold text-red-600">{systemStats.reportedIssues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="providers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="providers">Provider Approvals</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="reports">Reports & Issues</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pending Provider Applications</h3>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {pendingProviders.length} Pending Reviews
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {pendingProviders.map((provider) => (
                <Card key={provider.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">{provider.businessName}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Contact: </span>
                            <span>{provider.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email: </span>
                            <span>{provider.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone: </span>
                            <span>{provider.phone}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Service Area: </span>
                            <span>{provider.serviceArea}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Applied: {provider.submittedDate}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewProvider(provider)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Management</h3>
              <Badge variant="outline">
                {users.length} Total Users
              </Badge>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Jobs</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.type === 'customer' ? 'default' : 'secondary'}>
                            {user.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            user.status === 'active' || user.status === 'approved' ? 'default' : 'outline'
                          }>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.totalJobs}</TableCell>
                        <TableCell>{user.rating}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature Toggles */}
              <Card>
                <CardHeader>
                  <CardTitle>Feature Controls</CardTitle>
                  <CardDescription>Enable or disable platform features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="messaging">In-App Messaging</Label>
                    <Switch
                      id="messaging"
                      checked={settings.messaging}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, messaging: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voip">VoIP Calling</Label>
                    <Switch
                      id="voip"
                      checked={settings.voip}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, voip: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push">Push Notifications</Label>
                    <Switch
                      id="push"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tipping">Tipping System</Label>
                    <Switch
                      id="tipping"
                      checked={settings.tipping}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, tipping: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="advertising">Advertising Module</Label>
                    <Switch
                      id="advertising"
                      checked={settings.advertising}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, advertising: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Percent className="h-5 w-5" />
                    <span>Financial Settings</span>
                  </CardTitle>
                  <CardDescription>Configure fees and wallet thresholds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceFee">Service Fee Percentage</Label>
                    <Input
                      id="serviceFee"
                      type="number"
                      value={settings.serviceFeePercent}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, serviceFeePercent: parseInt(e.target.value) }))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lowWallet">Low Wallet Alert Threshold ($)</Label>
                    <Input
                      id="lowWallet"
                      type="number"
                      value={settings.lowWalletThreshold}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, lowWalletThreshold: parseInt(e.target.value) }))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="disableBidding">Disable Bidding Threshold ($)</Label>
                    <Input
                      id="disableBidding"
                      type="number"
                      value={settings.disableBiddingThreshold}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, disableBiddingThreshold: parseInt(e.target.value) }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* API Keys */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>API Configuration</span>
                  </CardTitle>
                  <CardDescription>Manage third-party service integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mapboxKey">Mapbox API Key</Label>
                    <Input
                      id="mapboxKey"
                      type="password"
                      placeholder="pk.eyJ1IjoiZXhhbXBsZSI..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="plivoKey">Plivo Auth ID</Label>
                    <Input
                      id="plivoKey"
                      type="password"
                      placeholder="MAXXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="oneSignalKey">OneSignal App ID</Label>
                    <Input
                      id="oneSignalKey"
                      type="password"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeKey">Stripe Secret Key</Label>
                    <Input
                      id="stripeKey"
                      type="password"
                      placeholder="sk_live_..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button>Save Settings</Button>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Issues Management</CardTitle>
                <CardDescription>Review user reports and system issues</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Reports and issues management interface would be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Revenue, user engagement, and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard with charts and metrics would be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ProviderDetailsModal
        provider={selectedProvider}
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        onApprove={handleApproveProvider}
        onReject={handleRejectProvider}
      />

      <UserManagementModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default AdminPanel;
