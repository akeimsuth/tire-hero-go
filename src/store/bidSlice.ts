import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Provider {
  id: string;
  name: string;
  rating: number;
  completedJobs: number;
  responseTime: string;
  distance: number;
}

interface Bid {
  id: string;
  provider: Provider;
  amount: number;
  estimatedTime: string;
  message: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

interface BidState {
  bids: Bid[];
  selectedBid: Bid | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BidState = {
  bids: [],
  selectedBid: null,
  isLoading: false,
  error: null,
};

const bidSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    setBids: (state, action: PayloadAction<Bid[]>) => {
      state.bids = action.payload;
    },
    addBid: (state, action: PayloadAction<Bid>) => {
      state.bids.unshift(action.payload);
    },
    acceptBid: (state, action: PayloadAction<string>) => {
      const bid = state.bids.find(b => b.id === action.payload);
      if (bid) {
        bid.status = 'accepted';
        state.selectedBid = bid;
      }
    },
    updateBid: (state, action: PayloadAction<Bid>) => {
      const index = state.bids.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bids[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setBids, addBid, acceptBid, updateBid, setLoading, setError } = bidSlice.actions;
export default bidSlice.reducer; 