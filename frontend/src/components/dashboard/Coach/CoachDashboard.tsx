import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Clock, AlertTriangle } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchActivities } from '../../../store/slices/activitiesSlice';
import { fetchMembers } from '../../../store/slices/membersSlice';
import { fetchPayments } from '../../../store/slices/paymentsSlice';
import { fetchSubscriptions } from '../../../store/slices/subscriptionsSlice';
import type { ScheduleSlot } from '../../../types/models';
import { StatCard } from '../StatCard';

const JS_DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const formatMoney = (value: number) => `${value.toLocaleString()} DH`;

const getNextOccurrence = (slot: ScheduleSlot, now: Date) => {
    const dayIndex = JS_DAY_ORDER.indexOf(slot.day);
    if (dayIndex === -1) return null;
    const [h, m] = slot.startTime.split(':').map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    const candidate = new Date(now);
    const d = (dayIndex - now.getDay() + 7) % 7;
    candidate.setDate(now.getDate() + d);
    candidate.setHours(h, m, 0, 0);
    if (d === 0 && candidate <= now) candidate.setDate(candidate.getDate() + 7);
    return candidate;
};

const formatSessionDate = (date: Date) => {
    const today = new Date(), tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};

export const CoachDashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isCoach = useSelector((state: RootState) => state.auth.user?.role) === 'COACH';
    
    const { activities, isLoading: activitiesLoading, error: activitiesError } = useSelector((state: RootState) => state.activities);
    const { members, isLoading: membersLoading, error: membersError } = useSelector((state: RootState) => state.members);
    const { subscriptions, isLoading: subscriptionsLoading, error: subscriptionsError } = useSelector((state: RootState) => state.subscriptions);
    const { payments, isLoading: paymentsLoading, error: paymentsError } = useSelector((state: RootState) => state.payments);

    useEffect(() => {
        if (!isCoach) return;
        dispatch(fetchActivities()); dispatch(fetchMembers()); dispatch(fetchSubscriptions()); dispatch(fetchPayments());
    }, [dispatch, isCoach]);

    const isLoading = activitiesLoading || membersLoading || subscriptionsLoading || paymentsLoading;
    const error = activitiesError || membersError || subscriptionsError || paymentsError;

    const coachActivityIds = useMemo(() => new Set(activities.map(a => a._id)), [activities]);
    
    const coachActiveSubscriptions = useMemo(() => subscriptions.filter(s => s.status === 'active' && coachActivityIds.has(typeof s.activity === 'string' ? s.activity : s.activity?._id || '')), [subscriptions, coachActivityIds]);
    
    const enrollmentByActivity = useMemo(() => coachActiveSubscriptions.reduce((acc, sub) => {
        const id = typeof sub.activity === 'string' ? sub.activity : sub.activity?._id || '';
        if (id) acc.set(id, (acc.get(id) || 0) + 1);
        return acc;
    }, new Map<string, number>()), [coachActiveSubscriptions]);

    const allSessions = useMemo(() => activities.flatMap(a => (a.schedule || []).filter(s => s.day && s.startTime && s.endTime).map((s, i) => ({ id: `${a._id}-${s.day}-${i}`, name: a.name, day: s.day, startTime: s.startTime, endTime: s.endTime, enrolled: enrollmentByActivity.get(a._id) || 0, capacity: a.maxCapacity }))), [activities, enrollmentByActivity]);

    const todayDayName = JS_DAY_ORDER[new Date().getDay()];
    const todaysSessions = useMemo(() => allSessions.filter(s => s.day === todayDayName).sort((a, b) => a.startTime.localeCompare(b.startTime)), [allSessions, todayDayName]);

    const nextSession = useMemo(() => {
        const now = new Date();
        return activities.flatMap(a => (a.schedule || []).map(s => ({ date: getNextOccurrence(s, now), startTime: s.startTime, activityName: a.name }))).filter((s): s is {date: Date, startTime: string, activityName: string} => !!s.date).reduce<{date: Date, startTime: string, activityName: string} | null>((closest, s) => !closest || s.date < closest.date ? s : closest, null);
    }, [activities]);

    const paidSubscriptionIds = useMemo(() => new Set(payments.map(p => typeof p.subscription === 'string' ? p.subscription : p.subscription?._id || '').filter(Boolean)), [payments]);
    const unpaidSubscriptions = useMemo(() => coachActiveSubscriptions.filter(s => !paidSubscriptionIds.has(s._id)), [coachActiveSubscriptions, paidSubscriptionIds]);

    const unpaidMembers = useMemo(() => Array.from(unpaidSubscriptions.reduce((acc, sub) => {
        const m = sub.member;
        const id = (typeof m === 'string' ? m : m?._id) || `unknown-${sub._id}`;
        const name = typeof m === 'string' ? 'Member' : `${m?.firstName || ''} ${m?.lastName || ''}`.trim() || m?.email || 'Member';
        const amount = typeof sub.activity === 'string' ? 0 : sub.activity?.monthlyPrice || 0;
        const existing = acc.get(id);
        if (existing) existing.amount += amount;
        else acc.set(id, { id, name, amount });
        return acc;
    }, new Map<string, {id: string, name: string, amount: number}>()).values()).sort((a, b) => b.amount - a.amount), [unpaidSubscriptions]);

    const totalUnpaidAmount = useMemo(() => unpaidSubscriptions.reduce((sum, sub) => sum + (typeof sub.activity === 'string' ? 0 : sub.activity?.monthlyPrice || 0), 0), [unpaidSubscriptions]);

    if (!isCoach) return <div className="p-8"><div className="bg-slate-900 border border-white/10 p-6"><h2 className="text-lg font-bold">Coach Dashboard</h2><p className="text-white/40 text-sm mt-2">This view is available for coaches only.</p></div></div>;

    const stats = [
        { title: "My Members", value: isLoading ? '...' : members.length, icon: <Users className="h-5 w-5" />, subtitle: isLoading ? 'Loading...' : `Across ${activities.length} activities` },
        { title: "Next Class", value: isLoading ? '...' : nextSession ? `${formatSessionDate(nextSession.date)} ${nextSession.startTime}` : 'N/A', icon: <Clock className="h-5 w-5" />, subtitle: isLoading ? 'Loading...' : nextSession ? nextSession.activityName : 'No upcoming session' },
        { title: "Unpaid Dues", value: isLoading ? '...' : formatMoney(totalUnpaidAmount), icon: <AlertTriangle className="h-5 w-5" />, subtitle: isLoading ? 'Calculating...' : `${unpaidMembers.length} member${unpaidMembers.length === 1 ? '' : 's'} pending` }
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold tracking-tight">Coach Dashboard</h2><p className="text-white/40 text-sm mt-1">Manage your activities and members</p></div></div>
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((s, i) => <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} subtitle={s.subtitle} delay={(i + 1) * 100} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-white/10 p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <h3 className="text-lg font-bold mb-6 tracking-tight">Today's Schedule</h3>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-8 text-white/40"><div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3"></div><p className="font-mono text-[10px] uppercase tracking-widest">Loading schedule...</p></div>
                    ) : !todaysSessions.length ? (
                        <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No classes scheduled for today.</div>
                    ) : (
                        <div className="space-y-4">
                            {todaysSessions.map(session => (
                                <div key={session.id} className="p-4 border border-white/10 bg-white/1 hover:bg-white/3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div><p className="font-bold text-white/90">{session.name}</p><p className="text-xs text-white/40 font-mono mt-1">{session.startTime} - {session.endTime}</p></div>
                                    <div className="space-y-2 min-w-[120px]">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter"><span className="text-white/60">Enrolled</span><span className={session.capacity > 0 && session.enrolled >= session.capacity ? 'text-red-400' : 'text-brand'}>{session.enrolled} / {session.capacity}</span></div>
                                        <div className="w-full bg-white/5 h-1 border border-white/5"><div className={`h-full transition-all duration-1000 ease-out ${session.capacity > 0 && session.enrolled >= session.capacity ? 'bg-red-500' : 'bg-brand'}`} style={{ width: `${session.capacity > 0 ? Math.min((session.enrolled / session.capacity) * 100, 100) : 0}%` }}></div></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 border border-white/10 p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
                    <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold tracking-tight">Unpaid Dues</h3><span className="text-brand text-[10px] font-bold uppercase tracking-widest">{unpaidMembers.length} Pending</span></div>
                    {isLoading ? (
                        <div className="text-white/40 text-sm">Loading unpaid members...</div>
                    ) : !unpaidMembers.length ? (
                        <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">All assigned subscriptions are paid.</div>
                    ) : (
                        <div className="space-y-3">
                            {unpaidMembers.slice(0, 6).map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/2"><span className="text-sm font-medium">{member.name}</span><span className="text-xs font-bold text-red-400">{formatMoney(member.amount)}</span></div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
