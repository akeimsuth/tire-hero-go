import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { customerAPI } from "@/services/api";

interface StripePaymentFormProps {
  total: number;
  onPaymentSuccess: () => void;
}

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  name: string;
}

const StripePaymentForm = ({ total, onPaymentSuccess }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const { toast } = useToast();

  // Load saved cards from localStorage on component mount
  useEffect(() => {
    const savedCardsData = localStorage.getItem('savedCards');
    if (savedCardsData) {
      setSavedCards(JSON.parse(savedCardsData));
    }
  }, []);

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

  const saveCardToLocalStorage = async(cardDetails: SavedCard) => {
    const updatedCards = [...savedCards, cardDetails];
    setSavedCards(updatedCards);
    localStorage.setItem('savedCards', JSON.stringify(updatedCards));
    await customerAPI.update(user?.customer?.documentId, {
      saveCard: updatedCards,
    });
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
  
      if (error || !paymentMethod) {
        toast({
          title: "Payment Method Error",
          description: error.message || "Unknown error",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // If user chose to save the card
      if (saveCard && paymentMethod.card) {
        const cardDetails: SavedCard = {
          id: paymentMethod.id,
          last4: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
          name: cardholderName,
        };
        saveCardToLocalStorage(cardDetails);
      }

      // First, authorize the payment
      const authorizeResponse = await fetch(`${import.meta.env.VITE_STRIPE_URL}/api/payments/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          email: user?.email,
          amount: total * 100, // cents
          saveCard,
        }),
      });
  
      const authorizeResult = await authorizeResponse.json();
  
      if (!authorizeResponse.ok) {
        throw new Error(authorizeResult.error || "Authorization failed");
      }

      // Then, capture the payment
      const captureResponse = await fetch(`${import.meta.env.VITE_STRIPE_URL}/api/payments/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: authorizeResult.paymentIntentId,
          amount: total * 100, // cents
        }),
      });

      const captureResult = await captureResponse.json();

      if (!captureResponse.ok) {
        throw new Error(captureResult.error || "Payment capture failed");
      }
  
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
  
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Payment Failed",
        description: err.message,
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

          <Button
            type="submit"
            className="w-full"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
          </Button>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
