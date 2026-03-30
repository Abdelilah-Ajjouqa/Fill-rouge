import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchActivities } from '../../../store/slices/activitiesSlice';
import type { ScheduleSlot } from '../../../types/models';
import { StatCard } from '../StatCard';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const JS_DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

export const CoachSchedulePage = () => {
    const isCoach = useSelector((state: RootState) => state.auth.user?.role) === 'COACH';
    const dispatch = useDispatch<AppDispatch>();
    const { activities, isLoading, error } = useSelector((state: RootState) => state.activities);

    useEffect(() => { if (isCoach) dispatch(fetchActivities()); }, [dispatch, isCoach]);

    const sessions = useMemo(() => activities.flatMap(activity => (activity.schedule || []).filter(slot => slot.day && slot.startTime && slot.endTime).map((slot, index) => ({ id: `${activity._id}-${slot.day}-${index}`, day: slot.day, startTime: slot.startTime, endTime: slot.endTime, activityName: activity.name, maxCapacity: activity.maxCapacity }))).sort((a, b) => {
        const da = DAY_ORDER.indexOf(a.day), db = DAY_ORDER.indexOf(b.day);
        const ia = da === -1 ? DAY_ORDER.length : da, ib = db === -1 ? DAY_ORDER.length : db;
        return ia !== ib ? ia - ib : a.startTime.localeCompare(b.startTime);
    }), [activities]);

    const unscheduledActivities = useMemo(() => activities.filter(activity => !activity.schedule || activity.schedule.length === 0), [activities]);

    const nextSession = useMemo(() => {
        const now = new Date();
        return activities.flatMap(activity => (activity.schedule || []).map(slot => ({ date: getNextOccurrence(slot, now), startTime: slot.startTime, activityName: activity.name }))).filter((s): s is {date: Date, startTime: string, activityName: string} => !!s.date).reduce<{date: Date, startTime: string, activityName: string} | null>((closest, s) => !closest || s.date < closest.date ? s : closest, null);
    }, [activities]);

    if (!isCoach) return <div className="p-8"><div className="bg-slate-900 border border-white/10 p-6"><h2 className="text-lg font-bold">Schedules</h2><p className="text-white/40 text-sm mt-2">This view is available for coaches only.</p></div></div>;

    const stats = [
        { title: "Total Sessions", value: isLoading ? '...' : sessions.length, icon: <Calendar className="h-5 w-5" />, subtitle: "Across the week" },
        { title: "Activities", value: isLoading ? '...' : activities.length, icon: <Clock className="h-5 w-5" />, subtitle: "Assigned to you" },
        { title: "Unscheduled", value: isLoading ? '...' : unscheduledActivities.length, icon: <AlertTriangle className="h-5 w-5" />, subtitle: "Need schedule" },
        { title: "Next Session", value: isLoading ? '...' : nextSession ? `${formatSessionDate(nextSession.date)} ${nextSession.startTime}` : 'N/A', icon: <Calendar className="h-5 w-5" />, subtitle: nextSession ? nextSession.activityName : 'No upcoming sessions' }
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex justify-between items-center gap-4"><div><h2 className="text-2xl font-bold tracking-tight">My Schedule</h2><p className="text-white/40 text-sm mt-1">Review your upcoming sessions and assigned activities.</p></div></div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} subtitle={stat.subtitle} delay={(i + 1) * 100} />)}
            </div>

            <div className="bg-slate-900 border border-white/10 p-6">
                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold">Scheduled Sessions</h3><span className="text-[10px] uppercase tracking-widest text-white/40">{sessions.length} sessions</span></div>

                {isLoading ? <div className="p-8 text-center text-white/40">Loading schedule...</div> : !sessions.length ? <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No scheduled sessions found.</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest"><tr>{['Day', 'Time', 'Activity', 'Capacity'].map(header => <th key={header} className="p-4">{header}</th>)}</tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {sessions.map(session => (
                                    <tr key={session.id} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4 font-medium">{session.day}</td><td className="p-4 font-mono text-white/60">{session.startTime} - {session.endTime}</td>
                                        <td className="p-4 text-white/80">{session.activityName}</td><td className="p-4 text-white/60">{session.maxCapacity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-slate-900 border border-white/10 p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Unscheduled Activities</h3><span className="text-[10px] uppercase tracking-widest text-white/40">{unscheduledActivities.length} items</span></div>
                {!unscheduledActivities.length ? <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">All assigned activities have schedules.</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {unscheduledActivities.map(activity => (
                            <div key={activity._id} className="bg-slate-950/60 border border-white/5 p-4"><p className="text-sm font-semibold text-white">{activity.name}</p><p className="text-xs text-white/40 mt-1">Capacity: {activity.maxCapacity}</p></div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
