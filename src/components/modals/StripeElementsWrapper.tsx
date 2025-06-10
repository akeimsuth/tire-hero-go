import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/services/api';
import { Loader2 } from 'lucide-react';

// Replace with your actual publishable key
//const stripePromise = loadStripe('pk_test_51RVMbvQQ57EnWXiuH357M8tKFBE2MuK5mVaHzwbLBfZKZyiYTr2JJWlxhjUh0DAE0DjPlHbQHIEl5c0uv5vjzuf800LaV6YRs2'); // This should be your Stripe publishable key

interface StripeElementsWrapperProps {
  total: number;
  onPaymentSuccess: () => void;
}

const StripeElementsWrapper = ({ total, onPaymentSuccess }: StripeElementsWrapperProps) => {
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStripeSecretKey = async () => {
      try {
        const response = await dashboardAPI.getAPI();
        setStripeSecretKey(response?.data?.stripeSecretKey);
      } catch (error) {
        console.error('Error fetching Stripe key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStripeSecretKey();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stripeSecretKey) {
    return (
      <div className="p-4 text-center text-red-600">
        Unable to load payment system. Please try again later.
      </div>
    );
  }

  const stripePromise = loadStripe(stripeSecretKey);

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm total={total} onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
};

export default StripeElementsWrapper;
