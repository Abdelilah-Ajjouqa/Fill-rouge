import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api/axios';

export type StaffRole = 'ADMIN' | 'COACH';

export interface StaffUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: StaffRole;
    gymId: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateStaffPayload {
    gymId: string;
    email: string;
    password: string;
    role: StaffRole;
    firstName: string;
    lastName: string;
}

interface StaffState {
    staff: StaffUser[];
    activeGymId: string | null;
    isLoading: boolean;
    isCreating: boolean;
    error: string | null;
}

const initialState: StaffState = {
    staff: [],
    activeGymId: null,
    isLoading: false,
    isCreating: false,
    error: null,
};

export const fetchStaffByGym = createAsyncThunk<
    StaffUser[],
    string,
    { rejectValue: string }
>('staff/fetchStaffByGym', async (gymId, { rejectWithValue }) => {
    try {
        const response = await api.get<StaffUser[]>(`/users?gymId=${encodeURIComponent(gymId)}`);

        // Keep this slice strictly staff-focused and gym-scoped.
        return response.data.filter(
            (user) => {
                const roleAllowed = user.role === 'ADMIN' || user.role === 'COACH';
                const gymRef = user.gymId as unknown as string | { _id?: string } | null;
                const userGymId = typeof gymRef === 'string' ? gymRef : gymRef?._id ?? null;

                return roleAllowed && userGymId === gymId;
            },
        );
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff');
        }
        return rejectWithValue('Failed to fetch staff');
    }
});

export const createStaff = createAsyncThunk<
    StaffUser,
    CreateStaffPayload,
    { rejectValue: string }
>('staff/createStaff', async (payload, { rejectWithValue }) => {
    try {
        if (payload.role !== 'ADMIN' && payload.role !== 'COACH') {
            return rejectWithValue('Role must be ADMIN or COACH');
        }

        const response = await api.post<StaffUser>('/auth/register', payload);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create staff');
        }
        return rejectWithValue('Failed to create staff');
    }
});

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        clearStaff(state) {
            state.staff = [];
            state.activeGymId = null;
            state.error = null;
            state.isLoading = false;
            state.isCreating = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchStaffByGym.pending, (state, action) => {
            state.isLoading = true;
            state.error = null;
            state.activeGymId = action.meta.arg;
        });
        builder.addCase(fetchStaffByGym.fulfilled, (state, action) => {
            state.isLoading = false;
            state.staff = action.payload;
        });
        builder.addCase(fetchStaffByGym.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        builder.addCase(createStaff.pending, (state) => {
            state.isCreating = true;
            state.error = null;
        });
        builder.addCase(createStaff.fulfilled, (state, action) => {
            state.isCreating = false;

            const exists = state.staff.some((user) => user._id === action.payload._id);
            if (!exists) {
                state.staff.push(action.payload);
            }
        });
        builder.addCase(createStaff.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearStaff } = staffSlice.actions;
export default staffSlice.reducer;