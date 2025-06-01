
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProviderRegistrationHeader from "@/components/provider/ProviderRegistrationHeader";
import ProviderRegistrationForm from "@/components/provider/ProviderRegistrationForm";
import ProviderRegistrationFooter from "@/components/provider/ProviderRegistrationFooter";

const ProviderRegister = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ProviderRegistrationHeader />

        <Card>
          <CardHeader>
            <CardTitle>Provider Application</CardTitle>
            <CardDescription>
              Fill out this form to apply as a tire service provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderRegistrationForm />
          </CardContent>
        </Card>

        <ProviderRegistrationFooter />
      </div>
    </div>
  );
};

export default ProviderRegister;
