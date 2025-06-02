
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';

// Replace with your actual publishable key
const stripePromise = loadStripe('pk_test_51234567890abcdef'); // This should be your Stripe publishable key

interface StripeElementsWrapperProps {
  total: number;
  onPaymentSuccess: () => void;
}

const StripeElementsWrapper = ({ total, onPaymentSuccess }: StripeElementsWrapperProps) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm total={total} onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
};

export default StripeElementsWrapper;
