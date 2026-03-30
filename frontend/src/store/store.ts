import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import activitiesReducer from './slices/activitiesSlice';
import gymsReducer from './slices/gymsSlice';
import membersReducer from './slices/membersSlice';
import paymentsReducer from './slices/paymentsSlice';
import subscriptionsReducer from './slices/subscriptionsSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activities: activitiesReducer,
    gyms: gymsReducer,
    members: membersReducer,
    payments: paymentsReducer,
    subscriptions: subscriptionsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
