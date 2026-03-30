import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, AlertTriangle, MapPin } from 'lucide-react';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchActivities, fetchActivitiesByGym } from '../../../store/slices/activitiesSlice';
import { fetchGyms } from '../../../store/slices/gymsSlice';
import type { Activity, Gym, Hall, GymRef } from '../../../types/models';
import { StatCard } from '../StatCard';

type ScheduleEntry = {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    activityName: string;
    coachName: string;
    gymName: string;
    hallLabel: string;
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getGymId = (gymValue: string | GymRef | undefined) => {
    if (!gymValue) {
        return '';
    }
    return typeof gymValue === 'string' ? gymValue : gymValue._id;
};

const getGymName = (gymValue: string | GymRef | undefined, gymsMap: Map<string, Gym>) => {
    if (!gymValue) {
        return 'Unknown Gym';
    }

    if (typeof gymValue !== 'string' && gymValue.name) {
        return gymValue.name;
    }

    const lookupId = getGymId(gymValue);
    return gymsMap.get(lookupId)?.name || 'Unknown Gym';
};

const getCoachName = (activity: Activity) => {
    if (typeof activity.coach === 'string') {
        return 'Coach assigned';
    }

    const firstName = activity.coach?.firstName || '';
    const lastName = activity.coach?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || activity.coach?.email || 'Coach assigned';
};

export const SuperAdminSchedulePage = () => {
    const userRole = useSelector((state: RootState) => state.auth.user?.role);
    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const dispatch = useDispatch<AppDispatch>();
    const { gyms, isLoading: gymsLoading, error: gymsError } = useSelector(
        (state: RootState) => state.gyms,
    );
    const { activities, isLoading: activitiesLoading, error: activitiesError } = useSelector(
        (state: RootState) => state.activities,
    );
    const [selectedGymId, setSelectedGymId] = useState('');
    const isLoading = gymsLoading || activitiesLoading;
    const error = gymsError || activitiesError;

    useEffect(() => {
        if (!isSuperAdmin) {
            return;
        }

        dispatch(fetchGyms());
    }, [dispatch, isSuperAdmin]);

    useEffect(() => {
        if (!isSuperAdmin) {
            return;
        }

        if (selectedGymId) {
            dispatch(fetchActivitiesByGym(selectedGymId));
        } else {
            dispatch(fetchActivities());
        }
    }, [dispatch, isSuperAdmin, selectedGymId]);

    const gymsMap = useMemo(() => {
        const map = new Map<string, Gym>();
        gyms.forEach((gym) => {
            map.set(gym._id, gym);
        });
        return map;
    }, [gyms]);

    const hallMap = useMemo(() => {
        const map = new Map<string, { label: string; gymName: string }>();
        gyms.forEach((gym) => {
            gym.halls?.forEach((hall: Hall) => {
                if (!hall._id) {
                    return;
                }
                map.set(hall._id, {
                    label: `${hall.name} · ${hall.type}`,
                    gymName: gym.name,
                });
            });
        });
        return map;
    }, [gyms]);

    const sessions = useMemo(() => {
        const entries: ScheduleEntry[] = [];

        activities.forEach((activity) => {
            const schedule = activity.schedule ?? [];
            if (schedule.length === 0) {
                return;
            }

            const gymName = getGymName(activity.gymId, gymsMap);
            const coachName = getCoachName(activity);
            const hallLabel = hallMap.get(activity.hallId)?.label || 'Hall unassigned';

            schedule.forEach((slot, index) => {
                entries.push({
                    id: `${activity._id}-${index}`,
                    day: slot.day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    activityName: activity.name,
                    coachName,
                    gymName,
                    hallLabel,
                });
            });
        });

        return entries.sort((a, b) => {
            const dayIndexA = DAY_ORDER.indexOf(a.day);
            const dayIndexB = DAY_ORDER.indexOf(b.day);
            const safeIndexA = dayIndexA === -1 ? DAY_ORDER.length : dayIndexA;
            const safeIndexB = dayIndexB === -1 ? DAY_ORDER.length : dayIndexB;

            if (safeIndexA !== safeIndexB) {
                return safeIndexA - safeIndexB;
            }

            return a.startTime.localeCompare(b.startTime);
        });
    }, [activities, gymsMap, hallMap]);

    const unscheduledActivities = activities.filter(
        (activity) => !activity.schedule || activity.schedule.length === 0,
    );

    if (!isSuperAdmin) {
        return (
            <div className="p-8">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <h2 className="text-lg font-bold">Schedule</h2>
                    <p className="text-white/40 text-sm mt-2">
                        This view is available for Super Admins only.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Global Schedule</h2>
                    <p className="text-white/40 text-sm mt-1">Monitor activities across all gyms.</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Filter by gym</label>
                    <select
                        value={selectedGymId}
                        onChange={(event) => setSelectedGymId(event.target.value)}
                        className="bg-slate-950 border border-white/10 p-2 text-xs text-white focus:outline-none focus:border-brand"
                    >
                        <option value="">All gyms</option>
                        {gyms.map((gym) => (
                            <option key={gym._id} value={gym._id}>
                                {gym.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Sessions"
                    value={isLoading ? '...' : sessions.length}
                    icon={<Calendar className="h-5 w-5" />}
                    subtitle="Across the week"
                    delay={100}
                />
                <StatCard
                    title="Activities"
                    value={isLoading ? '...' : activities.length}
                    icon={<Clock className="h-5 w-5" />}
                    subtitle="Active classes"
                    delay={200}
                />
                <StatCard
                    title="Unscheduled"
                    value={isLoading ? '...' : unscheduledActivities.length}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    subtitle="Need timetable"
                    delay={300}
                />
                <StatCard
                    title="Gyms"
                    value={isLoading ? '...' : gyms.length}
                    icon={<MapPin className="h-5 w-5" />}
                    subtitle="Facilities tracked"
                    delay={400}
                />
            </div>

            <div className="bg-slate-900 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Scheduled Sessions</h3>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                        {sessions.length} sessions
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-white/40">
                        <div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3"></div>
                        <p className="font-mono text-[10px] uppercase tracking-widest">Loading schedule...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">
                        No scheduled sessions found for this filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="p-4">Day</th>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">Activity</th>
                                    <th className="p-4">Gym</th>
                                    <th className="p-4">Coach</th>
                                    <th className="p-4">Hall</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4 font-medium">{session.day}</td>
                                        <td className="p-4 font-mono text-white/60">
                                            {session.startTime} - {session.endTime}
                                        </td>
                                        <td className="p-4 text-white/80">{session.activityName}</td>
                                        <td className="p-4 text-white/60">{session.gymName}</td>
                                        <td className="p-4 text-white/60">{session.coachName}</td>
                                        <td className="p-4 text-white/60">{session.hallLabel}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-slate-900 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Unscheduled Activities</h3>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                        {unscheduledActivities.length} items
                    </span>
                </div>
                {unscheduledActivities.length === 0 ? (
                    <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">
                        All activities have schedules assigned.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {unscheduledActivities.map((activity) => (
                            <div key={activity._id} className="bg-slate-950/60 border border-white/5 p-4">
                                <p className="text-sm font-semibold text-white">{activity.name}</p>
                                <p className="text-xs text-white/40 mt-1">
                                    Gym: {getGymName(activity.gymId, gymsMap)}
                                </p>
                                <p className="text-xs text-white/40">Coach: {getCoachName(activity)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
