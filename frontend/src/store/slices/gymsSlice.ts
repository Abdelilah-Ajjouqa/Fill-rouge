import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import type { Gym } from '../../types/models';

interface GymsState {
  gyms: Gym[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GymsState = {
  gyms: [],
  isLoading: false,
  error: null,
};

// Thunk to fetch all gyms (Super Admin)
export const fetchGyms = createAsyncThunk<Gym[], void, { rejectValue: string }>(
  'gyms/fetchGyms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Gym[]>('/gyms');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gyms');
    }
  }
);

// Thunk to create a new gym (Super Admin)
export const createGym = createAsyncThunk<Gym, Partial<Gym>, { rejectValue: string }>(
  'gyms/createGym',
  async (gymData, { rejectWithValue }) => {
    try {
      const response = await api.post<Gym>('/gyms', gymData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create gym');
    }
  }
);

const gymsSlice = createSlice({
  name: 'gyms',
  initialState,
  reducers: {
    clearGymsError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Gyms
    builder.addCase(fetchGyms.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchGyms.fulfilled, (state, action) => {
      state.isLoading = false;
      state.gyms = action.payload;
    });
    builder.addCase(fetchGyms.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Gym
    builder.addCase(createGym.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createGym.fulfilled, (state, action) => {
      state.isLoading = false;
      state.gyms.push(action.payload);
    });
    builder.addCase(createGym.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearGymsError } = gymsSlice.actions;
export default gymsSlice.reducer;
