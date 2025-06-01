
import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const ProviderRegistrationHeader = () => {
  return (
    <div className="text-center mb-8">
      <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
        <Wrench className="h-8 w-8 text-blue-600" />
        <span className="text-2xl font-bold text-gray-900">My Tire Plug</span>
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Join as Provider</h1>
      <p className="text-gray-600">Start your tire service business with us</p>
    </div>
  );
};

export default ProviderRegistrationHeader;
