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
  Plus,
  Trash2,
  AlertCircle,
  Car,

  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  FileText,
  CheckCircle,
  XCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { adminAPI, dashboardAPI } from "@/services/api";
import moment from "moment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface PendingProvider {
  id: string;
  documentId: string;
  businessName: string;
  phone: string;
  serviceArea: {
    radius: string;
  };
  user: {
    username: string;
  };
  createdAt: string;
}

const iconOptions = [
  { value: "wrench", label: "Wrench", icon: Wrench },
  { value: "car", label: "Car", icon: Car },
  { value: "shield", label: "Shield", icon: Shield },
  { value: "clock", label: "Clock", icon: Clock },
  { value: "map", label: "Map Pin", icon: MapPin },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "mail", label: "Mail", icon: Mail },
  { value: "star", label: "Star", icon: Star },
  { value: "user", label: "Users", icon: Users },
  { value: "file", label: "File", icon: FileText },
  { value: "alert", label: "Alert", icon: AlertTriangle },
  { value: "check", label: "Check", icon: CheckCircle },
  { value: "x", label: "X", icon: XCircle },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [apiKeys, setAPIKeys] = useState("");
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    totalProviders: 0,
    totalRevenue: 0,
    jobsToday: 0,
    averageRating: 0,
    reportedIssues: 0
  });
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
  const [homepageSettings, setHomepageSettings] = useState({
    heroHeading1: "",
    heroHeading2: "",
    heroParagraph: "",
    Cards: [{
      title: "",
      body: "",
      icon: "",
      price: "",
    }],
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const response = await dashboardAPI.getDashboardStats();
      setDashboardStats(response);
    };
    const fetchAPIKeys = async () => {
      const response = await dashboardAPI.getAPI();
      setAPIKeys(response?.data?.mapboxKey);
      setStripeSecretKey(response?.data?.stripeSecretKey);
    };
    const fetchHomepageSettings = async () => {
      const response = await dashboardAPI.getHome();
      setHomepageSettings({
        heroHeading1: response?.data?.heroHeading1,
        heroHeading2: response?.data?.heroHeading2,
        heroParagraph: response?.data?.heroParagraph,
        Cards: response?.data?.Cards,
      });
    };
    fetchHomepageSettings();
    fetchDashboardStats();
    fetchAPIKeys();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handlePendingProviders = async () => {
    const response = await adminAPI.getProviders();
    console.log(response);
    setPendingProviders(response.data);
  };

  const handleAPIUpdate = async (apiKeys) => {
    try {
      const response = await dashboardAPI.updateAPI({mapboxKey: apiKeys, stripeSecretKey: stripeSecretKey});
      toast({
        title: "Success",
        description: "API keys updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API keys",
        variant: "destructive",
      });
    }
  };

  const handleHeroUpdate = async () => {
    setIsUpdating(true);
    try {
      const { heroHeading1, heroHeading2, heroParagraph } = homepageSettings;
      await dashboardAPI.updateHomepage({heroHeading1, heroHeading2, heroParagraph});
      toast({
        title: "Success",
        description: "Hero section updated successfully",
      });
    } catch (error) {
      console.error('Error updating hero section:', error);
      toast({
        title: "Error",
        description: "Failed to update hero section",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleServiceCardsUpdate = async () => {
    setIsUpdating(true);
    try {
      const filteredArray = homepageSettings?.Cards.map(({ id, ...rest }) => rest);

      await dashboardAPI.updateHomepage({Cards: filteredArray});
      toast({
        title: "Success",
        description: "Service cards updated successfully",
      });
    } catch (error) {
      console.error('Error updating service cards:', error);
      toast({
        title: "Error",
        description: "Failed to update service cards",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconOptions.find(option => option.value === iconName)?.icon || Wrench;
    return <IconComponent className="h-4 w-4" />;
  };

  const addServiceCard = () => {
    setHomepageSettings(prev => ({
      ...prev,
      services: {
        ...prev.services,
        cards: [
          {
            id: Date.now(),
            title: "New Service",
            description: "Service description",
            icon: "Wrench",
            price: "0",
          },
          ...prev.services.cards,
        ],
      },
    }));
  };

  const removeServiceCard = (id: number) => {
    setHomepageSettings(prev => ({
      ...prev,
      services: {
        ...prev.services,
        cards: prev.services.cards.filter(card => card.id !== id),
      },
    }));
  };

  const handleStatusProvider = async (id: string, status: boolean) => {
    const response = await adminAPI.updateProvider(id, { isApproved: status });
    console.log(response);
    handlePendingProviders();
  };

  useEffect(() => {
    handlePendingProviders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                My Tire Plug
              </span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
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
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold">{dashboardStats?.totalCustomers?.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Providers</p>
                  <p className="text-2xl font-bold">{dashboardStats?.totalProviders?.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">${dashboardStats?.totalRevenue?.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{dashboardStats?.jobsToday}</p>
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
                  <p className="text-2xl font-bold">{dashboardStats?.averageRating}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          {/* <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reports</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardStats?.reportedIssues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card> */}
        </div>

        <Tabs defaultValue="providers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="providers">Provider Approvals</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="reports">Reports & Issues</TabsTrigger>
            {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
            <TabsTrigger value="homepage">Homepage Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pending Provider Applications</h3>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {pendingProviders.length} Pending Reviews
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {pendingProviders.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Pending Providers</AlertTitle>
                  <AlertDescription>
                    There are currently no provider applications waiting for approval.
                  </AlertDescription>
                </Alert>
              ) : (
                pendingProviders.map((provider) => (
                  <Card key={provider?.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg">{provider?.businessName}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Contact: </span>
                              <span>{provider?.user?.username}</span>
                            </div>
                            {/* <div>
                              <span className="text-gray-600">Email: </span>
                              <span>{provider?.user?email}</span>
                            </div> */}
                            <div>
                              <span className="text-gray-600">Phone: </span>
                              <span>{provider?.phone}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Service Area: </span>
                              <span>{provider?.serviceArea?.radius}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            Applied: {moment(provider.createdAt).format('MM/DD/YYYY')}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button onClick={() => handleStatusProvider(provider?.documentId, true)} size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                          {/* <Button size="sm" variant="outline">
                            Review
                          </Button> */}
                          <Button onClick={() => handleStatusProvider(provider?.documentId, false)} size="sm" variant="destructive">
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
                      type="text"
                      placeholder="pk.eyJ1IjoiZXhhbXBsZSI..."
                      value={apiKeys}
                      onChange={(e) => setAPIKeys(e.target.value)}
                    />
                  </div>
                  
                  {/* <div className="space-y-2">
                    <Label htmlFor="plivoKey">Plivo Auth ID</Label>
                    <Input
                      id="plivoKey"
                      type="password"
                      placeholder="MAXXXXXXXXXXXXXXXXXX"
                    />
                  </div> */}
                  
                  {/* <div className="space-y-2">
                    <Label htmlFor="oneSignalKey">OneSignal App ID</Label>
                    <Input
                      id="oneSignalKey"
                      type="password"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div> */}
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeKey">Stripe Secret Key</Label>
                    <Input
                      id="stripeKey"
                      type="text"
                      placeholder="sk_live_..."
                      value={stripeSecretKey}
                      onChange={(e) => setStripeSecretKey(e.target.value)}
                    />
                  </div> 
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => handleAPIUpdate(apiKeys)}>Save Settings</Button>
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

          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Customize the main hero section of your homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={homepageSettings.heroHeading1}
                      onChange={(e) =>
                        setHomepageSettings({
                          ...homepageSettings,
                            heroHeading1: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <Input
                      value={homepageSettings.heroHeading2}
                      onChange={(e) =>
                        setHomepageSettings({
                          ...homepageSettings,
                            heroHeading2: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">CTA Text</label>
                    <Input
                      value={homepageSettings.hero.ctaText}
                      onChange={(e) =>
                        setHomepageSettings({
                          ...homepageSettings,
                          hero: {
                            ...homepageSettings.hero,
                            ctaText: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CTA Link</label>
                    <Input
                      value={homepageSettings.hero.ctaLink}
                      onChange={(e) =>
                        setHomepageSettings({
                          ...homepageSettings,
                          hero: {
                            ...homepageSettings.hero,
                            ctaLink: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div> */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleHeroUpdate}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update Hero Section"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Cards</CardTitle>
                <CardDescription>
                  Manage the service cards displayed on the homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {homepageSettings?.Cards?.map((card, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <Input
                              value={card.title}
                              onChange={(e) => {
                                const newCards = homepageSettings?.Cards?.map((card, i) => 
                                  i === index ? { ...card, title: e.target.value } : card
                                ) || [];
                                
                                setHomepageSettings({
                                  ...homepageSettings,
                                  Cards: newCards,
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Input
                              value={card.body}
                              onChange={(e) => {
                                const newCards = homepageSettings?.Cards?.map((card, i) => 
                                  i === index ? { ...card, body: e.target.value } : card
                                ) || [];
                                
                                setHomepageSettings({
                                  ...homepageSettings,
                                  Cards: newCards,
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Price ($)</label>
                            <Input
                              type="number"
                              min="0"
                              value={card.price}
                              onChange={(e) => {
                                const newCards = homepageSettings?.Cards?.map((card, i) => 
                                  i === index ? { ...card, price: e.target.value } : card
                                ) || [];
                                
                                setHomepageSettings({
                                  ...homepageSettings,
                                  Cards: newCards,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newCards = homepageSettings.Cards.filter(
                                (_, i) => i !== index
                              );
                              setHomepageSettings({
                                ...homepageSettings,
                                Cards: newCards,
                              });
                            }}
                          >
                            Remove Card
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => {
                      const newCard = {
                        title: "New Service",
                        body: "Service description",
                        price: "0",
                      };
                      setHomepageSettings({
                        ...homepageSettings,
                        Cards: [newCard, ...homepageSettings.Cards],
                      });
                    }}
                  >
                    Add Service Card
                  </Button>
                  <Button 
                    onClick={handleServiceCardsUpdate}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update Service Cards"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
