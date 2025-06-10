import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ServiceRequest as ApiServiceRequest } from '@/types/api';

interface Location {
  address: string;
  lat: number;
  lng: number;
}

// Extend the API ServiceRequest type and add extra fields as optional
export interface ServiceRequest extends ApiServiceRequest {
  tireBrand?: string;
  description?: string;
  priority?: string;
  scheduledTime?: string;
  status?: string;
}

interface RequestState {
  requests: ServiceRequest[];
  selectedRequest: ServiceRequest | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RequestState = {
  requests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
};

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setRequests: (state, action: PayloadAction<ServiceRequest[]>) => {
      state.requests = action.payload;
    },
    addRequest: (state, action: PayloadAction<ServiceRequest>) => {
      state.requests.push(action.payload);
    },
    updateRequest: (state, action: PayloadAction<ServiceRequest>) => {
      const index = state.requests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    },
    setSelectedRequest: (state, action: PayloadAction<ServiceRequest | null>) => {
      state.selectedRequest = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRequests,
  addRequest,
  updateRequest,
  setSelectedRequest,
  setLoading,
  setError,
} = requestSlice.actions;

export default requestSlice.reducer; 