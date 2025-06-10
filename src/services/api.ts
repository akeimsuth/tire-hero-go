import axios from "axios";
import {
  ServiceRequest,
  Bid,
  User,
  WalletTransaction,
  Rating,
} from "@/types/api";
import { store } from '@/store/store';

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
  const token = store.getState().auth.token;
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
      role: userData.role,
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
        businessName: userData.businessName,
        hourlyRate: userData.hourlyRate,
        yearsExperience: userData.experience,
        service_types: userData.serviceTypes,
        serviceArea: {
          radius: userData.serviceRadius,
        },
        vehicleSpecs: userData.vehicleDetails,
        // accountType: "provider",
        user: id,
        online: userData.online,
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
  create: async (requestData: any, customerId) => {
    const response = await apiClient.post("/service-requests", {
      data: {
        tireSize: requestData.tireSize,
        tireStatus: requestData.tireStatus,
        serviceType: requestData.serviceType,
        budget: requestData.budget,
        urgency: requestData.priority,
        photos: requestData.photos,
        notes: requestData.description,
        customer: customerId,
        location: requestData.location,
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
  getAllByProvider: async (provider?: unknown) => {
    const response = await apiClient.get(`/service-requests?filters[provider][documentId][$eq]=${provider}&populate=*`);
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

export const adminAPI = {
  usersCount: async (bidData: any) => {
    const response = await apiClient.get("/dashboard");
    return response.data;
  },

  updateProvider: async (id: string, status: any) => {
    const response = await apiClient.put(`/providers/${id}`, { data: status });
    return response.data;
  },

  getProviders: async () => {
    const response = await apiClient.get(
      `/providers?filters[isApproved][$ne]=1&populate=*`
    );
    return response.data;
  },

  accept: async (bidId: string) => {
    const response = await apiClient.put(`/bids/${bidId}`, {
      data: { bidStatus: "accepted" },
    });
    return response.data;
  },
};

export const bidAPI = {
  create: async (bidData: any) => {
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
      data: { bidStatus: "accepted" },
    });
    return response.data;
  },
};

export const dashboardAPI = {
  updateHomepage: async (home: any) => {
    const response = await apiClient.put(`/home`, { data: home });
    return response.data;
  },

  updateAPI: async (key: any) => {
    const response = await apiClient.put(`/api-key`, { data: key });
    return response.data;
  },

  getHome: async () => {
    const response = await apiClient.get(
      `/home?populate=*`
    );
    return response.data;
  },
  getAPI: async () => {
    const response = await apiClient.get(
      `/api-key`
    );
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await apiClient.get(
      `/statistics`
    );
    return response.data;
  },
};


export const stripeAPI = {
  create: async (stripeData: any) => {
    const response = await apiClient.post("/stripes", { data: stripeData });
    return response.data;
  },

  update: async (id: string, stripeData: any) => {
    const response = await apiClient.put(`/stripes/${id}`, { data: stripeData });
    return response.data;
  },

  getById: async (providerId: string) => {
    const response = await apiClient.get(
      `/stripes?filters[providerId][documentId][$eq]=${providerId}&populate=*`
    );
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

export const providerAPI = {
  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/providers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching provider:", error);
      throw error;
    }
  },

  update: async (id: string, data: {
    businessName?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    services?: string;
    description?: string;
  }) => {
    try {
      const response = await apiClient.put(`/providers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating provider:", error);
      throw error;
    }
  },

  getStripeStatus: async (id: string) => {
    try {
      const response = await apiClient.get(`/providers/${id}/stripe-status`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Stripe status:", error);
      throw error;
    }
  },

  createStripeAccount: async (id: string) => {
    try {
      const response = await apiClient.post(`/providers/${id}/create-stripe-account`);
      return response.data;
    } catch (error) {
      console.error("Error creating Stripe account:", error);
      throw error;
    }
  },

  updateStripeStatus: async (id: string, status: string) => {
    try {
      const response = await apiClient.put(`/providers/${id}/stripe-status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating Stripe status:", error);
      throw error;
    }
  }
};

export const customerAPI = {
  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching provider:", error);
      throw error;
    }
  },

  update: async (id: string, data) => {
    try {
      const response = await apiClient.put(`/customers/${id}`, { data: data});
      return response.data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }
};
