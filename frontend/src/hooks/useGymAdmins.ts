import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchUsers } from '../store/slices/usersSlice';
import type { User } from '../types/auth';

type UseGymAdminsResult = {
    admins: User[];
    isLoading: boolean;
    error: string | null;
};

export const useGymAdmins = (gymId?: string): UseGymAdminsResult => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, isLoading: usersLoading, error } = useSelector(
        (state: RootState) => state.users,
    );

    useEffect(() => {
        if (!gymId) {
            return;
        }
        dispatch(fetchUsers());
    }, [dispatch, gymId]);

    const admins = useMemo(() => {
        if (!gymId) {
            return [];
        }
        return users.filter((user) => user.role === 'ADMIN' && user.gymId === gymId);
    }, [gymId, users]);

    return {
        admins,
        isLoading: Boolean(gymId) && usersLoading,
        error: gymId ? error : 'Missing gym id.',
    };
};
