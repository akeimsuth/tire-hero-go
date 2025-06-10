import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Plus,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { serviceRequestAPI } from "@/services/api";
import moment from "moment";
import CreateRequest from "./CreateRequest";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRequests, setLoading, setError } from '@/store/requestSlice';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const dispatch = useAppDispatch();
  const requestsState = useAppSelector((state) => state?.requests);
  const requests = requestsState?.requests || [];
  const isLoading = requestsState?.isLoading || false;
  const error = requestsState?.error || null;

  const getActiveRequests = async () => {
    try {
      dispatch(setLoading(true));
      const data = await serviceRequestAPI.getAll();
      dispatch(setRequests(data.data));
    } catch (err) {
      dispatch(setError('Failed to fetch active requests'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Bids Open":
        return "bg-blue-100 text-blue-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "En Route":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const logoutFunc = () => {
    logout();
    navigate("/", { replace: true });
  };

  const getFirstName = () => {
    return "James"; //user?.fullName.split(" ")[0];
  };

  useEffect(() => {
    getActiveRequests();
  }, []);

  return (
    <CreateRequest/>
  );
};

export default CustomerDashboard;
