import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, AlertTriangle, MapPin } from 'lucide-react';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchActivities } from '../../../store/slices/activitiesSlice';
import { fetchGyms } from '../../../store/slices/gymsSlice';
import type { Activity, Gym, Hall } from '../../../types/models';
import { StatCard } from '../StatCard';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getGymId = (g: any) => typeof g === 'string' ? g : (g?._id || '');
const getGymName = (g: any, map: Map<string, Gym>) => typeof g !== 'string' && g?.name ? g.name : (map.get(getGymId(g))?.name || 'Unknown Gym');
const getCoachName = (a: Activity) => typeof a.coach === 'string' ? 'Coach assigned' : (`${a.coach?.firstName || ''} ${a.coach?.lastName || ''}`.trim() || a.coach?.email || 'Coach assigned');

export const SuperAdminSchedulePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isSuperAdmin = useSelector((state: RootState) => state.auth.user?.role) === 'SUPER_ADMIN';
    const { gyms, isLoading: gymsLoading, error: gymsError } = useSelector((state: RootState) => state.gyms);
    const { activities, isLoading: activitiesLoading, error: activitiesError } = useSelector((state: RootState) => state.activities);
    
    const [selectedGymId, setSelectedGymId] = useState('');
    const isLoading = gymsLoading || activitiesLoading;
    const error = gymsError || activitiesError;

    useEffect(() => {
        if (!isSuperAdmin) return;
        dispatch(fetchGyms());
        dispatch(fetchActivities());
    }, [dispatch, isSuperAdmin]);

    const visibleActivities = useMemo(() => selectedGymId ? activities.filter(a => getGymId(a.gymId) === selectedGymId) : activities, [activities, selectedGymId]);
    const gymsMap = useMemo(() => new Map(gyms.map(g => [g._id, g])), [gyms]);
    const hallMap = useMemo(() => new Map(gyms.flatMap(g => (g.halls || []).filter((h: Hall) => h._id).map((h: Hall) => [h._id, { label: `${h.name} · ${h.type}`, gymName: g.name }]))), [gyms]);

    const sessions = useMemo(() => visibleActivities.flatMap((a) => {
        if (!a.schedule?.length) return [];
        const gymName = getGymName(a.gymId, gymsMap), coachName = getCoachName(a), hallLabel = hallMap.get(a.hallId as string)?.label || 'Hall unassigned';
        return a.schedule.map((s, i) => ({ id: `${a._id}-${i}`, day: s.day, startTime: s.startTime, endTime: s.endTime, activityName: a.name, coachName, gymName, hallLabel }));
    }).sort((a, b) => {
        const da = DAY_ORDER.indexOf(a.day), db = DAY_ORDER.indexOf(b.day);
        const sa = da === -1 ? 7 : da, sb = db === -1 ? 7 : db;
        return sa !== sb ? sa - sb : a.startTime.localeCompare(b.startTime);
    }), [visibleActivities, gymsMap, hallMap]);

    const unscheduledActivities = visibleActivities.filter(a => !a.schedule?.length);

    if (!isSuperAdmin) return <div className="p-8"><div className="bg-slate-900 border border-white/10 p-6"><h2 className="text-lg font-bold">Schedule</h2><p className="text-white/40 text-sm mt-2">Super Admins only.</p></div></div>;

    const cards = [
        { t: 'Total Sessions', v: sessions.length, i: <Calendar className="h-5 w-5" />, s: 'Across the week' },
        { t: 'Activities', v: visibleActivities.length, i: <Clock className="h-5 w-5" />, s: 'Active classes' },
        { t: 'Unscheduled', v: unscheduledActivities.length, i: <AlertTriangle className="h-5 w-5" />, s: 'Need timetable' },
        { t: 'Gyms', v: gyms.length, i: <MapPin className="h-5 w-5" />, s: 'Facilities tracked' }
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div><h2 className="text-2xl font-bold tracking-tight">Global Schedule</h2><p className="text-white/40 text-sm mt-1">Monitor activities across all gyms.</p></div>
                <div className="flex items-center gap-3">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Filter by gym</label>
                    <select value={selectedGymId} onChange={e => setSelectedGymId(e.target.value)} className="bg-slate-950 border border-white/10 p-2 text-xs text-white focus:outline-none focus:border-brand">
                        <option value="">All gyms</option>{gyms.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                    </select>
                </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c, idx) => <StatCard key={c.t} title={c.t} value={isLoading ? '...' : c.v} icon={c.i} subtitle={c.s} delay={(idx + 1) * 100} />)}
            </div>

            <div className="bg-slate-900 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold">Scheduled Sessions</h3><span className="text-[10px] uppercase tracking-widest text-white/40">{sessions.length} sessions</span></div>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-white/40"><div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3" /><p className="font-mono text-[10px] uppercase tracking-widest">Loading schedule...</p></div>
                ) : sessions.length === 0 ? (
                    <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No scheduled sessions found for this filter.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                <tr>{['Day', 'Time', 'Activity', 'Gym', 'Coach', 'Hall'].map(h => <th key={h} className="p-4">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sessions.map(s => (
                                    <tr key={s.id} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4 font-medium">{s.day}</td><td className="p-4 font-mono text-white/60">{s.startTime} - {s.endTime}</td>
                                        <td className="p-4 text-white/80">{s.activityName}</td><td className="p-4 text-white/60">{s.gymName}</td>
                                        <td className="p-4 text-white/60">{s.coachName}</td><td className="p-4 text-white/60">{s.hallLabel}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-slate-900 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Unscheduled Activities</h3><span className="text-[10px] uppercase tracking-widest text-white/40">{unscheduledActivities.length} items</span></div>
                {unscheduledActivities.length === 0 ? <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">All activities have schedules assigned.</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {unscheduledActivities.map(a => (
                            <div key={a._id} className="bg-slate-950/60 border border-white/5 p-4">
                                <p className="text-sm font-semibold text-white">{a.name}</p>
                                <p className="text-xs text-white/40 mt-1">Gym: {getGymName(a.gymId, gymsMap)}</p>
                                <p className="text-xs text-white/40">Coach: {getCoachName(a)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
