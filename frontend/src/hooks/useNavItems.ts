import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Activity, LayoutGrid, Calendar, BarChart3, Settings, Users } from 'lucide-react';

export type NavItem = {
    name: string;
    icon: LucideIcon;
    path: string;
};

const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
    SUPER_ADMIN: [
        { name: 'Clubs & Staff', icon: LayoutGrid, path: '/dashboard' },
        { name: 'Schedule', icon: Calendar, path: '/dashboard/schedule' },
        { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
        { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
    ],
    ADMIN: [
        { name: 'Gym Overview', icon: LayoutGrid, path: '/dashboard' },
        { name: 'Activities', icon: Activity, path: '/dashboard/activities' },
        { name: 'Members', icon: Users, path: '/dashboard/members' },
    ],
    COACH: [
        { name: 'My Activity', icon: LayoutGrid, path: '/dashboard' },
        { name: 'My Members', icon: Users, path: '/dashboard/my-members' },
        { name: 'Schedules', icon: Calendar, path: '/dashboard/schedules' },
    ],
    DEFAULT: [
        { name: 'My Dashboard', icon: LayoutGrid, path: '/dashboard' },
        { name: 'My Schedule', icon: Calendar, path: '/dashboard/schedule' },
    ],
};

export const useNavItems = (role: string) => {
    return useMemo(() => NAV_ITEMS_BY_ROLE[role] ?? NAV_ITEMS_BY_ROLE.DEFAULT, [role]);
};
