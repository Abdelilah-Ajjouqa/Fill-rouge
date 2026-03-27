import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch gyms');
      }
      return rejectWithValue('Failed to fetch gyms');
    }
  }
);

// Thunk to create a new gym (Super Admin)
export const createGym = createAsyncThunk<Gym, FormData, { rejectValue: string }>(
  'gyms/createGym',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post<Gym>('/gyms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create gym');
      }
      return rejectWithValue('Failed to create gym');
    }
  }
);

// Thunk for Deleting a Gym
export const deleteGym = createAsyncThunk(
  'gyms/deleteGym',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/gyms/${id}`);
      return id; // Return the ID so we can remove it from the state
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete gym');
    }
  }
);

// Thunk for Updating a Gym
export const updateGym = createAsyncThunk(
  'gyms/updateGym',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      // Remember: We use PATCH for partial updates
      const response = await api.patch(`/gyms/${id}`, formData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update gym');
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

    // Delete Gym
    builder.addCase(deleteGym.fulfilled, (state, action: PayloadAction<string>) => {
      state.gyms = state.gyms.filter(gym => gym._id !== action.payload);
    });

    // Update Gym
    builder.addCase(updateGym.fulfilled, (state, action: PayloadAction<any>) => {
      const index = state.gyms.findIndex(gym => gym._id === action.payload._id);
      if (index !== -1) {
        state.gyms[index] = action.payload;
      }
    });
  },
});

export const { clearGymsError } = gymsSlice.actions;
export default gymsSlice.reducer;
