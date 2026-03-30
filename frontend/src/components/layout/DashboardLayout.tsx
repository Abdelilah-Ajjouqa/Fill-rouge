import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { useNavItems } from '../../hooks/useNavItems';

type defaultBrandingState = {
    platformName: string;
    logoUrl: string;
    tagline: string;
};

const defaultBranding: defaultBrandingState = {
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


    const profileName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
    const profileRole = formatRoleLabel(userRole);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = useNavItems(userRole);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white font-sans antialiased">
            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 border-r border-white/10 bg-slate-950 flex flex-col shrink-0" data-purpose="global-sidebar">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-brand flex items-center justify-center">
                            {defaultBranding.logoUrl ? (
                                <img
                                    src={defaultBranding.logoUrl}
                                    alt={`${defaultBranding.platformName} logo`}
                                    className="h-5 w-5 object-cover"
                                />
                            ) : (
                                <Activity className="text-black h-5 w-5" />
                            )}
                        </div>
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-xl font-bold tracking-tighter truncate">{defaultBranding.platformName}</p>
                            <p className="text-[10px] text-white/40 truncate">{defaultBranding.tagline}</p>
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
                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>

                {/* Footer / Global Status */}
                <footer className="h-8 border-t border-white/10 flex items-center justify-between px-8 text-[10px] font-mono text-white/30 uppercase tracking-widest shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-brand"></span>
                        System Operational
                    </div>
                </footer>
            </main>
        </div>
    )
}
