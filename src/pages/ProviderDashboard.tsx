
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wrench, MapPin, Clock, DollarSign, Star, Bell, Settings, Wallet, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const ProviderDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  
  const activeRequests = [
    {
      id: "1",
      customer: "John Doe",
      service: "Flat Tire Repair",
      location: "123 Main St, Downtown",
      budget: "$75",
      distance: "2.3 km",
      urgency: "Normal",
      timePosted: "5 min ago"
    },
    {
      id: "2", 
      customer: "Sarah Wilson",
      service: "Tire Replacement",
      location: "456 Oak Ave, Midtown",
      budget: "$150",
      distance: "4.1 km",
      urgency: "Urgent",
      timePosted: "12 min ago"
    }
  ];

  const myJobs = [
    {
      id: "3",
      customer: "Mike Johnson",
      service: "Tire Rotation",
      status: "En Route",
      earnings: "$80",
      location: "789 Pine St"
    },
    {
      id: "4",
      customer: "Lisa Chen",
      service: "Flat Repair",
      status: "Completed",
      earnings: "$60",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">My Tire Plug</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Button
                  variant={isOnline ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsOnline(!isOnline)}
                  className={isOnline ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isOnline ? "Online" : "Offline"}
                </Button>
              </div>
              
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>TP</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-600">$245</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jobs Completed</p>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">4.8</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                  <p className="text-2xl font-bold text-purple-600">$1,250</p>
                </div>
                <Wallet className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Available Requests</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Available Service Requests</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {activeRequests.length} New Requests
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {activeRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{request.service}</h4>
                        <p className="text-gray-600">Customer: {request.customer}</p>
                      </div>
                      <Badge variant={request.urgency === "Urgent" ? "destructive" : "secondary"}>
                        {request.urgency}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{request.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Budget: {request.budget}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{request.timePosted}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{request.distance} away</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Link to={`/request/${request.id}/bids`} className="flex-1">
                        <Button className="w-full">Submit Bid</Button>
                      </Link>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <h3 className="text-lg font-semibold">My Current Jobs</h3>
            
            <div className="grid gap-4">
              {myJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{job.service}</h4>
                        <p className="text-gray-600">Customer: {job.customer}</p>
                      </div>
                      <Badge variant={job.status === "Completed" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{job.location}</span>
                        <span className="text-lg font-semibold text-green-600">{job.earnings}</span>
                      </div>
                      
                      {job.status === "En Route" && (
                        <Link to="/tracking">
                          <Button>Track Job</Button>
                        </Link>
                      )}
                      
                      {job.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm">{job.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Track your income and withdraw funds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-green-600">$1,245</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-green-600">$4,890</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-purple-600">$1,250</p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button className="flex-1">Withdraw Funds</Button>
                  <Button variant="outline">View Statements</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Provider Profile</CardTitle>
                <CardDescription>Manage your service offerings and availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-4">
                  <Button>Edit Profile</Button>
                  <Button variant="outline">Update Services</Button>
                  <Button variant="outline">Set Availability</Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
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

export default ProviderDashboard;
