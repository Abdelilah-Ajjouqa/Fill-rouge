import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api/axios';
import type { User } from '../../types/auth';
import type { UserInput, UsersState } from '../interfaces';

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>('users/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<User[]>('/users');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users',
      );
    }
    return rejectWithValue('Failed to fetch users');
  }
});

export const createUser = createAsyncThunk<
  User,
  UserInput,
  { rejectValue: string }
>('users/createUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<User>('/users', payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create user',
      );
    }
    return rejectWithValue('Failed to create user');
  }
});

export const updateUser = createAsyncThunk<
  User,
  { id: string; data: Partial<UserInput> },
  { rejectValue: string }
>('users/updateUser', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user',
      );
    }
    return rejectWithValue('Failed to update user');
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('users/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/users/${id}`);
    return id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user',
      );
    }
    return rejectWithValue('Failed to delete user');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users.push(action.payload);
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.users.findIndex(
        (user) => user._id === action.payload._id,
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = state.users.filter((user) => user._id !== action.payload);
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
