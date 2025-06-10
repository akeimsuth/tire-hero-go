import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, CreditCard, Settings, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from '@stripe/stripe-js';
import { stripeAPI } from "@/services/api";
import { authAPI } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StripeAccount {
  id: string;
  business_type: 'individual' | 'company';
  charges_enabled: boolean;
  payouts_enabled: boolean;
  individual?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postal_code: string;
    };
  };
  company?: {
    name: string;
    tax_id: string;
    address: {
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postal_code: string;
    };
  };
  external_accounts: {
    data: Array<{
      bank_name: string;
      last4: string;
      routing_number: string;
      status: string;
    }>;
  };
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

const ProviderSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [stripeInfo, setStripeInfo] = useState();

  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null);
  const [stripeAccountStatus, setStripeAccountStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchStripeStatus = async () => {
      if (!user?.business?.documentId) return;
      
      try {
        const providerDoc = await stripeAPI.getById(user.business.documentId);
        if (providerDoc?.data) {
          const {stripeAccountStatus} = providerDoc?.data[0];
          setStripeAccountStatus(stripeAccountStatus || null);
        }
      } catch (error) {
        console.error('Error fetching Stripe status:', error);
      }
    };

    fetchStripeStatus();

  }, [user?.business?.documentId]);

  useEffect(() => {
    const fetchStripeData = async () => {
      try {
        const stripeData = await renderStripeAccountInfo();
        setStripeInfo(stripeData || null);
      } catch (error) {
        console.error("Error fetching Stripe data:", error);
      }
    };

    fetchStripeData();
  }, []);


  const handleStripeOnboarding = async () => {
    if (!user?.business?.documentId) return;

    try {
          const accountLinkResponse = await fetch(`${import.meta.env.VITE_STRIPE_URL}/api/providers/create-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email || '',
          business_type: 'company',
          company: {
            name: user?.business?.businessName || '',
          },
          refreshUrl: `${window.location.origin}/provider/settings`,
          returnUrl: `${window.location.origin}/provider/complete?providerId=${user?.business?.documentId}`,
        }),
      });
      const account = await accountLinkResponse.json();

      // Update provider's Stripe account info in Firestore
      if (account.id) {
        await stripeAPI.create({
          providerId: user?.business?.documentId,
          stripeAccountId: account.id,
          stripeAccountStatus: 'pending',
        });
        window.location.href = account.url;
      }
    } catch (error) {
      console.error("Error starting Stripe onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to start Stripe onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStripeDashboard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_STRIPE_URL}/api/providers/dashboard-link?accountId=${user.business.stripe.documentId}`);
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error getting Stripe dashboard link:", error);
      toast({
        title: "Error",
        description: "Failed to get Stripe dashboard link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStripeAccountInfo = async() => {
    const stripe = await stripeAPI.getById(user?.business?.documentId);
    if (!stripe?.data[0]?.documentId) {
      throw new Error('No stripe record found');
    }
    const { stripeAccountId, bankName, accountType, bankNumber, bankRouting, bankStatus, accountName, accountAddress, accountEmail } = stripe.data[0];

    const isIndividual = accountType === 'individual';

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              {isIndividual ? 'Individual Account' : 'Company Account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isIndividual ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="mt-1">{`${accountName}`}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{accountEmail}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1">
                    {accountAddress}
                    <br />
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p className="mt-1">{accountName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Business Address</p>
                  <p className="mt-1">
                    {accountAddress}
                    <br />
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Bank Name</p>
                <p className="mt-1">{bankName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Account Number</p>
                <p className="mt-1">****{bankNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Routing Number</p>
                <p className="mt-1">{bankRouting}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 capitalize">{bankStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>


        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handleStripeDashboard}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Stripe Dashboard
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/provider/dashboard" className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                My Tire Plug
              </span>
            </Link>
            <Link to="/provider/dashboard" className="flex items-center space-x-2">
              <Button variant={"outline"}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Settings</span>
                </div>
                {stripeAccountStatus === "active" ? (
                  <Badge className="bg-green-500">Connected</Badge>
                ) : (
                  <Badge variant="outline">Not Connected</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Connect your Stripe account to receive payments from customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stripeAccountStatus === "active" ? (
                stripeInfo
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Ready to get started?</AlertTitle>
                    <AlertDescription>
                      Complete the Stripe onboarding process to start accepting payments
                      through our platform.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleStripeOnboarding} className="w-full">
                    Set Up Stripe Connect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add more settings cards here */}
        </div>
      </div>
    </div>
  );
};

export default ProviderSettings; 