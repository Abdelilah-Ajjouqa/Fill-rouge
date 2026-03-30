import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, Users, UserCog, DollarSign, Activity, AlertCircle } from 'lucide-react';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchGyms } from '../../../store/slices/gymsSlice';
import { fetchMembers } from '../../../store/slices/membersSlice';
import { fetchPayments } from '../../../store/slices/paymentsSlice';
import { fetchSubscriptions } from '../../../store/slices/subscriptionsSlice';
import { fetchUsers } from '../../../store/slices/usersSlice';
import { StatCard } from '../StatCard';

const getGymId = (g: any) => typeof g === 'string' ? g : (g?._id || '');
const formatCurrency = (v: number) => `${v.toLocaleString()} DH`;
const formatDate = (v?: string) => v && !Number.isNaN(new Date(v).getTime()) ? new Date(v).toLocaleDateString() : '--';

export const SuperAdminAnalyticsPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isSuperAdmin = useSelector((state: RootState) => state.auth.user?.role) === 'SUPER_ADMIN';
    const { gyms, isLoading: gymsLoading, error: gymsError } = useSelector((state: RootState) => state.gyms);
    const { users, isLoading: usersLoading, error: usersError } = useSelector((state: RootState) => state.users);
    const { members, isLoading: membersLoading, error: membersError } = useSelector((state: RootState) => state.members);
    const { payments, isLoading: paymentsLoading, error: paymentsError } = useSelector((state: RootState) => state.payments);
    const { subscriptions, isLoading: subscriptionsLoading, error: subscriptionsError } = useSelector((state: RootState) => state.subscriptions);
    
    const isLoading = gymsLoading || usersLoading || membersLoading || paymentsLoading || subscriptionsLoading;
    const error = gymsError || usersError || membersError || paymentsError || subscriptionsError;

    useEffect(() => {
        if (!isSuperAdmin) return;
        dispatch(fetchGyms()); dispatch(fetchUsers()); dispatch(fetchMembers()); dispatch(fetchPayments()); dispatch(fetchSubscriptions());
    }, [dispatch, isSuperAdmin]);

    const gymsMap = useMemo(() => new Map(gyms.map(g => [g._id, g])), [gyms]);
    
    const activeGyms = gyms.filter(g => g.isActive).length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const coachCount = users.filter(u => u.role === 'COACH').length;
    
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyRevenue = payments.reduce((sum, p) => p.paidAt && new Date(p.paidAt) >= monthStart ? sum + p.amount : sum, 0);
    
    const activeSubs = subscriptions.filter(s => s.status === 'active').length;
    const expiredSubs = subscriptions.filter(s => s.status === 'expired').length;

    const topGyms = useMemo(() => {
        const counts = new Map<string, number>();
        members.forEach(m => { const id = typeof m.gymId === 'string' ? m.gymId : ''; if (id) counts.set(id, (counts.get(id) || 0) + 1); });
        return Array.from(counts.entries()).map(([gymId, count]) => ({ gymId, count, name: gymsMap.get(gymId)?.name || 'Unknown Gym' })).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [members, gymsMap]);

    const latestPayments = useMemo(() => [...payments].sort((a, b) => (b.paidAt ? new Date(b.paidAt).getTime() : 0) - (a.paidAt ? new Date(a.paidAt).getTime() : 0)).slice(0, 5), [payments]);

    if (!isSuperAdmin) return <div className="p-8"><div className="bg-slate-900 border border-white/10 p-6"><h2 className="text-lg font-bold">Analytics</h2><p className="text-white/40 text-sm mt-2">Super Admins only.</p></div></div>;

    const cards = [
        { t: 'Active Gyms', v: activeGyms, i: <Building2 className="h-5 w-5" />, s: `${gyms.length} total gyms` },
        { t: 'Total Members', v: members.length, i: <Users className="h-5 w-5" />, s: 'Across all gyms' },
        { t: 'Total Staff', v: adminCount + coachCount, i: <UserCog className="h-5 w-5" />, s: `${adminCount} admins · ${coachCount} coaches` },
        { t: 'Monthly Revenue', v: formatCurrency(monthlyRevenue), i: <DollarSign className="h-5 w-5" />, s: 'Collected this month' },
        { t: 'Active Subscriptions', v: activeSubs, i: <Activity className="h-5 w-5" />, s: 'Currently active' },
        { t: 'Expired Subscriptions', v: expiredSubs, i: <AlertCircle className="h-5 w-5" />, s: 'Need follow up' },
    ];

    const Loader = ({ text }: { text: string }) => (
        <div className="flex flex-col items-center justify-center p-8 text-white/40"><p className="font-mono text-[10px] uppercase tracking-widest">Loading {text}...</p></div>
    );

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div><h2 className="text-2xl font-bold tracking-tight">Platform Analytics</h2><p className="text-white/40 text-sm mt-1">High level metrics across the network.</p></div>
            
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((c, idx) => <StatCard key={c.t} title={c.t} value={isLoading ? '...' : c.v} icon={c.i} subtitle={isLoading ? 'Loading...' : c.s} delay={(idx + 1) * 100} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold">Top Gyms by Members</h3><span className="text-[10px] uppercase tracking-widest text-white/40">Top 5</span></div>
                    {isLoading ? <Loader text="gyms" /> : !topGyms.length ? <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No member data yet.</div> : (
                        <div className="space-y-3">{topGyms.map(e => (
                            <div key={e.gymId} className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-4">
                                <div><p className="text-sm font-semibold text-white">{e.name}</p><p className="text-xs text-white/40">Gym ID: {e.gymId.slice(-6)}</p></div>
                                <span className="text-[10px] uppercase tracking-widest text-brand">{e.count} members</span>
                            </div>
                        ))}</div>
                    )}
                </div>

                <div className="bg-slate-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold">Latest Payments</h3><span className="text-[10px] uppercase tracking-widest text-white/40">Last 5</span></div>
                    {isLoading ? <Loader text="payments" /> : !latestPayments.length ? <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No payments yet.</div> : (
                        <div className="space-y-3">{latestPayments.map(p => {
                            const gym = gymsMap.get(getGymId(p.gymId))?.name || 'Unknown Gym';
                            const sub = typeof p.subscription !== 'string' ? p.subscription : null;
                            const m = sub && typeof sub.member !== 'string' ? sub.member : null;
                            return (
                                <div key={p._id} className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-4">
                                    <div><p className="text-sm font-semibold text-white">{m ? `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Member' : 'Member'}</p><p className="text-xs text-white/40">{gym}</p></div>
                                    <div className="text-right"><p className="text-sm text-white">{formatCurrency(p.amount)}</p><p className="text-[10px] text-white/40">{formatDate(p.paidAt)}</p></div>
                                </div>
                            );
                        })}</div>
                    )}
                </div>
            </div>
        </div>
    );
};
