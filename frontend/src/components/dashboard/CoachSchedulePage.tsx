import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchActivities } from '../../store/slices/activitiesSlice';
import type { ScheduleSlot } from '../../types/models';
import { StatCard } from './StatCard';

type ScheduleEntry = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activityName: string;
  maxCapacity: number;
};

type NextSession = {
  date: Date;
  startTime: string;
  activityName: string;
};

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const JS_DAY_ORDER = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const parseTime = (time: string) => {
  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return { hour, minute };
};

const getNextOccurrence = (slot: ScheduleSlot, now: Date) => {
  const dayIndex = JS_DAY_ORDER.indexOf(slot.day);
  if (dayIndex === -1) {
    return null;
  }

  const parsedTime = parseTime(slot.startTime);
  if (!parsedTime) {
    return null;
  }

  const candidate = new Date(now);
  const daysAhead = (dayIndex - now.getDay() + 7) % 7;

  candidate.setDate(now.getDate() + daysAhead);
  candidate.setHours(parsedTime.hour, parsedTime.minute, 0, 0);

  if (daysAhead === 0 && candidate <= now) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
};

const formatSessionDate = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

export const CoachSchedulePage = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isCoach = userRole === 'COACH';
  const dispatch = useDispatch<AppDispatch>();
  const { activities, isLoading, error } = useSelector(
    (state: RootState) => state.activities,
  );

  useEffect(() => {
    if (!isCoach) {
      return;
    }

    dispatch(fetchActivities());
  }, [dispatch, isCoach]);

  const sessions = useMemo(() => {
    const entries: ScheduleEntry[] = [];

    activities.forEach((activity) => {
      const schedule = activity.schedule ?? [];
      if (schedule.length === 0) {
        return;
      }

      schedule.forEach((slot, index) => {
        if (!slot.day || !slot.startTime || !slot.endTime) {
          return;
        }

        entries.push({
          id: `${activity._id}-${slot.day}-${index}`,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          activityName: activity.name,
          maxCapacity: activity.maxCapacity,
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
  }, [activities]);

  const unscheduledActivities = useMemo(
    () => activities.filter((activity) => !activity.schedule || activity.schedule.length === 0),
    [activities],
  );

  const nextSession = useMemo<NextSession | null>(() => {
    const now = new Date();
    let next: NextSession | null = null;

    activities.forEach((activity) => {
      const schedule = activity.schedule ?? [];
      schedule.forEach((slot) => {
        const nextDate = getNextOccurrence(slot, now);
        if (!nextDate) {
          return;
        }

        if (!next || nextDate < next.date) {
          next = {
            date: nextDate,
            startTime: slot.startTime,
            activityName: activity.name,
          };
        }
      });
    });

    return next;
  }, [activities]);

  if (!isCoach) {
    return (
      <div className="p-8">
        <div className="bg-slate-900 border border-white/10 p-6">
          <h2 className="text-lg font-bold">Schedules</h2>
          <p className="text-white/40 text-sm mt-2">
            This view is available for coaches only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Schedule</h2>
          <p className="text-white/40 text-sm mt-1">
            Review your upcoming sessions and assigned activities.
          </p>
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
          subtitle="Assigned to you"
          delay={200}
        />
        <StatCard
          title="Unscheduled"
          value={isLoading ? '...' : unscheduledActivities.length}
          icon={<AlertTriangle className="h-5 w-5" />}
          subtitle="Need schedule"
          delay={300}
        />
        <StatCard
          title="Next Session"
          value={
            isLoading
              ? '...'
              : nextSession
                ? `${formatSessionDate(nextSession.date)} ${nextSession.startTime}`
                : 'N/A'
          }
          icon={<Calendar className="h-5 w-5" />}
          subtitle={nextSession ? nextSession.activityName : 'No upcoming sessions'}
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
            No scheduled sessions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-4">Day</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Activity</th>
                  <th className="p-4">Capacity</th>
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
                    <td className="p-4 text-white/60">{session.maxCapacity}</td>
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
            All assigned activities have schedules.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unscheduledActivities.map((activity) => (
              <div key={activity._id} className="bg-slate-950/60 border border-white/5 p-4">
                <p className="text-sm font-semibold text-white">{activity.name}</p>
                <p className="text-xs text-white/40 mt-1">
                  Capacity: {activity.maxCapacity}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
