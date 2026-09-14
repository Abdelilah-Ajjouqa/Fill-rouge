import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api/axios';
import type { Subscription } from '../../types/models';
import type { SubscriptionsState } from '../interfaces';

const initialState: SubscriptionsState = {
  subscriptions: [],
  isLoading: false,
  error: null,
};

export const fetchSubscriptions = createAsyncThunk<
  Subscription[],
  void,
  { rejectValue: string }
>('subscriptions/fetchSubscriptions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Subscription[]>('/subscriptions');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch subscriptions',
      );
    }
    return rejectWithValue('Failed to fetch subscriptions');
  }
});

export const fetchMySubscriptions = createAsyncThunk<
  Subscription[],
  void,
  { rejectValue: string }
>('subscriptions/fetchMySubscriptions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Subscription[]>('/subscriptions/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch subscriptions',
      );
    }
    return rejectWithValue('Failed to fetch subscriptions');
  }
});

export const fetchSubscriptionsByGym = createAsyncThunk<
  Subscription[],
  string,
  { rejectValue: string }
>('subscriptions/fetchSubscriptionsByGym', async (gymId, { rejectWithValue }) => {
  try {
    const response = await api.get<Subscription[]>('/subscriptions', {
      params: { gymId },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch subscriptions',
      );
    }
    return rejectWithValue('Failed to fetch subscriptions');
  }
});

export const createSubscription = createAsyncThunk<
  Subscription,
  { member: string; activity: string; startDate: string; endDate?: string },
  { rejectValue: string }
>('subscriptions/createSubscription', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post<Subscription>('/subscriptions', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create subscription',
      );
    }
    return rejectWithValue('Failed to create subscription');
  }
});

export const renewSubscription = createAsyncThunk<
  Subscription,
  string,
  { rejectValue: string }
>('subscriptions/renewSubscription', async (id, { rejectWithValue }) => {
  try {
    const response = await api.post<Subscription>(`/subscriptions/${id}/renew`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to renew subscription',
      );
    }
    return rejectWithValue('Failed to renew subscription');
  }
});

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearSubscriptionsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSubscriptions.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSubscriptions.fulfilled, (state, action) => {
      state.isLoading = false;
      state.subscriptions = action.payload;
    });
    builder.addCase(fetchSubscriptions.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchMySubscriptions.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMySubscriptions.fulfilled, (state, action) => {
      state.isLoading = false;
      state.subscriptions = action.payload;
    });
    builder.addCase(fetchMySubscriptions.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchSubscriptionsByGym.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSubscriptionsByGym.fulfilled, (state, action) => {
      state.isLoading = false;
      state.subscriptions = action.payload;
    });
    builder.addCase(fetchSubscriptionsByGym.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createSubscription.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createSubscription.fulfilled, (state, action) => {
      state.isLoading = false;
      state.subscriptions.push(action.payload);
    });
    builder.addCase(createSubscription.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(renewSubscription.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(renewSubscription.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.subscriptions.findIndex(
        (sub) => sub._id === action.payload._id,
      );
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      } else {
        state.subscriptions.push(action.payload);
      }
    });
    builder.addCase(renewSubscription.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearSubscriptionsError } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
