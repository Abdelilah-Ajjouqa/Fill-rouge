import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api/axios';
import type { Payment } from '../../types/models';
import type { PaymentsState } from '../interfaces';

const initialState: PaymentsState = {
  payments: [],
  isLoading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk<
  Payment[],
  void,
  { rejectValue: string }
>('payments/fetchPayments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Payment[]>('/payments');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch payments',
      );
    }
    return rejectWithValue('Failed to fetch payments');
  }
});

export const fetchMyPayments = createAsyncThunk<
  Payment[],
  void,
  { rejectValue: string }
>('payments/fetchMyPayments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Payment[]>('/payments/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch payments',
      );
    }
    return rejectWithValue('Failed to fetch payments');
  }
});

export const fetchPaymentsByGym = createAsyncThunk<
  Payment[],
  string,
  { rejectValue: string }
>('payments/fetchPaymentsByGym', async (gymId, { rejectWithValue }) => {
  try {
    const response = await api.get<Payment[]>('/payments', {
      params: { gymId },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch payments',
      );
    }
    return rejectWithValue('Failed to fetch payments');
  }
});

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPayments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPayments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.payments = action.payload;
    });
    builder.addCase(fetchPayments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchMyPayments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyPayments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.payments = action.payload;
    });
    builder.addCase(fetchMyPayments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchPaymentsByGym.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentsByGym.fulfilled, (state, action) => {
      state.isLoading = false;
      state.payments = action.payload;
    });
    builder.addCase(fetchPaymentsByGym.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearPaymentsError } = paymentsSlice.actions;
export default paymentsSlice.reducer;
