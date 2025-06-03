
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, MapPin, Clock, Star, Phone, MessageSquare, User } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { bidAPI, serviceRequestAPI } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import socket from '../socket';
import { useAuth } from "@/context/AuthContext";
import moment from "moment";

const BiddingInterface = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const bidTimersRef = useRef({});
  const [bidsForRequest, setBidsForRequest] = useState([]); 
  const [requests, setRequests] = useState([]);
  const [request, setRequest] = useState({
    serviceType: '',
    tireSize: '',
    tireBrand: '',
    tireStatus: '',
    location: {
      address: ''
    },
    notes: '',
    budget: 0,
    priority: 'normal',
    scheduledTime: ''
  })
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes in seconds
  const [bids, setBids] = useState([
    // {
    //   id: 1,
    //   provider: {
    //     name: "Mike's Mobile Tire",
    //     rating: 4.8,
    //     completedJobs: 156,
    //     responseTime: "15 min avg",
    //     distance: 2.3
    //   },
    //   amount: 85,
    //   estimatedTime: "30 minutes",
    //   message: "I have the exact tire size in stock. Can be there in 20 minutes.",
    //   submittedAt: "2 minutes ago"
    // },
    // {
    //   id: 2,
    //   provider: {
    //     name: "Quick Fix Tires",
    //     rating: 4.6,
    //     completedJobs: 89,
    //     responseTime: "12 min avg",
    //     distance: 1.8
    //   },
    //   amount: 75,
    //   estimatedTime: "25 minutes",
    //   message: "Experienced with flat repairs. Free inspection included.",
    //   submittedAt: "3 minutes ago"
    // },
    // {
    //   id: 3,
    //   provider: {
    //     name: "Pro Tire Solutions",
    //     rating: 4.9,
    //     completedJobs: 203,
    //     responseTime: "10 min avg",
    //     distance: 3.1
    //   },
    //   amount: 95,
    //   estimatedTime: "35 minutes",
    //   message: "Premium service with 1-year warranty on repairs.",
    //   submittedAt: "1 minute ago"
    // }
  ]);

  const getRequest = () => {
    console.log("ID: ", params.id)
    serviceRequestAPI.getById(params.id).then(res => {
         setRequest(res.data);
        }).catch(err => {
          console.log("Unable to create request: ", err);
    })
  }

  
  // useEffect(() => {
  //   bidAPI.getByRequest(params.id).then(res => {
  //     console.log(res);
  //   //setBids(res.data);
  //   }).catch(err => {
  //     console.log("Unable to create request: ", err);
  //   })
  // },[params.id])

    useEffect(() => {
    getRequest();
    socket.connect();
    socket.emit('join', { userId: user?.customer?.documentId, role: 'customer'});

    socket.on('new_bid', handleNewBid);

    return () => {
      socket.off('new_bid', handleNewBid);
      socket.disconnect();
      Object.values(bidTimersRef.current).forEach((timeoutId: never) => {
        clearTimeout(timeoutId);
      });
    };
  }, [user?.id]);

    const createRequest = async () => {
      const requestId = params.id;
      const request = await serviceRequestAPI.getById(params.id);
      // Immediately emit “new_request” so providers see it in real-time
      console.log('LOCATION: ', request.data);
      socket.emit('new_request', {
        requestId,
        customerId: user?.customer?.documentId,
        customer: user?.customer?.fullName,
        urgency: "normal",
        location: request.data?.location?.address,
        serviceType: request.data?.serviceType,
        distance: 1,
        amount: request.data?.budget,
        timePosted: request.data?.createdAt,
        timestamp: Date.now(),
      });

    // Add to UI state
    setRequests((prev) => [
      ...prev,
      { requestId, location: request?.location?.address, serviceType: request?.serviceType, status: 'awaiting_bid' },
    ]);
  };

  useEffect(() => {
    createRequest();
  }, []);

    // 4b. Handle incoming bids on this request

const handleNewBid = async(bidPayload) => {
  const { bidId, requestId } = bidPayload;
  console.log("New bid received!");
  setBidsForRequest((prev) => {
    if (!Array.isArray(prev)) return [{ ...bidPayload, countdown: 10 }];

    return [...prev, { ...bidPayload, countdown: 10 }]; // Initialize countdown at 10s
  });
  console.log("processing bid!");
  await serviceRequestAPI.update(requestId, {bids: bidId});
   // Remove bid after 10 seconds
  const timeoutId = setTimeout(() => {
    console.log("⏳ Removing bid:", bidId); // Debugging

    setBidsForRequest((prev) => {
      const updated = prev.filter((b) => b.bidId !== bidId);
      console.log("🚀 Updated bids after removal:", updated); // Debugging
      return updated;
    });

    clearInterval(bidTimersRef.current[bidId]?.intervalId); // Stop countdown updates
    delete bidTimersRef.current[bidId]; // Cleanup timers
  }, 10 * 1000);

  bidTimersRef.current[bidId] = { timeoutId };


};

  // Countdown Effect (Runs Every Second)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setBidsForRequest((prev) =>
        prev.map((b) => 
          b.countdown > 0 ? { ...b, countdown: b.countdown - 1 } : b
        )
      );
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);



    // 4c. Customer selects a bid (within 10s)
  const handleAcceptBid = async(requestId, selectedBid) => {
    const { bidId, providerId } = selectedBid;
    await serviceRequestAPI.update(requestId, {accepted_bid: bidId, tireStatus: "Accepted"})
    // Emit “bid_selected” to server
    socket.emit('bid_selected', {
      bidId: bidId,
      requestId,
      providerId: providerId,
      customerId: user?.customer.documentId,
      timestamp: Date.now(),
    });

    // Update local state
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? { ...r, status: 'bid_selected', chosenBid: bidId }
          : r
      )
    );

    // Clear all timers for this request
    if (bidsForRequest[requestId]) {
      bidsForRequest[requestId].forEach((b) => {
        if (bidTimersRef.current[b.bidId]) {
          clearTimeout(bidTimersRef.current[b.bidId]);
          delete bidTimersRef.current[b.bidId];
        }
      });
    }
    navigate(`/tracking/${params.id}`, {replace: true});
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // const handleAcceptBid = (bidId: number) => {
  //   console.log('Accepting bid:', bidId);
  //   // Handle bid acceptance
  //   navigate('/tracking', {replace: true});
  // };

  const handleContactProvider = (providerId: number, method: string) => {
    console.log('Contacting provider:', providerId, method);
    // Handle contact
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
          {/* <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link> */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Timer and Request Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Request</CardTitle>
              </CardHeader>
              <CardContent>
                {!request.serviceType ? 
                  <div className="flex items-center justify-center">
                  <div className="space-y-2 p-6 w-full max-w-sm">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                  </div>
                </div>
                :
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{request?.serviceType}</span>
                    <Badge>{request.tireStatus}</Badge>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {request?.location?.address}
                  </div>
                  <div className="text-sm">
                    <p><strong>Tire Size:</strong> {request?.tireSize}</p>
                    <p><strong>Issue:</strong> {request?.notes}</p>
                  </div>
                </div>
              }
              </CardContent>
            </Card>
          </div>

          {/* <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-800">Time Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  Choose a bid before time expires
                </p>
                {timeLeft <= 60 && (
                  <Badge variant="destructive" className="mt-2">
                    Urgent!
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Bids */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Received Bids ({bidsForRequest.length})</h2>
            <Badge variant="outline">{bidsForRequest.length} providers responded</Badge>
          </div>

          {bidsForRequest.map((bid) => (
            <Card key={bid.bidId} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Provider Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{bid.provider.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {bid.provider.rating} ({bid.provider.completedJobs} jobs)
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {bid.provider.responseTime}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {bid.provider.distance} km away
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-3">{bid.message}</p>
                        <p className="text-xs text-gray-500 mt-2">Submitted {moment(bid.submittedAt).fromNow()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bid Details */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${bid.amount}</div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {bid.estimatedTime}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Button 
                      onClick={() => handleAcceptBid(params.id, bid)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept Bid
                    </Button>
                    <div className="flex text-3xl font-bold justify-center text-orange-600">
                      {bid.countdown}
                    </div>
                    {/* <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContactProvider(bid.id, 'call')}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContactProvider(bid.id, 'message')}
                        className="flex-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bidsForRequest.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">Waiting for providers to submit bids...</p>
              <div className="animate-pulse">
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {timeLeft === 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="text-center py-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Time Expired</h3>
              <p className="text-red-700 mb-4">The bidding window has closed.</p>
              <Button variant="outline">Create New Request</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BiddingInterface;
