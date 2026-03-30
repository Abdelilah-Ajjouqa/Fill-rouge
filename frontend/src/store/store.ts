import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import activitiesReducer from './slices/activitiesSlice';
import gymsReducer from './slices/gymsSlice';
import membersReducer from './slices/membersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activities: activitiesReducer,
    gyms: gymsReducer,
    members: membersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
