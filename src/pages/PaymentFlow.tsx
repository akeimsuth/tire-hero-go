import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wrench, CreditCard, DollarSign, Star, Shield, ArrowLeft } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RatingModal from "@/components/modals/RatingModal";
import { serviceRequestAPI } from "@/services/api";
import StripePaymentForm from "@/components/modals/StripePaymentForm";
import SavedPaymentMethods from "@/components/modals/SavedPaymentMethods";
import StripeElementsWrapper from "@/components/modals/StripeElementsWrapper";

const PaymentFlow = () => {
  const [tipAmount, setTipAmount] = useState("");
  const params = useParams();
  const navigate = useNavigate();
  const [selectedTip, setSelectedTip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"saved" | "card">("card");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [client, setClient] = useState({
    documentId: "",
    customer: {
      documentId: "",
      fullName: "",
      paymentMethod: "card" as "card" | "cash",
    },
    serviceType: "",
    location: {
      address: "",
    },
    amount: "",
    accepted_bid: {
      documentId: "",
      provider: {
        businessName: "",
        documentId: "",
        rating: 5
      },
    },
    paymentMethod: "card" as "card" | "cash" | "saved",
  });
  
  const jobDetails = {
    id: "JOB-001",
    provider: "Mike's Tire Service",
    service: "Flat Tire Repair",
    baseCost: 65.00,
    serviceFee: 6.50,
    rating: 4.8
  };

  const suggestedTips = ["15%", "20%", "25%"];

  const getRequest = async () => {
    const response = await serviceRequestAPI.getById(params.id);
    setClient(response.data);
  };

  const closeRatingModal = () =>{
    setShowRatingModal(false);
    navigate("/dashboard");
  }

  const calculateTip = (percentage: string) => {
    const percent = parseInt(percentage.replace('%', ''));
    return (jobDetails.baseCost * percent / 100).toFixed(2);
  };

  const total = jobDetails.baseCost + jobDetails.serviceFee + (tipAmount ? parseFloat(tipAmount) : 0);

  const handleCompletePayment = () => {
    // After payment is processed, show the rating modal
    setShowRatingModal(true);
  };

    const handlePaymentSuccess = () => {
    // After payment is processed, show the rating modal
    setShowRatingModal(true);
  };

  useEffect(() => {
    getRequest();
  },[]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/tracking" className="flex items-center space-x-2">
              {/* <ArrowLeft className="h-5 w-5" /> */}
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">My Tire Plug</span>
            </Link>
            
            <Badge variant="default" className="bg-green-600">
              Service Completed
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Complete!</h1>
          <p className="text-gray-600">Please review your service and complete payment</p>
        </div>

        <div className="space-y-6">
          {/* Service Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Service Summary</CardTitle>
              {/* <CardDescription>Job #{jobDetails.id}</CardDescription> */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider</span>
                  <span className="font-medium">{client?.accepted_bid?.provider?.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium">{client.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{client?.accepted_bid?.provider?.rating}/5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Tip */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Add Tip (Optional)</span>
              </CardTitle>
              <CardDescription>Show your appreciation for great service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {suggestedTips.map((tip) => (
                    <Button
                      key={tip}
                      variant={selectedTip === tip ? "default" : "outline"}
                      onClick={() => {
                        setSelectedTip(tip);
                        setTipAmount(calculateTip(tip));
                      }}
                    >
                      {tip} (${calculateTip(tip)})
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customTip">Custom tip amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="customTip"
                      type="number"
                      placeholder="0.00"
                      className="pl-10"
                      value={tipAmount}
                      onChange={(e) => {
                        setTipAmount(e.target.value);
                        setSelectedTip("");
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Cost</span>
                  <span>${Number(client.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span>${0.00}</span>
                </div>
                {tipAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip</span>
                    <span>${parseFloat(tipAmount).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${Number(client.amount).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Method</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600">Visa ending in 4242</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </CardContent>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium">Cash</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </CardContent>
          </Card> */}
                   {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Method</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client?.customer?.paymentMethod === 'cash' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Cash Payment Instructions</h3>
                    <p className="text-blue-800">
                      Please pay ${Number(client.amount).toFixed(2)} in cash to your service provider.
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => setShowRatingModal(true)}
                  >
                    Leave a Review
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6 text-gray-500" />
                      <div>
                        <p className="font-medium">Credit Card</p>
                        <p className="text-sm text-gray-600">Secure payment processing</p>
                      </div>
                    </div>
                  </div>
                  <StripeElementsWrapper
                    total={Number(client.amount)}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                  {/* Security Note */}
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Your payment is secured with 256-bit SSL encryption</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {showRatingModal && client?.accepted_bid?.provider?.businessName && client?.serviceType && client?.customer?.documentId && client?.accepted_bid?.provider?.documentId && client?.documentId && (
            <RatingModal
              isOpen={showRatingModal}
              onClose={closeRatingModal}
              providerName={client.accepted_bid.provider.businessName}
              serviceType={client.serviceType}
              customerId={client.customer.documentId}
              providerId={client.accepted_bid.provider.documentId}
              jobId={client.documentId}
            />
          )}



          {/* Action Buttons */}
          {/* <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleCompletePayment}>
              Complete Payment - ${Number(client.budget).toFixed(2)}
            </Button>
            <Button variant="outline" className="w-full">
              Pay Later (Add to Wallet)
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;
