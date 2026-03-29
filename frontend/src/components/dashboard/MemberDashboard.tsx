import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Activity as ActivityIcon, CreditCard, Calendar } from 'lucide-react';
import api from '../../api/axios';
import type { RootState } from '../../store/store';
import type { Payment, Subscription } from '../../types/models';
import { getNextMemberSession } from './memberScheduleUtils';

const formatMoney = (value: number) => `${value.toLocaleString()} DH`;

const formatRemaining = (endDate: string) => {
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) {
        return 'Unknown';
    }

    const diffMs = end.getTime() - Date.now();
    if (diffMs <= 0) {
        return 'Expired';
    }

    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days < 7) {
        return `${days} day${days === 1 ? '' : 's'}`;
    }

    const weeks = Math.ceil(days / 7);
    if (weeks < 5) {
        return `${weeks} week${weeks === 1 ? '' : 's'}`;
    }

    const months = Math.ceil(days / 30);
    return `${months} month${months === 1 ? '' : 's'}`;
};

const getProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        return 0;
    }

    const ratio = (Date.now() - start) / (end - start);
    return Math.min(Math.max(ratio, 0), 1) * 100;
};

const getPaymentActivityName = (payment: Payment) => {
    const subscription = typeof payment.subscription === 'string' ? null : payment.subscription;
    const activity = subscription && typeof subscription.activity !== 'string'
        ? subscription.activity
        : null;
    return activity?.name || 'Activity';
};

const formatPaymentStatus = (payment: Payment) => {
    if (payment.amount >= payment.amountDue) {
        return 'Paid in full';
    }
    const debt = payment.amountDue - payment.amount;
    return `Partial (${formatMoney(debt)} Debt)`;
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

export const MemberDashboard = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            return;
        }

        let isActive = true;

        const fetchDashboard = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [subscriptionsResponse, paymentsResponse] = await Promise.all([
                    api.get<Subscription[]>('/subscriptions/me'),
                    api.get<Payment[]>('/payments/me'),
                ]);

                if (!isActive) {
                    return;
                }

                setSubscriptions(subscriptionsResponse.data);
                setPayments(paymentsResponse.data);
            } catch (err) {
                if (!isActive) {
                    return;
                }

                let message = 'Failed to load member dashboard data.';
                if (axios.isAxiosError(err)) {
                    message = err.response?.data?.message || message;
                }
                setError(message);
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => {
            isActive = false;
        };
    }, [user]);

    const activeSubscriptions = useMemo(
        () => subscriptions.filter((sub) => sub.status === 'active'),
        [subscriptions],
    );

    const paidSubscriptionIds = useMemo(() => {
        const paid = new Set<string>();
        payments.forEach((payment) => {
            const subscriptionId =
                typeof payment.subscription === 'string'
                    ? payment.subscription
                    : payment.subscription?._id;
            if (subscriptionId) {
                paid.add(subscriptionId);
            }
        });
        return paid;
    }, [payments]);

    const balanceDue = useMemo(() => {
        return activeSubscriptions.reduce((total, subscription) => {
            if (paidSubscriptionIds.has(subscription._id)) {
                return total;
            }

            const activity =
                typeof subscription.activity === 'string'
                    ? null
                    : subscription.activity;

            if (!activity) {
                return total;
            }

            return total + activity.monthlyPrice;
        }, 0);
    }, [activeSubscriptions, paidSubscriptionIds]);

    const nextSession = useMemo(
        () => getNextMemberSession(activeSubscriptions),
        [activeSubscriptions],
    );

    const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Member';

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome back, {displayName || 'Member'}</h2>
                    <p className="text-white/40 text-sm mt-1">Here is your fitness summary</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Balance Due</span>
                    <span className="text-lg font-bold text-red-400">
                        {isLoading ? '...' : formatMoney(balanceDue)}
                    </span>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-2 mb-2 text-white/60">
                        <ActivityIcon className="h-4 w-4" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Active Memberships</h3>
                    </div>

                    {isLoading ? (
                        <div className="bg-slate-900 border border-white/10 p-6 text-white/40">
                            Loading memberships...
                        </div>
                    ) : activeSubscriptions.length === 0 ? (
                        <div className="bg-slate-900 border border-white/10 p-6 text-white/40">
                            No active memberships yet.
                        </div>
                    ) : (
                        activeSubscriptions.map((subscription) => {
                            const activity =
                                typeof subscription.activity === 'string'
                                    ? null
                                    : subscription.activity;
                            const progress = getProgress(
                                subscription.startDate,
                                subscription.endDate,
                            );

                            return (
                                <article
                                    key={subscription._id}
                                    className="bg-slate-900 border border-white/10 p-6 group hover:border-brand/40 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <h4 className="text-lg font-bold tracking-tight">
                                            {activity?.name || 'Membership'}
                                        </h4>
                                        <span className="bg-brand/10 text-brand px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-brand/20">
                                            {subscription.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2" data-purpose="occupancy-stats">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                            <span className="text-white/60">Time Remaining</span>
                                            <span className="text-white">
                                                {formatRemaining(subscription.endDate)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1 border border-white/5">
                                            <div className="bg-white/40 h-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

                <div className="space-y-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-white/60">
                            <CreditCard className="h-4 w-4" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">Recent Payments</h3>
                        </div>
                        <div className="bg-slate-900 border border-white/10 p-4">
                            {isLoading ? (
                                <div className="text-white/40">Loading payments...</div>
                            ) : payments.length === 0 ? (
                                <div className="text-white/40">No payments recorded yet.</div>
                            ) : (
                                <div className="space-y-4">
                                    {payments.slice(0, 4).map((payment) => {
                                        const status = formatPaymentStatus(payment);
                                        return (
                                            <div
                                                key={payment._id}
                                                className="flex items-center justify-between text-sm pb-4 border-b border-white/5 last:border-0 last:pb-0"
                                            >
                                                <div>
                                                    <p className="font-bold">{getPaymentActivityName(payment)}</p>
                                                    <p className="text-[10px] text-white/40 font-mono mt-1">
                                                        {new Date(payment.paidAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{formatMoney(payment.amount)}</p>
                                                    <p
                                                        className={
                                                            status.includes('Partial')
                                                                ? 'text-red-400 text-[10px] font-bold uppercase mt-1'
                                                                : 'text-brand text-[10px] font-bold uppercase mt-1'
                                                        }
                                                    >
                                                        {status}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4 text-white/60">
                            <Calendar className="h-4 w-4" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">My Next Session</h3>
                        </div>
                        <div className="bg-slate-900 border border-white/10 p-6 flex items-center justify-between group hover:border-brand/40 transition-colors">
                            {isLoading ? (
                                <p className="text-white/40">Loading sessions...</p>
                            ) : !nextSession ? (
                                <p className="text-white/40">No upcoming sessions scheduled.</p>
                            ) : (
                                <>
                                    <div>
                                        <h4 className="font-bold tracking-tight">{nextSession.activityName}</h4>
                                        <p className="text-sm text-white/60 mt-1">
                                            {formatSessionDate(nextSession.date)} · {nextSession.startTime} - {nextSession.endTime}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-brand group-hover:text-black transition-colors">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
