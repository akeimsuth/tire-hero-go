import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './authSlice';
import providerReducer from './slices/providerSlice';
import requestReducer from './requestSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'provider', 'requests'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  provider: providerReducer,
  requests: requestReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 