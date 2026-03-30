import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutGrid, Calendar, BarChart3, Settings, User, Users, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const BRANDING_STORAGE_KEY = 'superadmin_branding';

type BrandingState = {
    platformName: string;
    logoUrl: string;
    tagline: string;
};

const defaultBranding: BrandingState = {
    platformName: 'FitManager',
    logoUrl: '',
    tagline: 'Global fitness operations',
};

const formatRoleLabel = (role: string) => role
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

export const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const userRole = user?.role || 'MEMBER';
    const [branding, setBranding] = useState<BrandingState>(defaultBranding);

    const profileName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
    const profileRole = formatRoleLabel(userRole);

    useEffect(() => {
        const loadBranding = () => {
            if (typeof window === 'undefined') {
                setBranding(defaultBranding);
                return;
            }

            const stored = window.localStorage.getItem(BRANDING_STORAGE_KEY);
            if (!stored) {
                setBranding(defaultBranding);
                return;
            }

            try {
                const parsed = JSON.parse(stored) as Partial<BrandingState>;
                setBranding({
                    platformName: parsed.platformName || defaultBranding.platformName,
                    logoUrl: parsed.logoUrl || defaultBranding.logoUrl,
                    tagline: parsed.tagline || defaultBranding.tagline,
                });
            } catch {
                setBranding(defaultBranding);
            }
        };

        loadBranding();

        window.addEventListener('storage', loadBranding);
        window.addEventListener('branding-updated', loadBranding);

        return () => {
            window.removeEventListener('storage', loadBranding);
            window.removeEventListener('branding-updated', loadBranding);
        };
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Role-based Nav
    let navItems = [
        { name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' }
    ];

    if (userRole === 'SUPER_ADMIN') {
        navItems = [
            { name: 'Clubs & Staff', icon: LayoutGrid, path: '/dashboard' },
            { name: 'Schedule', icon: Calendar, path: '/dashboard/schedule' },
            { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
            { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
        ]
    } else if (userRole === 'ADMIN') {
        navItems = [
            { name: 'Gym Overview', icon: LayoutGrid, path: '/dashboard' },
            { name: 'Activities', icon: Activity, path: '/dashboard/activities' },
            { name: 'Members', icon: Users, path: '/dashboard/members' },
        ]
    } else if (userRole === 'COACH') {
        navItems = [
            { name: 'My Activity', icon: LayoutGrid, path: '/dashboard' },
            { name: 'My Members', icon: Users, path: '/dashboard/my-members' },
            { name: 'Schedules', icon: Calendar, path: '/dashboard/schedules' }
        ]
    } else {
        navItems = [
            { name: 'My Dashboard', icon: LayoutGrid, path: '/dashboard' },
            { name: 'My Schedule', icon: Calendar, path: '/dashboard/schedule' },
        ]
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white font-sans antialiased">
            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 border-r border-white/10 bg-slate-950 flex flex-col shrink-0" data-purpose="global-sidebar">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-brand flex items-center justify-center">
                            {branding.logoUrl ? (
                                <img
                                    src={branding.logoUrl}
                                    alt={`${branding.platformName} logo`}
                                    className="h-5 w-5 object-cover"
                                />
                            ) : (
                                <Activity className="text-black h-5 w-5" />
                            )}
                        </div>
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-xl font-bold tracking-tighter truncate">{branding.platformName}</p>
                            <p className="text-[10px] text-white/40 truncate">{branding.tagline}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.name} 
                                to={item.path} 
                                className={`flex items-center gap-4 p-3 border group transition-all ${isActive ? 'bg-white/5 text-brand border-white/10' : 'text-white/50 border-transparent hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="hidden lg:block font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-2 mb-2">
                        <div className="h-8 w-8 bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                            <User className="h-4 w-4 text-white/60" />
                        </div>
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-xs font-bold truncate">{profileName}</p>
                            <p className="text-[10px] text-white/40 uppercase truncate">{profileRole}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center lg:justify-start gap-4 p-2 mt-2 border border-transparent text-white/50 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="hidden lg:block font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 shrink-0 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10" data-purpose="top-navigation">
                    <div className="flex items-center gap-6">
                        <h1 className="text-lg font-medium text-white/90">
                            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-brand/80 font-bold uppercase tracking-widest">Network Status</p>
                            <p className="text-xs text-white/40">Synchronized (0ms latency)</p>
                        </div>
                        <div className="h-2 w-2 bg-brand rounded-full animate-pulse shadow-[0_0_8px_#DFFF00]"></div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>

                {/* Footer / Global Status */}
                <footer className="h-8 border-t border-white/10 flex items-center justify-between px-8 text-[10px] font-mono text-white/30 uppercase tracking-widest shrink-0" data-purpose="system-status">
                    <div className="flex gap-6">
                        {userRole === 'SUPER_ADMIN' && <span>Live Nodes: 05</span>}
                        {userRole === 'SUPER_ADMIN' && <span>Global Members: 12,402</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-brand"></span>
                        System Operational
                    </div>
                </footer>
            </main>
        </div>
    )
}
