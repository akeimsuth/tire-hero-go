import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProviderState {
  isOnline: boolean;
}

const initialState: ProviderState = {
  isOnline: false,
};

const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
  },
});

export const { setOnlineStatus } = providerSlice.actions;
export default providerSlice.reducer; 