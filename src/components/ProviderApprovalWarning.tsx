
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, FileText, Phone } from "lucide-react";

interface ProviderApprovalWarningProps {
  providerName?: string;
}

const ProviderApprovalWarning = ({ providerName = "Provider" }: ProviderApprovalWarningProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Account Under Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Approval Required</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your provider account is currently under review. You cannot accept service requests until your account is approved.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">What happens next?</h3>
            <div className="grid gap-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Review Process</p>
                  <p className="text-sm text-gray-600">
                    Our team is reviewing your application and documents. This typically takes 1-3 business days.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Documentation Check</p>
                  <p className="text-sm text-gray-600">
                    We're verifying your credentials, insurance, and business licenses.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Final Approval</p>
                  <p className="text-sm text-gray-600">
                    Once approved, you'll receive an email notification and can start accepting requests.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-3">
              If you have questions about your application status or need to update your information, contact our support team.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
              <Button variant="outline" size="sm">
                Update Documents
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Thank you for your patience, {providerName}. We'll notify you as soon as your account is ready.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderApprovalWarning;
