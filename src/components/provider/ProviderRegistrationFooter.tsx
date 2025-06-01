
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ProviderRegistrationFooter = () => {
  return (
    <div className="mt-6 text-center space-y-2">
      <Link to="/login" className="text-sm text-blue-600 hover:underline">
        Already have an account? Sign in
      </Link>
      <br />
      <Link to="/" className="text-sm text-gray-600 hover:underline flex items-center justify-center">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>
    </div>
  );
};

export default ProviderRegistrationFooter;
