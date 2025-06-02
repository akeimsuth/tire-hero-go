import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Wrench,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  Clock,
  Star,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "../socket";
import { useAuth } from "@/context/AuthContext";
import moment from "moment";
import { serviceRequestAPI } from "@/services/api";
import AnimatedRouteMap from "@/components/animated-map";

const ProviderTracking = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState(null);
  // Once bid_selected arrives, we store that here.
  const [status, setStatus] = useState(["idle"]);
  const [client, setClient] = useState({
    customer: {
      documentId: "",
      fullName: "",
    },
    serviceType: "",
    location: {
      address: "",
    },
    budget: "",
  });
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [jobStatus, setJobStatus] = useState("En Route");
  const [estimatedArrival, setEstimatedArrival] = useState("12 minutes");
  const customer = { lat: 18.0066873, lng: -76.7913445 }; // New Kingston
  const provider = { lat: 18.0088873, lng: -76.7934445 }; // ~1km away

  // Simulate real-time updates
  //   useEffect(() => {
  //     const interval = setInterval(() => {
  //       const statuses = ["En Route", "Arrived", "In Service"];
  //       const currentIndex = statuses.indexOf(jobStatus);
  //       if (currentIndex < statuses.length - 1) {
  //         setTimeout(() => {
  //           setJobStatus(statuses[currentIndex + 1]);
  //           if (statuses[currentIndex + 1] === "Arrived") {
  //             setEstimatedArrival("Arrived");
  //           } else if (statuses[currentIndex + 1] === "In Service") {
  //             setEstimatedArrival("Service in progress");
  //           }
  //         }, 15000); // Change status every 15 seconds for demo
  //       }
  //     }, 1000);

  //     return () => clearInterval(interval);
  //   }, [jobStatus]);

  const jobDetails = {
    id: "TR-001",
    provider: "Mike's Tire Service",
    providerRating: 4.8,
    service: "Flat Tire Repair",
    location: "123 Main St, Downtown",
    estimatedCost: "$75",
    providerPhone: "+1 (555) 123-4567",
    providerPhoto: "/placeholder.svg",
  };

  const statusSteps = [
    { status: "Request Accepted", completed: true, time: "2:30 PM" },
    // {
    //   status: "En Route",
    //   completed: jobStatus !== "Request Accepted",
    //   time: "2:35 PM",
    // },
    {
      status: "Arrived",
      completed: ["Arrived", "In Service", "Completed"].includes(jobStatus),
      time: estimatedArrival === "Arrived" ? "2:47 PM" : "",
    },
    {
      status: "Service Complete",
      completed: jobStatus === "Completed",
      time: "",
    },
  ];

  const getRequest = async () => {
    const response = await serviceRequestAPI.getById(params.id);
    setClient(response.data);
  };

  useEffect(() => {
    // 1. Connect socket and join “provider_<region>` room
    //socket.auth = { userId: user.id, role: 'provider', region: user.region };
    getRequest();
    socket.connect();
    socket.emit("join", { userId: user?.id, role: "provider" });

    // 4. Listen for “job_confirmed” if customer confirms job
    socket.on("job_confirmed", handleJobConfirmed);

    return () => {
      socket.off("job_confirmed", handleJobConfirmed);
      socket.disconnect();
    };
  }, [user?.id]);

  const arrivedAtCustomer = async () => {
    socket.emit("arrived", {
      requestId: params.id,
      customerId: client?.customer.documentId,
      providerId: user.id,
      arrivedAt: new Date().toISOString(),
    });
    setStatus([...status, "arrived"]);
    setJobStatus("Arrived");
  };

  // 6. Provider “Complete Job”
  const completeJob = () => {
    // if (!selectedRequest) return;
    // const { requestId } = selectedRequest;

    socket.emit("job_completed", {
      requestId: params.id,
      providerId: user.id,
      customerId: client.customer.documentId,
      completedAt: new Date().toISOString(),
    });
    //setStatus("job_completed");
  };

  // 7. Handle “job_confirmed” (customer confirmed)
  const handleJobConfirmed = (payload) => {
    const { requestId, customerId, confirmedAt } = payload;
    console.log("🎉 Provider: job_confirmed", payload);

    // setIncomingRequests((prev) =>
    //   prev.map((r) =>
    //     r.requestId === requestId ? { ...r, status: "complete" } : r
    //   )
    // );
    setJobStatus("Completed");
    setStatus([...status.filter(item => item !== "idle"), "complete"]);
    navigate('/provider/dashboard', { replace: true});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                My Tire Plug
              </span>
            </Link>

            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Job #{jobDetails.id}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {/* <Card className="mb-8 border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Service Provider {jobStatus}</h2>
                <p className="text-gray-600 mt-1">
                  {jobStatus === "En Route" && `ETA: ${estimatedArrival}`}
                  {jobStatus === "Arrived" && "Your service provider has arrived at your location"}
                  {jobStatus === "In Service" && "Service is currently in progress"}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={jobStatus === "Completed" ? "default" : "secondary"} className="text-lg px-4 py-2">
                  {jobStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card> */}
        {!status.some((s) => ["complete","arrived"].includes(s)) && (
          <Button
            onClick={() => arrivedAtCustomer()}
            variant="default"
            className="w-full p-6 mb-6 font-bold text-xl"
          >
            I AM HERE
          </Button>
        )}
        {!status.some((s) => ["complete","idle"].includes(s)) && (
          <Button
            onClick={() => completeJob()}
            color="green"
            className="w-full p-6 mb-6 font-bold text-xl"
          >
            JOB COMPLETED
          </Button>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5" />
                  <span>Live Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center object-fit overflow-hidden">
                  <AnimatedRouteMap
                    start={customer}
                    destination={provider}
                    animationDuration={8000} // 8 seconds
                  />
                </div>
              </CardContent>
              {/* <CardContent>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Live map tracking would appear here
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Integration with Mapbox/Google Maps
                    </p>
                  </div>
                </div>
              </CardContent> */}
            </Card>

            {/* Progress Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Service Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            step.completed ? "text-green-600" : "text-gray-600"
                          }`}
                        >
                          {step.status}
                        </p>
                        {step.time && (
                          <p className="text-sm text-gray-500">{step.time}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={jobDetails.providerPhoto} />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">
                      {client.customer?.fullName}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">
                        {jobDetails.providerRating}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">{client.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{client?.location?.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Cost</p>
                  <p className="font-medium text-green-600">${client.budget}</p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Actions */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  Cancel Service
                </Button>
                <Button variant="outline" className="w-full">
                  Report Issue
                </Button>
                <Button variant="outline" className="w-full">
                  Emergency Contact
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderTracking;
