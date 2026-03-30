import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchMySubscriptions } from '../../../store/slices/subscriptionsSlice';
import { StatCard } from '../StatCard';
import { buildMemberScheduleEntries, getNextMemberSession } from './memberScheduleUtils';

const formatSessionDate = (date: Date) => {
    const today = new Date(), tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};

export const MemberSchedulePage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const { subscriptions, isLoading, error } = useSelector((state: RootState) => state.subscriptions);

    useEffect(() => { if (user) dispatch(fetchMySubscriptions()); }, [dispatch, user]);

    const activeSubscriptions = useMemo(() => subscriptions.filter(sub => sub.status === 'active'), [subscriptions]);
    const sessions = useMemo(() => buildMemberScheduleEntries(activeSubscriptions), [activeSubscriptions]);
    const nextSession = useMemo(() => getNextMemberSession(activeSubscriptions), [activeSubscriptions]);

    const stats = [
        { title: "Active Memberships", value: isLoading ? '...' : activeSubscriptions.length, icon: <UserIcon className="h-5 w-5" />, subtitle: "Classes enrolled" },
        { title: "Weekly Sessions", value: isLoading ? '...' : sessions.length, icon: <Calendar className="h-5 w-5" />, subtitle: "Scheduled slots" },
        { title: "Next Session", value: isLoading ? '...' : nextSession ? `${formatSessionDate(nextSession.date)} ${nextSession.startTime}` : 'N/A', icon: <Clock className="h-5 w-5" />, subtitle: isLoading ? 'Fetching sessions' : nextSession ? nextSession.activityName : 'No upcoming sessions' }
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex justify-between items-center gap-4"><div><h2 className="text-2xl font-bold tracking-tight">My Schedule</h2><p className="text-white/40 text-sm mt-1">Keep track of your upcoming sessions and weekly timetable.</p></div></div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, i) => <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} subtitle={stat.subtitle} delay={(i + 1) * 100} />)}
            </div>

            <div className="bg-slate-900 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold">Upcoming Sessions</h3><span className="text-[10px] uppercase tracking-widest text-white/40">{sessions.length} sessions</span></div>

                {isLoading ? <div className="flex flex-col items-center justify-center p-8 text-white/40"><div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3"></div><p className="font-mono text-[10px] uppercase tracking-widest">Loading schedule...</p></div> : !sessions.length ? <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No sessions scheduled yet. Check back after enrolling in activities.</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest"><tr>{['Day', 'Time', 'Activity', 'Coach'].map(header => <th key={header} className="p-4">{header}</th>)}</tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {sessions.map(session => (
                                    <tr key={session.id} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4 font-medium">{session.day}</td><td className="p-4 font-mono text-white/60">{session.startTime} - {session.endTime}</td>
                                        <td className="p-4 text-white/80">{session.activityName}</td><td className="p-4 text-white/60">{session.coachName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
