import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { stripeAPI } from "@/services/api";

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const ProviderComplete = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const handleStripeCompletion = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const accountId = urlParams.get('providerId');

        if (!accountId) {
          throw new Error('No account ID found');
        }

        // if (!user?.business?.documentId) {
        //   throw new Error('No business ID found');
        // }

        // Get the stripe record
        const stripe = await stripeAPI.getById(accountId);
        if (!stripe?.data[0]?.documentId) {
          throw new Error('No stripe record found');
        }
        const { stripeAccountId, documentId } = stripe.data[0];
        const account = await fetch(`${import.meta.env.VITE_STRIPE_URL}/api/providers/onboard/complete?accountId=${stripeAccountId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },

          });
        console.log("ACCOUNT DETAILS: ",account);
        const stripeAccount = await account.json();
        // Update the stripe status
        await stripeAPI.update(documentId, {
          stripeAccountStatus: 'active',
          bankName: stripeAccount.bank_name,
          accountType: stripeAccount.business_type,
          bankNumber: stripeAccount.external_accounts.data[0].last4,
          bankRouting: stripeAccount.external_accounts.data[0].routing_number,
          bankStatus: stripeAccount.external_accounts.data[0].status,
          accountName: stripeAccount.company.name,
          accountAddress: stripeAccount.company.address.line1,
          accountEmail: stripeAccount.email
        });
        

        toast({
          title: "Success",
          description: "Your Stripe account has been connected successfully!",
        });

        // Start countdown before redirecting
        // let count = 10;
        // const timer = setInterval(() => {
        //   setCountdown((prev) => {
        //     if (count <= 1) {
        //       clearInterval(timer);
        //       navigate('/provider/settings');
        //       return 0;
        //     }
        //     return prev - 1;
        //   });
        // }, 1000);

        // return () => clearInterval(timer);
      } catch (error) {
        console.error('Error completing Stripe setup:', error);
        setError(error instanceof Error ? error.message : 'Failed to complete Stripe setup');
        toast({
          title: "Error",
          description: "Failed to complete Stripe setup. Please try again.",
          variant: "destructive",
        });
        // navigate('/provider/settings');
      } finally {
        setIsLoading(false);
      }
    };

    handleStripeCompletion();
  }, [navigate, toast, user]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Setup Failed</h1>
          <p className="text-gray-600 text-center">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Completing Setup</h1>
        <p className="text-gray-600 text-center">
          {isLoading ? (
            "Please wait while we complete your Stripe account setup..."
          ) : (
            <>
              Setup completed! Redirecting in {countdown} seconds...
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProviderComplete; 