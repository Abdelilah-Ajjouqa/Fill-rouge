import type { Activity, ScheduleSlot, Subscription } from '../../../types/models';

export type MemberScheduleEntry = { id: string; day: string; startTime: string; endTime: string; activityName: string; coachName: string; };
export type MemberNextSession = MemberScheduleEntry & { date: Date; };

const DAY_SORT_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const JS_DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getActivityFromSubscription = (sub: Subscription) => !sub || typeof sub.activity === 'string' ? null : sub.activity;

const getCoachName = (act: Activity) => {
    if (!act.coach || typeof act.coach === 'string') return 'Coach assigned';
    return `${act.coach.firstName || ''} ${act.coach.lastName || ''}`.trim() || act.coach.email || 'Coach assigned';
};

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

export const buildMemberScheduleEntries = (subscriptions: Subscription[]) => {
    return subscriptions.flatMap(sub => {
        const act = getActivityFromSubscription(sub);
        return act ? (act.schedule || []).filter(s => s.day && s.startTime && s.endTime).map((s, i) => ({ id: `${sub._id}-${s.day}-${i}`, day: s.day, startTime: s.startTime, endTime: s.endTime, activityName: act.name, coachName: getCoachName(act) })) : [];
    }).sort((a, b) => {
        const ia = DAY_SORT_ORDER.indexOf(a.day) === -1 ? 7 : DAY_SORT_ORDER.indexOf(a.day);
        const ib = DAY_SORT_ORDER.indexOf(b.day) === -1 ? 7 : DAY_SORT_ORDER.indexOf(b.day);
        return ia !== ib ? ia - ib : a.startTime.localeCompare(b.startTime);
    });
};

export const getNextMemberSession = (subscriptions: Subscription[]): MemberNextSession | null => {
    const now = new Date();
    return subscriptions.flatMap(sub => {
        const act = getActivityFromSubscription(sub);
        return act ? (act.schedule || []).map((s, i) => ({ id: `${sub._id}-${s.day}-${i}`, day: s.day, startTime: s.startTime, endTime: s.endTime, activityName: act.name, coachName: getCoachName(act), date: getNextOccurrence(s, now) })) : [];
    }).filter((s): s is MemberNextSession => !!s.date).reduce<MemberNextSession | null>((closest, s) => !closest || s.date < closest.date ? s : closest, null);
};
