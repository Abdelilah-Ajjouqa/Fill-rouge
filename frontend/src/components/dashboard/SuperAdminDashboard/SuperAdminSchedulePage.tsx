import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, AlertTriangle, MapPin } from 'lucide-react';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchActivities } from '../../../store/slices/activitiesSlice';
import { fetchGyms } from '../../../store/slices/gymsSlice';
import type { Activity, Gym, Hall } from '../../../types/models';
import { StatCard } from '../StatCard';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const extractGymId = (gymData: any): string => {
    if (typeof gymData === 'string') {
        return gymData;
    }
    if (gymData && gymData._id) {
        return gymData._id;
    }
    return '';
};

const extractGymName = (gymData: any, gymsLookupMap: Map<string, Gym>): string => {
    if (typeof gymData !== 'string' && gymData && gymData.name) {
        return gymData.name;
    }
    const gymId = extractGymId(gymData);
    const foundGym = gymsLookupMap.get(gymId);
    if (foundGym && foundGym.name) {
        return foundGym.name;
    }
    return 'Unknown Gym';
};

const extractCoachName = (activity: Activity): string => {
    const coach = activity.coach;
    if (typeof coach === 'string') {
        return 'Coach assigned';
    }
    if (coach && (coach.firstName || coach.lastName)) {
        return `${coach.firstName || ''} ${coach.lastName || ''}`.trim();
    }
    if (coach && coach.email) {
        return coach.email;
    }
    return 'Coach assigned';
};

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

    const visibleActivities = useMemo(() => selectedGymId ? activities.filter(activity => extractGymId(activity.gymId) === selectedGymId) : activities, [activities, selectedGymId]);
    const gymsMap = useMemo(() => new Map(gyms.map(gym => [gym._id, gym])), [gyms]);
    const hallMap = useMemo(() => new Map(gyms.flatMap(gym => (gym.halls || []).filter((hall: Hall) => hall._id).map((hall: Hall) => [hall._id, { label: `${hall.name} · ${hall.type}`, gymName: gym.name }]))), [gyms]);

    const sessions = useMemo(() => visibleActivities.flatMap((activity) => {
        if (!activity.schedule?.length) return [];
        const gymName = extractGymName(activity.gymId, gymsMap), coachName = extractCoachName(activity), hallLabel = hallMap.get(activity.hallId as string)?.label || 'Hall unassigned';
        return activity.schedule.map((schedule, index) => ({ id: `${activity._id}-${index}`, day: schedule.day, startTime: schedule.startTime, endTime: schedule.endTime, activityName: activity.name, coachName, gymName, hallLabel }));
    }).sort((activityA, activityB) => {
        const dayA = DAY_ORDER.indexOf(activityA.day), dayB = DAY_ORDER.indexOf(activityB.day);
        const dayWeightA = dayA === -1 ? 7 : dayA, dayWeightB = dayB === -1 ? 7 : dayB;
        return dayWeightA !== dayWeightB ? dayWeightA - dayWeightB : activityA.startTime.localeCompare(activityB.startTime);
    }), [visibleActivities, gymsMap, hallMap]);

    const unscheduledActivities = visibleActivities.filter(activity => !activity.schedule?.length);

    if (!isSuperAdmin) return <div className="p-8"><div className="bg-slate-900 border border-white/10 p-6"><h2 className="text-lg font-bold">Schedule</h2><p className="text-white/40 text-sm mt-2">Super Admins only.</p></div></div>;

    const cards = [
        { title: 'Total Sessions', value: sessions.length, icon: <Calendar className="h-5 w-5" />, subtitle: 'Across the week' },
        { title: 'Activities', value: visibleActivities.length, icon: <Clock className="h-5 w-5" />, subtitle: 'Active classes' },
        { title: 'Unscheduled', value: unscheduledActivities.length, icon: <AlertTriangle className="h-5 w-5" />, subtitle: 'Need timetable' },
        { title: 'Gyms', value: gyms.length, icon: <MapPin className="h-5 w-5" />, subtitle: 'Facilities tracked' }
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div><h2 className="text-2xl font-bold tracking-tight">Global Schedule</h2><p className="text-white/40 text-sm mt-1">Monitor activities across all gyms.</p></div>
                <div className="flex items-center gap-3">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Filter by gym</label>
                    <select value={selectedGymId} onChange={event => setSelectedGymId(event.target.value)} className="bg-slate-950 border border-white/10 p-2 text-xs text-white focus:outline-none focus:border-brand">
                        <option value="">All gyms</option>{gyms.map(gym => <option key={gym._id} value={gym._id}>{gym.name}</option>)}
                    </select>
                </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => <StatCard key={card.title} title={card.title} value={isLoading ? '...' : card.value} icon={card.icon} subtitle={card.subtitle} delay={(index + 1) * 100} />)}
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
                                <tr>{['Day', 'Time', 'Activity', 'Gym', 'Coach', 'Hall'].map(header => <th key={header} className="p-4">{header}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sessions.map(session => (
                                    <tr key={session.id} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4 font-medium">{session.day}</td><td className="p-4 font-mono text-white/60">{session.startTime} - {session.endTime}</td>
                                        <td className="p-4 text-white/80">{session.activityName}</td><td className="p-4 text-white/60">{session.gymName}</td>
                                        <td className="p-4 text-white/60">{session.coachName}</td><td className="p-4 text-white/60">{session.hallLabel}</td>
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
                        {unscheduledActivities.map(activity => (
                            <div key={activity._id} className="bg-slate-950/60 border border-white/5 p-4">
                                <p className="text-sm font-semibold text-white">{activity.name}</p>
                                <p className="text-xs text-white/40 mt-1">Gym: {extractGymName(activity.gymId, gymsMap)}</p>
                                <p className="text-xs text-white/40">Coach: {extractCoachName(activity)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
