import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, MapPin, Clock, Star, Phone, MessageSquare, User, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const BiddingInterface = () => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes in seconds
  const [bidAmount, setBidAmount] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bids, setBids] = useState([
    {
      id: 1,
      provider: {
        name: "Mike's Mobile Tire",
        rating: 4.8,
        completedJobs: 156,
        responseTime: "15 min avg",
        distance: 2.3
      },
      amount: 85,
      estimatedTime: "30 minutes",
      message: "I have the exact tire size in stock. Can be there in 20 minutes.",
      submittedAt: "2 minutes ago"
    },
    {
      id: 2,
      provider: {
        name: "Quick Fix Tires",
        rating: 4.6,
        completedJobs: 89,
        responseTime: "12 min avg",
        distance: 1.8
      },
      amount: 75,
      estimatedTime: "25 minutes",
      message: "Experienced with flat repairs. Free inspection included.",
      submittedAt: "3 minutes ago"
    },
    {
      id: 3,
      provider: {
        name: "Pro Tire Solutions",
        rating: 4.9,
        completedJobs: 203,
        responseTime: "10 min avg",
        distance: 3.1
      },
      amount: 95,
      estimatedTime: "35 minutes",
      message: "Premium service with 1-year warranty on repairs.",
      submittedAt: "1 minute ago"
    }
  ]);

  // Mock request data
  const request = {
    serviceType: "Flat Tire Repair",
    location: "123 Main St, Downtown",
    tireSize: "225/65R17",
    description: "Front left tire has a nail puncture, losing air slowly"
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAcceptBid = (bidId: number) => {
    console.log('Accepting bid:', bidId);
    // Handle bid acceptance
  };

  const handleContactProvider = (providerId: number, method: string) => {
    console.log('Contacting provider:', providerId, method);
    // Handle contact
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || !arrivalTime) {
      alert('Please fill in all required fields');
      return;
    }

    const newBid = {
      id: Date.now(),
      provider: {
        name: "Your Company", // This would come from provider profile
        rating: 4.7,
        completedJobs: 45,
        responseTime: "8 min avg",
        distance: 1.2
      },
      amount: parseFloat(bidAmount),
      estimatedTime: arrivalTime,
      message: bidMessage || "Ready to help with your tire service needs.",
      submittedAt: "just now"
    };

    setBids([newBid, ...bids]);
    setBidAmount("");
    setArrivalTime("");
    setBidMessage("");
    console.log('Bid submitted:', newBid);
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
          <Link to={user?.type === 'provider' ? '/provider/dashboard' : '/dashboard'}>
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Timer and Request Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Request</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{request.serviceType}</span>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {request.location}
                  </div>
                  <div className="text-sm">
                    <p><strong>Tire Size:</strong> {request.tireSize}</p>
                    <p><strong>Issue:</strong> {request.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-800">Time Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  {user?.type === 'provider' ? 'Submit your bid before time expires' : 'Choose a bid before time expires'}
                </p>
                {timeLeft <= 60 && (
                  <Badge variant="destructive" className="mt-2">
                    Urgent!
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider Bid Submission Form */}
        {user?.type === 'provider' && timeLeft > 0 && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Submit Your Bid</CardTitle>
              <CardDescription>Enter your pricing and availability for this service request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bidAmount">Your Price ($)*</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="85.00"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrivalTime">Estimated Arrival Time*</Label>
                    <Input
                      id="arrivalTime"
                      type="text"
                      placeholder="30 minutes"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bidMessage">Message (Optional)</Label>
                  <Textarea
                    id="bidMessage"
                    placeholder="Add any additional information about your service..."
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Bid
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bids */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {user?.type === 'provider' ? 'All Bids' : `Received Bids (${bids.length})`}
            </h2>
            <Badge variant="outline">{bids.length} providers responded</Badge>
          </div>

          {bids.map((bid) => (
            <Card key={bid.id} className="hover:shadow-lg transition-shadow">
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
                        <p className="text-xs text-gray-500 mt-2">Submitted {bid.submittedAt}</p>
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
                  {user?.type === 'customer' && (
                    <div className="flex flex-col space-y-2">
                      <Button 
                        onClick={() => handleAcceptBid(bid.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept Bid
                      </Button>
                      <div className="flex space-x-2">
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
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bids.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {user?.type === 'provider' ? 'No bids submitted yet. Be the first to bid!' : 'Waiting for providers to submit bids...'}
              </p>
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
              <Button variant="outline">
                {user?.type === 'provider' ? 'Back to Dashboard' : 'Create New Request'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BiddingInterface;
