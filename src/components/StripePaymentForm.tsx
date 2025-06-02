
import { useState } from "react";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentFormProps {
  total: number;
  onPaymentSuccess: () => void;
}

const StripePaymentForm = ({ total, onPaymentSuccess }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);
  const { toast } = useToast();

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Stripe not loaded",
        description: "Please wait for Stripe to load and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!cardholderName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the cardholder name",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Card element not found",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        toast({
          title: "Payment Method Error",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      console.log('Payment method created:', paymentMethod);

      // In a real implementation, you would:
      // 1. Send the payment method to your backend
      // 2. Create a payment intent on your backend
      // 3. Confirm the payment

      // For demo purposes, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful",
        description: `Payment of $${total.toFixed(2)} has been processed successfully.`,
      });
      
      if (saveCard) {
        toast({
          title: "Card Saved",
          description: "Your card has been securely saved for future payments.",
        });
      }
      
      onPaymentSuccess();

    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Payment Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Card Information</Label>
            <div className="border rounded-md p-3 bg-white">
              <CardElement
                options={cardElementOptions}
                onChange={handleCardChange}
              />
            </div>
            {cardError && (
              <p className="text-sm text-red-600">{cardError}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveCard"
              checked={saveCard}
              onCheckedChange={(checked) => setSaveCard(checked as boolean)}
            />
            <Label htmlFor="saveCard" className="text-sm">
              Save this card for future payments
            </Label>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <Lock className="h-3 w-3" />
            <span>Your payment information is encrypted and secure</span>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={isProcessing || !stripe}
          >
            {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
