import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";
import type { Activity } from "../../types/models";
import type { ActivitiesState, ActivityInput } from "../interfaces";

const initialState: ActivitiesState = {
  activities: [],
  isLoading: false,
  error: null,
};

export const fetchActivities = createAsyncThunk<
  Activity[],
  void,
  { rejectValue: string }
>("activities/fetchActivities", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Activity[]>("/activities");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activities",
      );
    }
    return rejectWithValue("Failed to fetch activities");
  }
});

export const createActivity = createAsyncThunk<
  Activity,
  ActivityInput,
  { rejectValue: string }
>("activities/createActivity", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<Activity>("/activities", payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create activity",
      );
    }
    return rejectWithValue("Failed to create activity");
  }
});

export const updateActivity = createAsyncThunk<
  Activity,
  { id: string; data: ActivityInput },
  { rejectValue: string }
>("activities/updateActivity", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.patch<Activity>(`/activities/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update activity",
      );
    }
    return rejectWithValue("Failed to update activity");
  }
});

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    clearActivitiesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchActivities.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchActivities.fulfilled, (state, action) => {
      state.isLoading = false;
      state.activities = action.payload;
    });
    builder.addCase(fetchActivities.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createActivity.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createActivity.fulfilled, (state, action) => {
      state.isLoading = false;
      state.activities.push(action.payload);
    });
    builder.addCase(createActivity.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateActivity.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateActivity.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.activities.findIndex(
        (activity) => activity._id === action.payload._id,
      );
      if (index !== -1) {
        state.activities[index] = action.payload;
      }
    });
    builder.addCase(updateActivity.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearActivitiesError } = activitiesSlice.actions;
export default activitiesSlice.reducer;
