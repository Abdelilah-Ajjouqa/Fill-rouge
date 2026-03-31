import type { Activity, ScheduleSlot, Subscription } from '../../../types/models';

export type MemberScheduleEntry = { id: string; day: string; startTime: string; endTime: string; activityName: string; coachName: string; };
export type MemberNextSession = MemberScheduleEntry & { date: Date; };

const JS_DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getActivityFromSubscription = (subscription: Subscription) => !subscription || typeof subscription.activity === 'string' ? null : subscription.activity;

const getCoachName = (activity: Activity) => {
    if (!activity.coach || typeof activity.coach === 'string') return 'Coach assigned';
    return `${activity.coach.firstName || ''} ${activity.coach.lastName || ''}`.trim() || activity.coach.email || 'Coach assigned';
};

const getNextOccurrence = (slot: ScheduleSlot, now: Date) => {
    const dayIndex = JS_DAY_ORDER.indexOf(slot.day);
    if (dayIndex === -1) return null;
    const [hours, minutes] = slot.startTime.split(':').map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    const candidate = new Date(now);
    const daysUntilNext = (dayIndex - now.getDay() + 7) % 7;
    candidate.setDate(now.getDate() + daysUntilNext);
    candidate.setHours(hours, minutes, 0, 0);
    if (daysUntilNext === 0 && candidate <= now) candidate.setDate(candidate.getDate() + 7);
    return candidate;
};

export const buildMemberScheduleEntries = (subscriptions: Subscription[]) => {
    return subscriptions.flatMap(subscription => {
        const activity = getActivityFromSubscription(subscription);
        return activity ? (activity.schedule || []).filter(scheduleSlot => scheduleSlot.day && scheduleSlot.startTime && scheduleSlot.endTime).map((scheduleSlot, index) => ({ id: `${subscription._id}-${scheduleSlot.day}-${index}`, day: scheduleSlot.day, startTime: scheduleSlot.startTime, endTime: scheduleSlot.endTime, activityName: activity.name, coachName: getCoachName(activity) })) : [];
    }).sort((entryA, entryB) => {
        const indexA = JS_DAY_ORDER.indexOf(entryA.day) === -1 ? 7 : JS_DAY_ORDER.indexOf(entryA.day);
        const indexB = JS_DAY_ORDER.indexOf(entryB.day) === -1 ? 7 : JS_DAY_ORDER.indexOf(entryB.day);
        return indexA !== indexB ? indexA - indexB : entryA.startTime.localeCompare(entryB.startTime);
    });
};

export const getNextMemberSession = (subscriptions: Subscription[]): MemberNextSession | null => {
    const now = new Date();
    return subscriptions.flatMap(subscription => {
        const activity = getActivityFromSubscription(subscription);
        return activity ? (activity.schedule || []).map((scheduleSlot, index) => ({ id: `${subscription._id}-${scheduleSlot.day}-${index}`, day: scheduleSlot.day, startTime: scheduleSlot.startTime, endTime: scheduleSlot.endTime, activityName: activity.name, coachName: getCoachName(activity), date: getNextOccurrence(scheduleSlot, now) })) : [];
    }).filter((session): session is MemberNextSession => !!session.date).reduce<MemberNextSession | null>((closest, session) => !closest || session.date < closest.date ? session : closest, null);
};
