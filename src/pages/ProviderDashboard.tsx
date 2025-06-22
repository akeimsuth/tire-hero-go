import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Bell,
  User,
  Calendar,
  TrendingUp,
  Wrench
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import ProviderApprovalWarning from "@/components/ProviderApprovalWarning";

const ProviderDashboard = () => {
  // Mock provider approval status - in real app this would come from API/auth context
  const [isApproved, setIsApproved] = useState(false);
  const [providerName] = useState("John Provider");

  const [activeRequests, setActiveRequests] = useState([
    {
      id: "REQ-001",
      customerName: "John Smith",
      serviceType: "Flat Tire Repair",
      location: "123 Main St, Downtown",
      timeRequested: "2 hours ago",
      urgency: "high",
      estimatedPay: 75,
      distance: "2.3 km",
      description: "Front left tire has a nail puncture, needs immediate repair"
    },
    {
      id: "REQ-002", 
      customerName: "Sarah Johnson",
      serviceType: "Tire Replacement",
      location: "456 Oak Ave, Midtown",
      timeRequested: "45 minutes ago",
      urgency: "medium",
      estimatedPay: 120,
      distance: "4.1 km",
      description: "Need to replace worn rear tire, have spare available"
    }
  ]);

  const [completedJobs] = useState([
    {
      id: "JOB-001",
      customerName: "Mike Wilson",
      serviceType: "Tire Rotation",
      completedDate: "2024-01-15",
      earnings: 60,
      rating: 5,
      location: "789 Pine St"
    },
    {
      id: "JOB-002",
      customerName: "Lisa Brown",
      serviceType: "Flat Tire Repair", 
      completedDate: "2024-01-14",
      earnings: 75,
      rating: 4,
      location: "321 Elm St"
    }
  ]);

  const [earnings] = useState({
    today: 135,
    week: 420,
    month: 1680
  });

  const { toast } = useToast();
  const { playNotificationSound } = useNotificationSound();

  // If provider is not approved, show warning screen
  if (!isApproved) {
    return <ProviderApprovalWarning providerName={providerName} />;
  }

  // Simulate new request notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random new request (10% chance every 10 seconds)
      if (Math.random() < 0.1) {
        const newRequest = {
          id: `REQ-${String(Date.now()).slice(-3)}`,
          customerName: ["Alex Chen", "Maria Garcia", "David Lee", "Emma Davis"][Math.floor(Math.random() * 4)],
          serviceType: ["Flat Tire Repair", "Tire Replacement", "Emergency Service"][Math.floor(Math.random() * 3)],
          location: ["Downtown Area", "Westside Plaza", "North District", "South Mall"][Math.floor(Math.random() * 4)],
          timeRequested: "Just now",
          urgency: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as "high" | "medium" | "low",
          estimatedPay: 50 + Math.floor(Math.random() * 100),
          distance: `${(Math.random() * 5 + 1).toFixed(1)} km`,
          description: "New tire service request"
        };

        setActiveRequests(prev => [newRequest, ...prev]);
        
        // Play notification sound
        playNotificationSound();
        
        // Show toast notification
        toast({
          title: "🔔 New Service Request!",
          description: `${newRequest.customerName} needs ${newRequest.serviceType} - $${newRequest.estimatedPay}`,
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [playNotificationSound, toast]);

  const handleAcceptRequest = (requestId: string) => {
    setActiveRequests(prev => prev.filter(req => req.id !== requestId));
    toast({
      title: "Request Accepted!",
      description: "Customer has been notified. Navigate to the location to begin service.",
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';  
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <Wrench className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">My Tire Plug</span>
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold text-gray-900">Provider Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earnings.today}</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRequests.length}</div>
              <p className="text-xs text-muted-foreground">Waiting for response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedJobs.length}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">⭐⭐⭐⭐⭐</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">
              Active Requests ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {activeRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Requests</h3>
                    <p className="text-gray-600">New service requests will appear here. Stay tuned!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              activeRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{request.serviceType}</span>
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency} priority
                          </Badge>
                        </CardTitle>
                        <CardDescription>Request #{request.id}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${request.estimatedPay}</div>
                        <div className="text-sm text-gray-500">{request.distance} away</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{request.customerName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{request.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Requested {request.timeRequested}</span>
                      </div>
                      
                      <p className="text-sm">{request.description}</p>
                      
                      <div className="flex space-x-3 pt-4">
                        <Button 
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex-1"
                        >
                          Accept Request
                        </Button>
                        <Button variant="outline" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{job.serviceType}</h3>
                      <p className="text-sm text-gray-600">Customer: {job.customerName}</p>
                      <p className="text-sm text-gray-600">Location: {job.location}</p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < job.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({job.rating}/5)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">${job.earnings}</div>
                      <div className="text-sm text-gray-500">{job.completedDate}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="earnings">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Today</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">${earnings.today}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>This Week</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">${earnings.week}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>This Month</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">${earnings.month}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderDashboard;
