import axios from "axios";
import {
  ServiceRequest,
  Bid,
  User,
  WalletTransaction,
  Rating,
} from "@/types/api";

interface RegisterUser {
  jwt: string;
  user: User;
}

interface UserStrapi {
  id: string;
  username: string;
  email: string;
}

const API_BASE_URL =
  import.meta.env.VITE_STRAPI_URL || "http://localhost:1337/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/local", {
      identifier: email,
      password,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post("/auth/local/register", {
      username: userData.email,
      email: userData.email,
      password: userData.password,
      //accountType: userData.accountType
    });
    return response.data;
  },

  updateUserAccountType: async (userId: string, accountType: string) => {
    const response = await apiClient.put(`/users/${userId}`, {
      accountType, // Updating account type
    });
    return response.data;
  },

  customer: async (userData, id) => {
    const response = await apiClient.post("/customers", {
      data: {
        fullName: userData.fullName,
        phone: userData.phone,
        // accountType: "customer",
        user: id,
      },
    });
    return response.data;
  },

  provider: async (userData, id) => {
    const response = await apiClient.post("/providers", {
      data: {
        businessName: userData.fullName,
        hourlyRate: userData.hourlyRate,
        yearsExperience: userData.experience,
        service_types: userData.serviceTypes,
        serviceArea: {
          radius: userData.serviceRadius,
        },
        vehicleSpecs: userData.vehicleDetails,
        // accountType: "provider",
        user: id,
      },
    });
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get("/users/me?populate=*");
    return response.data;
  },
};

export const serviceRequestAPI = {
  create: async (requestData: any, id) => {
    const response = await apiClient.post("/service-requests", {
      data: {
        tireSize: requestData.tireSize,
        tireStatus: requestData.tireStatus,
        serviceType: requestData.serviceType,
        budget: requestData.budget,
        urgency: requestData.priority,
        photos: requestData.photos,
        notes: requestData.description,
        customer: requestData.customer,
        location: {
          address: requestData.location,
        },
      },
    });
    return response.data;
  },

  getAll: async (filters?: unknown) => {
    const response = await apiClient.get("/service-requests?populate=*", {
      params: filters,
    });
    return response.data;
  },
  getAllCompleted: async (filters?: unknown) => {
    const response = await apiClient.get(
      "/service-requests?filters[tireStatus][$eq]=Completed",
      {
        params: filters,
      }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(
      `/service-requests/${id}?populate[0]=customer&populate[1]=location&populate[2]=accepted_bid&populate[3]=accepted_bid.provider`
    );
    return response.data;
  },

  update: async (id: string, updates: Partial<ServiceRequest>) => {
    const response = await apiClient.put(`/service-requests/${id}`, {
      data: updates,
    });
    return response.data;
  },
};

export const bidAPI = {
  create: async (bidData: Partial<Bid>) => {
    const response = await apiClient.post("/bids", { data: bidData });
    return response.data;
  },

  update: async (bidData: Partial<Bid>, id) => {
    const response = await apiClient.put(`/bids/${id}`, { data: bidData });
    return response.data;
  },

  getByRequest: async (requestId: string) => {
    const response = await apiClient.get(
      `/bids?filters[requestId][$eq]=${requestId}&populate=*`
    );
    return response.data;
  },

  accept: async (bidId: string) => {
    const response = await apiClient.put(`/bids/${bidId}`, {
      data: { status: "accepted" },
    });
    return response.data;
  },
};

export const walletAPI = {
  getBalance: async () => {
    const response = await apiClient.get("/wallet/balance");
    return response.data;
  },

  getTransactions: async () => {
    const response = await apiClient.get("/wallet-transactions?populate=*");
    return response.data;
  },

  topUp: async (amount: number) => {
    const response = await apiClient.post("/wallet/top-up", { amount });
    return response.data;
  },

  withdraw: async (amount: number) => {
    const response = await apiClient.post("/wallet/withdraw", { amount });
    return response.data;
  },
};

export const ratingAPI = {
  create: async (ratingData: Partial<Rating>) => {
    const response = await apiClient.post("/ratings", { data: ratingData });
    return response.data;
  },

  getByProvider: async (providerId: string) => {
    const response = await apiClient.get(
      `/ratings?filters[providerId][$eq]=${providerId}&populate=*`
    );
    return response.data;
  },
};
