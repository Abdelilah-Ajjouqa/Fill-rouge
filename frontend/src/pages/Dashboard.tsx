import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { SuperAdminDashboard } from '../components/dashboard/SuperAdminDashboard/SuperAdminDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard/AdminDashboard';
import { CoachDashboard } from '../components/dashboard/Coach/CoachDashboard';
import { MemberDashboard } from '../components/dashboard/Member/MemberDashboard';

export const Dashboard = () => {
    const userRole = useSelector((state: RootState) => state.auth.user?.role) || 'MEMBER';

    switch (userRole) {
        case 'SUPER_ADMIN':
            return <SuperAdminDashboard />;
        case 'ADMIN':
            return <AdminDashboard />;
        case 'COACH':
            return <CoachDashboard />;
        case 'MEMBER':
        default:
            return <MemberDashboard />;
    }
};