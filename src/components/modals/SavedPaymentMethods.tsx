import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface SavedPaymentMethodsProps {
  onSelectPaymentMethod: (paymentMethodId: string) => void;
  selectedPaymentMethodId?: string;
}

const SavedPaymentMethods = ({ onSelectPaymentMethod, selectedPaymentMethodId }: SavedPaymentMethodsProps) => {
  const [paymentMethods] = useState<PaymentMethod[]>([
    // {
    //   id: "pm_1234",
    //   last4: "4242",
    //   brand: "visa",
    //   expMonth: 12,
    //   expYear: 2025,
    //   isDefault: true,
    // },
    // {
    //   id: "pm_5678",
    //   last4: "0005",
    //   brand: "mastercard",
    //   expMonth: 6,
    //   expYear: 2026,
    //   isDefault: false,
    // },
  ]);
  const { toast } = useToast();

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    // Here you would call your backend to delete the payment method
    toast({
      title: "Payment Method Deleted",
      description: "The payment method has been removed from your account.",
    });
  };

  const getBrandIcon = (brand: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Saved Payment Methods</span>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedPaymentMethodId === method.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onSelectPaymentMethod(method.id)}
          >
            <div className="flex items-center space-x-3">
              {getBrandIcon(method.brand)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    •••• •••• •••• {method.last4}
                  </span>
                  {method.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 capitalize">
                  {method.brand} • Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePaymentMethod(method.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {paymentMethods.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No saved payment methods</p>
            <p className="text-sm">Add a payment method to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedPaymentMethods;
