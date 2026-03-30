import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Clock, AlertTriangle } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchActivities } from '../../../store/slices/activitiesSlice';
import { fetchMembers } from '../../../store/slices/membersSlice';
import { fetchPayments } from '../../../store/slices/paymentsSlice';
import { fetchSubscriptions } from '../../../store/slices/subscriptionsSlice';
import type { Payment, ScheduleSlot, Subscription } from '../../../types/models';
import { StatCard } from '../StatCard';

type CoachSession = {
    id: string;
    name: string;
    day: string;
    startTime: string;
    endTime: string;
    enrolled: number;
    capacity: number;
};

type NextSession = {
    date: Date;
    startTime: string;
    activityName: string;
};

type UnpaidMemberEntry = {
    id: string;
    name: string;
    amount: number;
};

const JS_DAY_ORDER = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const formatMoney = (value: number) => `${value.toLocaleString()} DH`;

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

const getSubscriptionActivityId = (subscription: Subscription) => {
    if (typeof subscription.activity === 'string') {
        return subscription.activity;
    }

    return subscription.activity?._id || '';
};

const getSubscriptionMemberId = (subscription: Subscription) => {
    if (typeof subscription.member === 'string') {
        return subscription.member;
    }

    return subscription.member?._id || '';
};

const getSubscriptionMemberName = (subscription: Subscription) => {
    if (typeof subscription.member === 'string') {
        return 'Member';
    }

    const firstName = subscription.member?.firstName || '';
    const lastName = subscription.member?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || subscription.member?.email || 'Member';
};

const getSubscriptionMonthlyPrice = (subscription: Subscription) => {
    if (typeof subscription.activity === 'string') {
        return 0;
    }

    return subscription.activity?.monthlyPrice || 0;
};

const getPaymentSubscriptionId = (payment: Payment) => {
    if (typeof payment.subscription === 'string') {
        return payment.subscription;
    }

    return payment.subscription?._id || '';
};

export const CoachDashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userRole = useSelector((state: RootState) => state.auth.user?.role);
    const isCoach = userRole === 'COACH';

    const {
        activities,
        isLoading: activitiesLoading,
        error: activitiesError,
    } = useSelector((state: RootState) => state.activities);
    const {
        members,
        isLoading: membersLoading,
        error: membersError,
    } = useSelector((state: RootState) => state.members);
    const {
        subscriptions,
        isLoading: subscriptionsLoading,
        error: subscriptionsError,
    } = useSelector((state: RootState) => state.subscriptions);
    const {
        payments,
        isLoading: paymentsLoading,
        error: paymentsError,
    } = useSelector((state: RootState) => state.payments);

    useEffect(() => {
        if (!isCoach) {
            return;
        }

        dispatch(fetchActivities());
        dispatch(fetchMembers());
        dispatch(fetchSubscriptions());
        dispatch(fetchPayments());
    }, [dispatch, isCoach]);

    const isLoading =
        activitiesLoading ||
        membersLoading ||
        subscriptionsLoading ||
        paymentsLoading;
    const error =
        activitiesError || membersError || subscriptionsError || paymentsError;

    const coachActivityIds = useMemo(() => {
        return new Set(activities.map((activity) => activity._id));
    }, [activities]);

    const coachActiveSubscriptions = useMemo(() => {
        return subscriptions.filter((subscription) => {
            if (subscription.status !== 'active') {
                return false;
            }

            const activityId = getSubscriptionActivityId(subscription);
            return Boolean(activityId && coachActivityIds.has(activityId));
        });
    }, [subscriptions, coachActivityIds]);

    const enrollmentByActivity = useMemo(() => {
        const map = new Map<string, number>();

        coachActiveSubscriptions.forEach((subscription) => {
            const activityId = getSubscriptionActivityId(subscription);
            if (!activityId) {
                return;
            }

            map.set(activityId, (map.get(activityId) || 0) + 1);
        });

        return map;
    }, [coachActiveSubscriptions]);

    const allSessions = useMemo(() => {
        const sessions: CoachSession[] = [];

        activities.forEach((activity) => {
            const schedule = activity.schedule || [];
            const enrolled = enrollmentByActivity.get(activity._id) || 0;

            schedule.forEach((slot, index) => {
                if (!slot.day || !slot.startTime || !slot.endTime) {
                    return;
                }

                sessions.push({
                    id: `${activity._id}-${slot.day}-${index}`,
                    name: activity.name,
                    day: slot.day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    enrolled,
                    capacity: activity.maxCapacity,
                });
            });
        });

        return sessions;
    }, [activities, enrollmentByActivity]);

    const todayDayName = JS_DAY_ORDER[new Date().getDay()];
    const todaysSessions = useMemo(() => {
        return allSessions
            .filter((session) => session.day === todayDayName)
            .sort((left, right) => left.startTime.localeCompare(right.startTime));
    }, [allSessions, todayDayName]);

    const nextSession = useMemo<NextSession | null>(() => {
        const now = new Date();
        let next: NextSession | null = null;

        activities.forEach((activity) => {
            const schedule = activity.schedule || [];

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

    const paidSubscriptionIds = useMemo(() => {
        const ids = new Set<string>();

        payments.forEach((payment) => {
            const subscriptionId = getPaymentSubscriptionId(payment);
            if (subscriptionId) {
                ids.add(subscriptionId);
            }
        });

        return ids;
    }, [payments]);

    const unpaidSubscriptions = useMemo(() => {
        return coachActiveSubscriptions.filter(
            (subscription) => !paidSubscriptionIds.has(subscription._id),
        );
    }, [coachActiveSubscriptions, paidSubscriptionIds]);

    const unpaidMembers = useMemo(() => {
        const byMember = new Map<string, UnpaidMemberEntry>();

        unpaidSubscriptions.forEach((subscription) => {
            const memberId = getSubscriptionMemberId(subscription);
            const key = memberId || `unknown-${subscription._id}`;
            const existing = byMember.get(key);
            const amount = getSubscriptionMonthlyPrice(subscription);

            if (existing) {
                existing.amount += amount;
                return;
            }

            byMember.set(key, {
                id: key,
                name: getSubscriptionMemberName(subscription),
                amount,
            });
        });

        return Array.from(byMember.values()).sort(
            (left, right) => right.amount - left.amount,
        );
    }, [unpaidSubscriptions]);

    const totalUnpaidAmount = useMemo(() => {
        return unpaidSubscriptions.reduce(
            (total, subscription) => total + getSubscriptionMonthlyPrice(subscription),
            0,
        );
    }, [unpaidSubscriptions]);

    if (!isCoach) {
        return (
            <div className="p-8">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <h2 className="text-lg font-bold">Coach Dashboard</h2>
                    <p className="text-white/40 text-sm mt-2">
                        This view is available for coaches only.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Coach Dashboard</h2>
                    <p className="text-white/40 text-sm mt-1">Manage your activities and members</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    title="My Members"
                    value={isLoading ? '...' : members.length}
                    icon={<Users className="h-5 w-5" />}
                    subtitle={isLoading ? 'Loading...' : `Across ${activities.length} activities`}
                    delay={100}
                />
                <StatCard
                    title="Next Class"
                    value={
                        isLoading
                            ? '...'
                            : nextSession
                                ? `${formatSessionDate(nextSession.date)} ${nextSession.startTime}`
                                : 'N/A'
                    }
                    icon={<Clock className="h-5 w-5" />}
                    subtitle={
                        isLoading
                            ? 'Loading...'
                            : nextSession
                                ? nextSession.activityName
                                : 'No upcoming session'
                    }
                    delay={200}
                />
                <StatCard
                    title="Unpaid Dues"
                    value={isLoading ? '...' : formatMoney(totalUnpaidAmount)}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    subtitle={
                        isLoading
                            ? 'Calculating...'
                            : `${unpaidMembers.length} member${unpaidMembers.length === 1 ? '' : 's'} pending`
                    }
                    delay={300}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-white/10 p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <h3 className="text-lg font-bold mb-6 tracking-tight">Today's Schedule</h3>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-8 text-white/40">
                            <div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3"></div>
                            <p className="font-mono text-[10px] uppercase tracking-widest">Loading schedule...</p>
                        </div>
                    ) : todaysSessions.length === 0 ? (
                        <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">
                            No classes scheduled for today.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todaysSessions.map((session) => {
                                const isFull = session.capacity > 0 && session.enrolled >= session.capacity;
                                const occupancyPercent = session.capacity > 0
                                    ? Math.min((session.enrolled / session.capacity) * 100, 100)
                                    : 0;

                                return (
                                    <div key={session.id} className="p-4 border border-white/10 bg-white/1 hover:bg-white/3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="font-bold text-white/90">{session.name}</p>
                                            <p className="text-xs text-white/40 font-mono mt-1">
                                                {session.startTime} - {session.endTime}
                                            </p>
                                        </div>
                                        <div className="space-y-2 min-w-37.5">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                                <span className="text-white/60">Enrolled</span>
                                                <span className={isFull ? 'text-red-400' : 'text-brand'}>
                                                    {session.enrolled} / {session.capacity}
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1 border border-white/5">
                                                <div
                                                    className={`h-full transition-all duration-1000 ease-out ${isFull ? 'bg-red-500' : 'bg-brand'}`}
                                                    style={{ width: `${occupancyPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 border border-white/10 p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold tracking-tight">Unpaid Dues</h3>
                        <span className="text-brand text-[10px] font-bold uppercase tracking-widest">
                            {unpaidMembers.length} Pending
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="text-white/40 text-sm">Loading unpaid members...</div>
                    ) : unpaidMembers.length === 0 ? (
                        <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">
                            All assigned subscriptions are paid.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {unpaidMembers.slice(0, 6).map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/2">
                                    <span className="text-sm font-medium">{member.name}</span>
                                    <span className="text-xs font-bold text-red-400">
                                        {formatMoney(member.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
