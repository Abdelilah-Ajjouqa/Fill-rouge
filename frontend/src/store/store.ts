import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gymsReducer from './slices/gymsSlice';
import staffReducer from './slices/staffSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gyms: gymsReducer,
    staff: staffReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
