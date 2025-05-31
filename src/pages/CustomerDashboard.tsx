
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, MapPin, Clock, Phone, MessageSquare, Star } from "lucide-react";
import { Link } from "react-router-dom";

const CustomerDashboard = () => {
  // Mock data - replace with real data
  const activeRequests = [
    {
      id: 1,
      serviceType: "Flat Tire Repair",
      location: "123 Main St, Downtown",
      status: "Bids Open",
      bidsCount: 3,
      createdAt: "10 minutes ago"
    }
  ];

  const recentJobs = [
    {
      id: 1,
      serviceType: "Tire Replacement",
      provider: "Mike's Mobile Tire",
      location: "456 Oak Ave",
      completedAt: "2 days ago",
      rating: 5,
      cost: 120
    },
    {
      id: 2,
      serviceType: "Flat Tire Repair",
      provider: "Quick Fix Tires",
      location: "789 Pine St",
      completedAt: "1 week ago",
      rating: 4,
      cost: 45
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Bids Open":
        return "bg-blue-100 text-blue-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "En Route":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, John!</span>
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Action */}
        <div className="mb-8">
          <Link to="/request">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" />
              Request Tire Service
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Requests</CardTitle>
                <CardDescription>
                  Track your current tire service requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeRequests.length > 0 ? (
                  <div className="space-y-4">
                    {activeRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{request.serviceType}</h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {request.location}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              {request.createdAt}
                            </p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        
                        {request.status === "Bids Open" && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-600">
                              {request.bidsCount} bids received
                            </span>
                            <Link to={`/request/${request.id}/bids`}>
                              <Button size="sm">View Bids</Button>
                            </Link>
                          </div>
                        )}
                        
                        {request.status === "Accepted" && (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Link to={`/request/${request.id}/track`}>
                              <Button size="sm">Track Location</Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No active requests</p>
                    <Link to="/request">
                      <Button>Create Your First Request</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>
                  Your completed tire services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{job.serviceType}</h3>
                          <p className="text-sm text-gray-600">{job.provider}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </p>
                          <p className="text-sm text-gray-500">{job.completedAt}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < job.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="font-semibold">${job.cost}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet */}
            <Card>
              <CardHeader>
                <CardTitle>Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">$25.00</p>
                  <p className="text-sm text-gray-500 mb-4">Available Balance</p>
                  <Button className="w-full mb-2">Add Funds</Button>
                  <Button variant="outline" className="w-full">Transaction History</Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Services</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold">4.8★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Money Saved</span>
                  <span className="font-semibold text-green-600">$340</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
