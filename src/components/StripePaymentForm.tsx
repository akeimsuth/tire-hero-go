import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface StripePaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentDetails: {
    paymentIntentId: string;
    stripeCustomerId: string;
  }) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onPaymentSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // First create a Stripe customer
      const customer = await stripe.customers.create({
        email: user?.email,
      });

      // Then get the setup intent and payment intent from our backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/authorize-and-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          customerId: customer.id,
        }),
      });

      const { setupIntentSecret, clientSecret } = await response.json();

      // First, confirm setup intent to save the card
      await stripe.confirmCardSetup(setupIntentSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      // Then, confirm the payment intent for authorization only
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        // Payment successful, call the success callback with payment details
        onPaymentSuccess({
          paymentIntentId: result.paymentIntent.id,
          stripeCustomerId: customer.id,
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-md">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default StripePaymentForm; 