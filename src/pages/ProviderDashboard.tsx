import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Wrench,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Bell,
  Settings,
  Wallet,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import socket from "../socket";
import { bidAPI, serviceRequestAPI } from "@/services/api";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import WalletComponent from "@/components/modals/WalletComponent";


const ProviderDashboard = () => {
  const { toast } = useToast();
  const { playNotificationSound } = useNotificationSound();
  const navigate = useNavigate();
  const params = useParams();
  const { logout, user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  // Once bid_selected arrives, we store that here.
  const [status, setStatus] = useState("idle");

  const activeRequests = [
    {
      id: "1",
      customer: "John Doe",
      service: "Flat Tire Repair",
      location: "123 Main St, Downtown",
      budget: "$75",
      distance: "2.3 km",
      urgency: "Normal",
      timePosted: "5 min ago",
    },
    {
      id: "2",
      customer: "Sarah Wilson",
      service: "Tire Replacement",
      location: "456 Oak Ave, Midtown",
      budget: "$150",
      distance: "4.1 km",
      urgency: "Urgent",
      timePosted: "12 min ago",
    },
  ];

  const myJobs = [
    {
      id: "3",
      customer: "Mike Johnson",
      service: "Tire Rotation",
      status: "En Route",
      earnings: "$80",
      location: "789 Pine St",
    },
    {
      id: "4",
      customer: "Lisa Chen",
      service: "Flat Repair",
      status: "Completed",
      earnings: "$60",
      rating: 5,
    },
  ];

  // const getRequest = () => {
  //   serviceRequestAPI.getAll().then(res => {
  //        setIncomingRequests(res.data);
  //       }).catch(err => {
  //         console.log("Unable to create request: ", err);
  //   })
  // }

  const logoutFunc = () => {
    logout();
    navigate("/", { replace: true });
  };
  


  useEffect(() => {
    // 1. Connect socket and join “provider_<region>` room
    //socket.auth = { userId: user.id, role: 'provider', region: user.region };
    socket.connect();
    socket.emit("join", { userId: user?.business?.documentId, role: "provider" });

    // 2. Listen for new requests
    socket.on("new_request", handleNewRequest);

    // 3. Listen for “bid_selected” if this provider’s bid was chosen
    socket.on("bid_selected", handleBidSelected);

    // 4. Listen for “job_confirmed” if customer confirms job
    socket.on("job_confirmed", handleJobConfirmed);

    // 5. (Optional) If using `bid_expired`, listen for that too
    socket.on("bid_expired", handleBidExpired);

    return () => {
      socket.off("new_request", handleNewRequest);
      socket.off("bid_selected", handleBidSelected);
      socket.off("job_confirmed", handleJobConfirmed);
      socket.off("bid_expired", handleBidExpired);
      socket.disconnect();
    };
  }, [user?.id]);

  // 2. When a new request arrives
  const handleNewRequest = (reqPayload) => {
    //console.log("📨 Provider got new_request:", reqPayload);
    playNotificationSound();
        
        // Show toast notification
        toast({
          title: "🔔 New Service Request!",
          description: `${reqPayload.customer} needs ${reqPayload.serviceType} - $${reqPayload.amount}`,
        });
    setIncomingRequests(prev => {
      // If a request with the same ID already exists, return the previous array
      if (prev.some(r => r.requestId === reqPayload.requestId)) {
        return prev;
      }
      // Otherwise, append the new request
      return [...prev, reqPayload];
    });
  };

  // 3. Provider places a bid on a request
  const placeBid = async(request) => {
    const { requestId, customerId, amount } = request;
    const bid = await bidAPI.create({
      requestId,
      provider: user?.business?.id,
      amount,
      // estimatedArrival: 5,
      bidStatus: 'pending',
      notes: "I can help with that"
    })
    const bidId = bid.data.documentId; // or uuid

    // You can do validation here, or show a UI to enter quote amount, etc.
    // const amount = parseFloat(
    //   prompt("Enter your quote amount (e.g. 30.00):", "30.00")
    // );
    // if (!amount || isNaN(amount)) return;

    const quoteDetails = `I can help with that`;

    socket.emit("new_bid", {
      bidId,
      requestId,
      customerId: customerId,
      providerId: user?.business?.documentId,
      provider: {
        name: user?.business?.businessName || 'Sampars',
        rating: user?.business?.rating,
        completedJobs: user.totalJobs,
        responseTime: 5,
        distance: 2
      },
      amount,
      status: 'pending',
      message: quoteDetails,
      submittedAt: Date.now()
    });

    // Update local UI state so this request is now “bidding”
    setIncomingRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId ? { ...r, status: "bidding", bidId } : r
      )
    );
    setStatus("bidding");
  };

  // 4. Handle “bid_selected” (means this provider’s bid was picked)
  const handleBidSelected = async(payload) => {
    const { bidId, requestId, customerId } = payload;
    //console.log("🏆 Provider: bid_selected", payload);
    toast({
      title: "Request Accepted!",
      description: "Customer has been notified. Navigate to the location to begin service.",
    });
    await bidAPI.update({
      bidStatus: 'accepted'
    },bidId);
    // Mark the request as accepted
    setIncomingRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId ? { ...r, status: "bid_accepted" } : r
      )
    );
    setSelectedRequest({ requestId, customerId });
    setStatus("Bid Accepted");
    navigate(`/provider/tracking/${requestId}`, { replace: true });
  };

  // 5. Provider “Arrive” at customer location
  const arrivedAtCustomer = () => {
    if (!selectedRequest) return;
    const { requestId } = selectedRequest;

    socket.emit("arrived", {
      requestId,
      providerId: user?.id,
      arrivedAt: new Date().toISOString(),
    });
    setStatus("arrived");
  };

  // 6. Provider “Complete Job”
  const completeJob = () => {
    if (!selectedRequest) return;
    const { requestId } = selectedRequest;

    socket.emit("job_completed", {
      requestId,
      providerId: user?.id,
      completedAt: new Date().toISOString(),
    });
    setStatus("job_completed");
  };

  const handleJobConfirmed = (payload) => {
    const { requestId, customerId, confirmedAt } = payload;
    console.log("🎉 Provider: job_confirmed", payload);

    setIncomingRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId ? { ...r, status: "complete" } : r
      )
    );
    setStatus("complete");
  };

  // 8. Handle bid_expired (if you want to show the provider their bid wasn’t selected)
  const handleBidExpired = async(payload) => {
    const { bidId, requestId } = payload;
    console.log("⌛ Provider: bid_expired", payload);
    await bidAPI.update({
      bidStatus: 'expired'
    },bidId);
    setIncomingRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? { ...r, status: "bid_expired", expiredBidId: bidId }
          : r
      )
    );
    setStatus('expired');
    // Remove the request after 5 seconds
    setTimeout(() => {
      setIncomingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      console.log(`🚀 Request ${requestId} removed after expiration.`);
    }, 5000);

  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                My Tire Plug
              </span>
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
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Today's Earnings
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Jobs Completed
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Average Rating
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Wallet Balance
                  </p>
                  <p className="text-2xl font-bold text-purple-600">$1,250</p>
                </div>
                <Wallet className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div> */}

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Available Requests</TabsTrigger>
            <TabsTrigger value="jobs">History</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Available Service Requests
              </h3>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {incomingRequests.length} New Requests
              </Badge>
            </div>

            <div className="grid gap-4">
              {incomingRequests.map((request) => (
                <Card
                  key={request.requestId}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {request.serviceType}
                        </h4>
                        <p className="text-gray-600">
                          Customer: {request.customer}
                        </p>
                      </div>
                      <Badge
                        variant={
                          status === "idle"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {request.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Budget: {request.amount}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {moment(request.timePosted).fromNow()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {request.distance}km away
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {/* <Link
                        to={`/request/${request.requestId}/bid`}
                        className="flex-1"
                      > */}
                        <Button onClick={() => placeBid(request)} className="w-full">Submit Bid</Button>
                      {/* </Link> */}
                      {/* <Button variant="outline">View Details</Button> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {incomingRequests.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Searching for customer requests...
                  </p>
                  <div className="animate-pulse">
                    <div className="flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <h3 className="text-lg font-semibold">My Previous Jobs</h3>

            <div className="grid gap-4">
              {myJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{job.service}</h4>
                        <p className="text-gray-600">
                          Customer: {job.customer}
                        </p>
                      </div>
                      <Badge
                        variant={
                          job.status === "Completed" ? "default" : "secondary"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {job.location}
                        </span>
                        <span className="text-lg font-semibold text-green-600">
                          {job.earnings}
                        </span>
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
                <CardDescription>
                  Track your income and withdraw funds
                </CardDescription>
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
              <div className="mt-6"></div>
              <WalletComponent />
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Provider Profile</CardTitle>
                <CardDescription>
                  Manage your service offerings and availability
                </CardDescription>
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
                  <Button onClick={logoutFunc} variant="outline">
                    Logout
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
