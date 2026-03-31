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

const getGymId = (gymData: any) => typeof gymData === 'string' ? gymData : (gymData?._id || '');
const formatCurrency = (value: number) => `${value.toLocaleString()} DH`;
const formatDate = (dateString?: string) => dateString && !Number.isNaN(new Date(dateString).getTime()) ? new Date(dateString).toLocaleDateString() : '--';

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

    const gymsMap = useMemo(() => new Map(gyms.map(gym => [gym._id, gym])), [gyms]);
    
    const activeGyms = gyms.filter(gym => gym.isActive).length;
    const adminCount = users.filter(user => user.role === 'ADMIN').length;
    const coachCount = users.filter(user => user.role === 'COACH').length;
    
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyRevenue = payments.reduce((sum, payment) => payment.paidAt && new Date(payment.paidAt) >= monthStart ? sum + payment.amount : sum, 0);
    
    const activeSubs = subscriptions.filter(subscription => subscription.status === 'active').length;
    const expiredSubs = subscriptions.filter(subscription => subscription.status === 'expired').length;

    const topGyms = useMemo(() => {
        const counts = new Map<string, number>();
        members.forEach(member => { const id = typeof member.gymId === 'string' ? member.gymId : ''; if (id) counts.set(id, (counts.get(id) || 0) + 1); });
        return Array.from(counts.entries()).map(([gymId, count]) => ({ gymId, count, name: gymsMap.get(gymId)?.name || 'Unknown Gym' })).sort((gymA, gymB) => gymB.count - gymA.count).slice(0, 5);
    }, [members, gymsMap]);

    const latestPayments = useMemo(() => [...payments].sort((paymentA, paymentB) => (paymentB.paidAt ? new Date(paymentB.paidAt).getTime() : 0) - (paymentA.paidAt ? new Date(paymentA.paidAt).getTime() : 0)).slice(0, 5), [payments]);

    if (!isSuperAdmin) return <div className="p-8"><div className="bg-slate-900 border border-white/10 p-6"><h2 className="text-lg font-bold">Analytics</h2><p className="text-white/40 text-sm mt-2">Super Admins only.</p></div></div>;

    const cards = [
        { title: 'Active Gyms', value: activeGyms, icon: <Building2 className="h-5 w-5" />, subtitle: `${gyms.length} total gyms` },
        { title: 'Total Members', value: members.length, icon: <Users className="h-5 w-5" />, subtitle: 'Across all gyms' },
        { title: 'Total Staff', value: adminCount + coachCount, icon: <UserCog className="h-5 w-5" />, subtitle: `${adminCount} admins · ${coachCount} coaches` },
        { title: 'Monthly Revenue', value: formatCurrency(monthlyRevenue), icon: <DollarSign className="h-5 w-5" />, subtitle: 'Collected this month' },
        { title: 'Active Subscriptions', value: activeSubs, icon: <Activity className="h-5 w-5" />, subtitle: 'Currently active' },
        { title: 'Expired Subscriptions', value: expiredSubs, icon: <AlertCircle className="h-5 w-5" />, subtitle: 'Need follow up' },
    ];

    const Loader = ({ text }: { text: string }) => (
        <div className="flex flex-col items-center justify-center p-8 text-white/40"><p className="font-mono text-[10px] uppercase tracking-widest">Loading {text}...</p></div>
    );

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div><h2 className="text-2xl font-bold tracking-tight">Platform Analytics</h2><p className="text-white/40 text-sm mt-1">High level metrics across the network.</p></div>
            
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, index) => <StatCard key={card.title} title={card.title} value={isLoading ? '...' : card.value} icon={card.icon} subtitle={isLoading ? 'Loading...' : card.subtitle} delay={(index + 1) * 100} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold">Top Gyms by Members</h3><span className="text-[10px] uppercase tracking-widest text-white/40">Top 5</span></div>
                    {isLoading ? <Loader text="gyms" /> : !topGyms.length ? <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No member data yet.</div> : (
                        <div className="space-y-3">{topGyms.map(gymEntry => (
                            <div key={gymEntry.gymId} className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-4">
                                <div><p className="text-sm font-semibold text-white">{gymEntry.name}</p><p className="text-xs text-white/40">Gym ID: {gymEntry.gymId.slice(-6)}</p></div>
                                <span className="text-[10px] uppercase tracking-widest text-brand">{gymEntry.count} members</span>
                            </div>
                        ))}</div>
                    )}
                </div>

                <div className="bg-slate-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold">Latest Payments</h3><span className="text-[10px] uppercase tracking-widest text-white/40">Last 5</span></div>
                    {isLoading ? <Loader text="payments" /> : !latestPayments.length ? <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No payments yet.</div> : (
                        <div className="space-y-3">{latestPayments.map(payment => {
                            const gym = gymsMap.get(getGymId(payment.gymId))?.name || 'Unknown Gym';
                            const subscription = typeof payment.subscription !== 'string' ? payment.subscription : null;
                            const member = subscription && typeof subscription.member !== 'string' ? subscription.member : null;
                            return (
                                <div key={payment._id} className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-4">
                                    <div><p className="text-sm font-semibold text-white">{member ? `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Member' : 'Member'}</p><p className="text-xs text-white/40">{gym}</p></div>
                                    <div className="text-right"><p className="text-sm text-white">{formatCurrency(payment.amount)}</p><p className="text-[10px] text-white/40">{formatDate(payment.paidAt)}</p></div>
                                </div>
                            );
                        })}</div>
                    )}
                </div>
            </div>
        </div>
    );
};
