import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api/axios';
import type { Member } from '../../types/models';
import type { MemberInput, MembersState } from '../interfaces';

const initialState: MembersState = {
    members: [],
    isLoading: false,
    error: null,
};

// Thunk to fetch all members (Admin)
export const fetchMembers = createAsyncThunk<Member[], void, { rejectValue: string }>(
    'members/fetchMembers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<Member[]>('/members');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
            }
            return rejectWithValue('Failed to fetch members');
        }
    }
);

// Thunk to create a new member (Admin)
export const createMember = createAsyncThunk<Member, MemberInput, { rejectValue: string }>(
    'members/createMember',
    async (memberData, { rejectWithValue }) => {
        try {
            const response = await api.post<Member>('/members', memberData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Failed to create member');
            }
            return rejectWithValue('Failed to create member');
        }
    }
);

// Thunk for deleting a member
export const deleteMember = createAsyncThunk<string, string, { rejectValue: string }>(
    'members/deleteMember',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/members/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete member');
        }
    }
);

// Thunk for updating a member
export const updateMember = createAsyncThunk<
    Member,
    { id: string; data: Partial<MemberInput> },
    { rejectValue: string }
>(
    'members/updateMember',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.patch<Member>(`/members/${id}`, data);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update member');
        }
    }
);

const membersSlice = createSlice({
    name: 'members',
    initialState,
    reducers: {
        clearMembersError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Members
        builder.addCase(fetchMembers.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMembers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.members = action.payload;
        });
        builder.addCase(fetchMembers.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Create Member
        builder.addCase(createMember.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createMember.fulfilled, (state, action) => {
            state.isLoading = false;
            state.members.push(action.payload);
        });
        builder.addCase(createMember.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Delete Member
        builder.addCase(deleteMember.fulfilled, (state, action: PayloadAction<string>) => {
            state.members = state.members.filter(member => member._id !== action.payload);
        });

        // Update Member
        builder.addCase(updateMember.fulfilled, (state, action: PayloadAction<Member>) => {
            const index = state.members.findIndex(member => member._id === action.payload._id);
            if (index !== -1) {
                state.members[index] = action.payload;
            }
        });
    },
});

export const { clearMembersError } = membersSlice.actions;
export default membersSlice.reducer;
