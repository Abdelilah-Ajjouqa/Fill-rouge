import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchProfile } from '../store/slices/authSlice';

export const ProtectedRoute = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user, isLoading, token } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (token && !user && !isLoading) {
            dispatch(fetchProfile());
        }
    }, [token, user, isLoading, dispatch]);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!user && isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin"></div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Authenticating...</p>
                </div>
            </div>
        );
    }

    return <Outlet />;
};
