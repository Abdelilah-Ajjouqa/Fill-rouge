import type { Activity, ScheduleSlot, Subscription } from '../../../types/models';

export type MemberScheduleEntry = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activityName: string;
  coachName: string;
};

export type MemberNextSession = MemberScheduleEntry & {
  date: Date;
};

const DAY_SORT_ORDER = [
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

const getActivityFromSubscription = (subscription: Subscription) => {
  if (!subscription || typeof subscription.activity === 'string') {
    return null;
  }
  return subscription.activity;
};

const getCoachName = (activity: Activity) => {
  if (!activity.coach) {
    return 'Coach assigned';
  }

  if (typeof activity.coach === 'string') {
    return 'Coach assigned';
  }

  const firstName = activity.coach.firstName || '';
  const lastName = activity.coach.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || activity.coach.email || 'Coach assigned';
};

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

  // If the session already passed today, move it to next week.
  if (daysAhead === 0 && candidate <= now) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
};

export const buildMemberScheduleEntries = (subscriptions: Subscription[]) => {
  const entries: MemberScheduleEntry[] = [];

  subscriptions.forEach((subscription) => {
    const activity = getActivityFromSubscription(subscription);
    if (!activity) {
      return;
    }

    const schedule = activity.schedule ?? [];
    schedule.forEach((slot, index) => {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return;
      }

      entries.push({
        id: `${subscription._id}-${slot.day}-${index}`,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        activityName: activity.name,
        coachName: getCoachName(activity),
      });
    });
  });

  return entries.sort((a, b) => {
    const dayIndexA = DAY_SORT_ORDER.indexOf(a.day);
    const dayIndexB = DAY_SORT_ORDER.indexOf(b.day);
    const safeIndexA = dayIndexA === -1 ? DAY_SORT_ORDER.length : dayIndexA;
    const safeIndexB = dayIndexB === -1 ? DAY_SORT_ORDER.length : dayIndexB;

    if (safeIndexA !== safeIndexB) {
      return safeIndexA - safeIndexB;
    }

    return a.startTime.localeCompare(b.startTime);
  });
};

export const getNextMemberSession = (
  subscriptions: Subscription[],
): MemberNextSession | null => {
  const now = new Date();
  let nextSession: MemberNextSession | null = null;

  subscriptions.forEach((subscription) => {
    const activity = getActivityFromSubscription(subscription);
    if (!activity) {
      return;
    }

    const schedule = activity.schedule ?? [];
    schedule.forEach((slot, index) => {
      const nextDate = getNextOccurrence(slot, now);
      if (!nextDate) {
        return;
      }

      if (!nextSession || nextDate < nextSession.date) {
        nextSession = {
          id: `${subscription._id}-${slot.day}-${index}`,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          activityName: activity.name,
          coachName: getCoachName(activity),
          date: nextDate,
        };
      }
    });
  });

  return nextSession;
};
