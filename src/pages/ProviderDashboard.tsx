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
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import socket from "../socket";
import { bidAPI, serviceRequestAPI } from "@/services/api";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import WalletComponent from "@/components/modals/WalletComponent";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRequests, addRequest, setSelectedRequest } from '@/store/requestSlice';
import { Input } from "@/components/ui/input";
import { ServiceRequest, Bid } from "@/types/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setOnlineStatus } from "@/store/slices/providerSlice";
import { authAPI } from "@/services/api";

interface ExtendedServiceRequest extends ServiceRequest {
  distance?: string;
  timePosted?: string;
  amount?: string;
}

const ProviderDashboard = () => {
  const { toast } = useToast();
  const { playNotificationSound } = useNotificationSound();
  const navigate = useNavigate();
  const params = useParams();
  const { logout, user } = useAuth();
  const dispatch = useDispatch();
  const isOnline = useSelector((state: RootState) => state?.provider?.isOnline);
  // const requestsState = useAppSelector((state) => state?.requests);
  // const requests = requestsState?.requests || [];
  // const selectedRequest = requestsState?.selectedRequest || null;
  const [status, setStatus] = useState("idle");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bidInputs, setBidInputs] = useState<{ [key: string]: { amount: string; eta: string } }>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [jobHistory, setJobHistory] = useState<ServiceRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleOnlineStatusToggle = async () => {
    if (!user?.business?.documentId) return;

    try {
      const newStatus = !isOnline;
      await authAPI.provider(user.business.documentId, { online: newStatus });
      dispatch(setOnlineStatus(newStatus));
      toast({
        title: "Status Updated",
        description: `You are now ${newStatus ? "online" : "offline"}`,
      });
    } catch (error) {
      console.error("Error updating online status:", error);
      toast({
        title: "Error",
        description: "Failed to update online status. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    socket.connect();
    socket.emit("join", { userId: user?.business?.documentId, role: "provider" });

    // Listen for new requests
    socket.on("new_request", handleNewRequest);

    // Listen for "bid_selected" if this provider's bid was chosen
    socket.on("bid_selected", handleBidSelected);

    // Listen for "job_confirmed" if customer confirms job
    socket.on("job_confirmed", handleJobConfirmed);

    // Listen for "bid_expired"
    socket.on("bid_expired", handleBidExpired);

    return () => {
      socket.off("new_request", handleNewRequest);
      socket.off("bid_selected", handleBidSelected);
      socket.off("job_confirmed", handleJobConfirmed);
      socket.off("bid_expired", handleBidExpired);
      socket.disconnect();
    };
  }, [user?.id]);

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
      if (prev.some(r => r?.requestId === reqPayload?.requestId)) {
        return prev;
      }
      // Otherwise, append the new request
      return [...prev, reqPayload];
    });
  };

  const handleBidSelected = (data: { requestId: string; bidId: string }) => {
    toast({
      title: "🎉 Bid Accepted!",
      description: "Your bid has been accepted. Get ready to serve!",
    });
    navigate(`/provider/tracking/${data.requestId}`);
  };

  const handleJobConfirmed = (data: { requestId: string }) => {
    toast({
      title: "✅ Job Confirmed",
      description: "The customer has confirmed the job completion.",
    });
  };

  const handleBidExpired = (data: { requestId: string; bidId: string }) => {
    toast({
      title: "⏰ Bid Expired",
      description: "The bidding period for this request has ended.",
    });
  };

  const placeBid = async (customerId: string, requestId: string, amount: number, estimatedArrival: number, notes: string) => {
    try {
      const response = await bidAPI.create({
        requestId,
        provider: user?.business?.documentId,
        amount,
        estimatedArrival: estimatedArrival.toString(),
        notes,
        bidStatus: 'pending'
      });
      setStatus('pending');
      toast({
        title: "Bid Placed",
        description: "Your bid has been submitted successfully.",
      });

      // Emit socket event to notify customer
      socket.emit('new_bid', {
        requestId,
        bid: response.data,
        customerId: customerId,
        bidId: response.data.documentId,
        amount,
        estimatedArrival: estimatedArrival.toString(),
        notes,
        providerId: user?.business?.documentId,
        provider: user?.business
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchJobHistory = async () => {
      if (!user?.business?.documentId) return;
      
      setIsLoadingHistory(true);
      try {
        const response = await serviceRequestAPI.getAllByProvider(user.business.documentId);
        setJobHistory(response.data || []);
      } catch (error) {
        console.error('Error fetching job history:', error);
        toast({
          title: "Error",
          description: "Failed to load job history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchJobHistory();
  }, [user?.business?.documentId, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                My Tire Plug
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Button
                  variant={isOnline ? "default" : "outline"}
                  size="sm"
                  onClick={handleOnlineStatusToggle}
                  className={isOnline ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isOnline ? "Online" : "Offline"}
                </Button>
              </div> */}
              <Link to="/provider/profile">
                <Button variant="outline">Edit Profile</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                {incomingRequests?.length || 0} New Requests
              </Badge>
            </div>

            <div className="grid gap-4">
              {incomingRequests?.map((request) => (
                <Card
                  key={request.documentId}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {request?.serviceType}
                        </h4>
                        <p className="text-gray-600">
                          Customer: {request?.customer || 'Unknown'}
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
                          {request?.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Budget: {request?.amount || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
                      <div className="flex-1 mb-2 md:mb-0">
                        <label className="block text-sm font-medium mb-1">Your Price ($)</label>
                        <Input
                          type="number"
                          min="1"
                          value={bidInputs[request?.documentId]?.amount || ''}
                          onChange={e => setBidInputs(inputs => ({ ...inputs, [request?.documentId]: { ...inputs[request.documentId], amount: e.target.value } }))}
                          placeholder="Enter your price"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">ETA (minutes)</label>
                        <Input
                          type="number"
                          min="1"
                          value={bidInputs[request?.documentId]?.eta || ''}
                          onChange={e => setBidInputs(inputs => ({ ...inputs, [request?.documentId]: { ...inputs[request?.documentId], eta: e.target.value } }))}
                          placeholder="e.g. 15"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => placeBid(
                          request.customerId,
                          request.documentId,
                          Number(bidInputs[request.documentId]?.amount),
                          Number(bidInputs[request.documentId]?.eta),
                          "I can help with that"
                        )} 
                        className="w-full"
                      >
                        Submit Bid
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(!incomingRequests || incomingRequests.length === 0) && (
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
              {isLoadingHistory ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500 mb-4">Loading job history...</p>
                    <div className="animate-pulse">
                      <div className="flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : jobHistory.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No previous jobs found.</p>
                  </CardContent>
                </Card>
              ) : (
                jobHistory.map((job) => (
                  <Card key={job?.documentId}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{job.serviceType}</h4>
                          <p className="text-gray-600">
                            Customer: {job?.customer || 'Unknown'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            job?.tireStatus === "Completed" ? "default" : "secondary"
                          }
                        >
                          {job?.tireStatus}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {job.location.address}
                          </span>
                          <span className="text-lg font-semibold text-green-600">
                            ${job?.amount}
                          </span>
                        </div>

                        {job?.tireStatus === "In Progress" && (
                          <Link to={`/provider/tracking/${job?.documentId}`}>
                            <Button>Track Job</Button>
                          </Link>
                        )}

                        {job?.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm">{job?.rating}/5</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{moment(job.createdAt).format('MMM D, YYYY h:mm A')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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

                {/* <div className="flex space-x-4">
                  <Button className="flex-1">Withdraw Funds</Button>
                  <Button variant="outline">View Statements</Button>
                </div> */}
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
                  {/* <Button>Edit Profile</Button> */}
                    <Button variant="outline">Update Services</Button>
                    <Button variant="outline">Set Availability</Button>
                  <Link to="/provider/settings">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Stripe Settings
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="outline">
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
