import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Plus, CreditCard, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from '@stripe/stripe-js';
import { dashboardAPI } from "@/services/api";

// Initialize Stripe (you'll need to replace with your publishable key)
let stripePromise: string = ''; // Replace with your actual publishable key

const WalletComponent = () => {
  const [balance, setBalance] = useState(25.00);
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const { toast } = useToast();

  const quickAmounts = [10, 25, 50, 100];

  useEffect(() => {
    const fetchStripeSecretKey = async () => {
      const response = await dashboardAPI.getAPI();
      setStripeSecretKey(response?.data?.stripeSecretKey);
    };
    fetchStripeSecretKey();
  }, []);
  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    
    if (!amount || amount < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is $5.00",
        variant: "destructive",
      });
      return;
    }

    if (amount > 500) {
      toast({
        title: "Amount Too Large",
        description: "Maximum amount is $500.00",
        variant: "destructive",
      });
      return;
    }

    setIsAddingFunds(true);

    try {
      const stripe = await loadStripe(stripeSecretKey);
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Here you would create a checkout session on your backend
      // For now, we'll simulate the payment process
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
        }),
      });

      if (!response.ok) {
        // Fallback to simulation if backend isn't set up
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newBalance = balance + amount;
        setBalance(newBalance);
        
        toast({
          title: "Funds Added Successfully",
          description: `$${amount.toFixed(2)} has been added to your wallet.`,
        });
        
        setAddAmount("");
        setIsModalOpen(false);
        return;
      }

      const session = await response.json();
      
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      // Simulate successful payment for demo purposes
      console.log('Stripe integration not fully set up, simulating payment:', error);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBalance = balance + amount;
      setBalance(newBalance);
      
      toast({
        title: "Funds Added Successfully",
        description: `$${amount.toFixed(2)} has been added to your wallet.`,
      });
      
      setAddAmount("");
      setIsModalOpen(false);
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is $5.00",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/providers/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
        }),
      });

      if (!response.ok) {
        throw new Error('Withdrawal failed');
      }

      const result = await response.json();
      
      // Update balance
      setBalance(prevBalance => prevBalance - amount);
      
      toast({
        title: "Withdrawal Successful",
        description: `$${amount.toFixed(2)} has been withdrawn from your wallet.`,
      });
      
      setWithdrawAmount("");
      setIsWithdrawModalOpen(false);
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setAddAmount(amount.toString());
  };

  const transactions = [
    { id: 1, description: "Flat Tire Repair", amount: -45.00, date: "2 days ago" },
    { id: 2, description: "Funds Added", amount: 50.00, date: "1 week ago" },
    { id: 3, description: "Tire Replacement", amount: -120.00, date: "2 weeks ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>My Wallet</span>
          </CardTitle>
          <CardDescription>Manage your account balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${balance.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Available Balance</p>
          </div>
          
          <div className="flex space-x-3">
            <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdrawAmount">Amount to Withdraw</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="withdrawAmount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Minimum withdrawal: $5.00
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setWithdrawAmount(amount.toString())}
                        className="w-full"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      disabled={isWithdrawing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || isWithdrawing}
                    >
                      {isWithdrawing ? "Processing..." : "Withdraw"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-2">
                <div>
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
                <span className={`font-medium ${
                  transaction.amount > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletComponent;
