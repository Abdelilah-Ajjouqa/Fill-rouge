import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Building2, Users, UserCog, DollarSign, Activity, AlertCircle } from 'lucide-react';
import api from '../../../api/axios';
import type { RootState } from '../../../store/store';
import type { Gym, GymRef, Member } from '../../../types/models';
import type { User } from '../../../types/auth';
import { StatCard } from '../StatCard';

type Payment = {
    _id: string;
    amount: number;
    paidAt?: string;
    gymId?: string | GymRef;
    subscription?: {
        member?: {
            firstName?: string;
            lastName?: string;
            email?: string;
        };
        activity?: {
            name?: string;
        };
    };
};

type Subscription = {
    _id: string;
    status: string;
    gymId?: string | GymRef;
    endDate?: string;
};

const getGymId = (gymValue?: string | GymRef) => {
    if (!gymValue) {
        return '';
    }
    return typeof gymValue === 'string' ? gymValue : gymValue._id;
};

const formatCurrency = (value: number) => `${value.toLocaleString()} DH`;

const formatDate = (value?: string) => {
    if (!value) {
        return '--';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '--';
    }
    return date.toLocaleDateString();
};

export const SuperAdminAnalyticsPage = () => {
    const userRole = useSelector((state: RootState) => state.auth.user?.role);
    const isSuperAdmin = userRole === 'SUPER_ADMIN';

    const [gyms, setGyms] = useState<Gym[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isSuperAdmin) {
            return;
        }

        let isActive = true;

        const fetchAnalytics = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [gymsResponse, usersResponse, membersResponse, paymentsResponse, subscriptionsResponse] = await Promise.all([
                    api.get<Gym[]>('/gyms'),
                    api.get<User[]>('/users'),
                    api.get<Member[]>('/members'),
                    api.get<Payment[]>('/payments'),
                    api.get<Subscription[]>('/subscriptions'),
                ]);

                if (!isActive) {
                    return;
                }

                setGyms(gymsResponse.data);
                setUsers(usersResponse.data);
                setMembers(membersResponse.data);
                setPayments(paymentsResponse.data);
                setSubscriptions(subscriptionsResponse.data);
            } catch (err) {
                if (!isActive) {
                    return;
                }

                let message = 'Failed to load analytics data.';
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

        fetchAnalytics();

        return () => {
            isActive = false;
        };
    }, [isSuperAdmin]);

    const gymsMap = useMemo(() => {
        const map = new Map<string, Gym>();
        gyms.forEach((gym) => {
            map.set(gym._id, gym);
        });
        return map;
    }, [gyms]);

    const activeGyms = gyms.filter((gym) => gym.isActive).length;
    const totalMembers = members.length;
    const adminCount = users.filter((user) => user.role === 'ADMIN').length;
    const coachCount = users.filter((user) => user.role === 'COACH').length;
    const totalStaff = adminCount + coachCount;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRevenue = payments.reduce((total, payment) => {
        const paidAt = payment.paidAt ? new Date(payment.paidAt) : null;
        if (!paidAt || Number.isNaN(paidAt.getTime())) {
            return total;
        }
        if (paidAt >= monthStart) {
            return total + payment.amount;
        }
        return total;
    }, 0);

    const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active').length;
    const expiredSubscriptions = subscriptions.filter((sub) => sub.status === 'expired').length;

    const topGymsByMembers = useMemo(() => {
        const counts = new Map<string, number>();
        members.forEach((member) => {
            const gymId = typeof member.gymId === 'string' ? member.gymId : '';
            if (!gymId) {
                return;
            }
            counts.set(gymId, (counts.get(gymId) || 0) + 1);
        });

        return Array.from(counts.entries())
            .map(([gymId, count]) => ({
                gymId,
                count,
                name: gymsMap.get(gymId)?.name || 'Unknown Gym',
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [members, gymsMap]);

    const latestPayments = useMemo(() => {
        return [...payments]
            .sort((a, b) => {
                const dateA = a.paidAt ? new Date(a.paidAt).getTime() : 0;
                const dateB = b.paidAt ? new Date(b.paidAt).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 5);
    }, [payments]);

    if (!isSuperAdmin) {
        return (
            <div className="p-8">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <h2 className="text-lg font-bold">Analytics</h2>
                    <p className="text-white/40 text-sm mt-2">
                        This view is available for Super Admins only.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Platform Analytics</h2>
                    <p className="text-white/40 text-sm mt-1">High level metrics across the network.</p>
                </div>
                <button className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors border border-brand">
                    Export Report
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    title="Active Gyms"
                    value={isLoading ? '...' : activeGyms}
                    icon={<Building2 className="h-5 w-5" />}
                    subtitle={isLoading ? 'Loading...' : `${gyms.length} total gyms`}
                    delay={100}
                />
                <StatCard
                    title="Total Members"
                    value={isLoading ? '...' : totalMembers}
                    icon={<Users className="h-5 w-5" />}
                    subtitle={isLoading ? 'Loading...' : 'Across all gyms'}
                    delay={200}
                />
                <StatCard
                    title="Total Staff"
                    value={isLoading ? '...' : totalStaff}
                    icon={<UserCog className="h-5 w-5" />}
                    subtitle={isLoading ? 'Loading...' : `${adminCount} admins · ${coachCount} coaches`}
                    delay={300}
                />
                <StatCard
                    title="Monthly Revenue"
                    value={isLoading ? '...' : formatCurrency(monthlyRevenue)}
                    icon={<DollarSign className="h-5 w-5" />}
                    subtitle={isLoading ? 'Loading...' : 'Collected this month'}
                    delay={400}
                />
                <StatCard
                    title="Active Subscriptions"
                    value={isLoading ? '...' : activeSubscriptions}
                    icon={<Activity className="h-5 w-5" />}
                    subtitle={isLoading ? 'Loading...' : 'Currently active'}
                    delay={500}
                />
                <StatCard
                    title="Expired Subscriptions"
                    value={isLoading ? '...' : expiredSubscriptions}
                    icon={<AlertCircle className="h-5 w-5" />}
                    subtitle={isLoading ? 'Loading...' : 'Need follow up'}
                    delay={600}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Top Gyms by Members</h3>
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Top 5</span>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-8 text-white/40">
                            <div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3"></div>
                            <p className="font-mono text-[10px] uppercase tracking-widest">Loading gyms...</p>
                        </div>
                    ) : topGymsByMembers.length === 0 ? (
                        <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">
                            No member data available yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topGymsByMembers.map((entry) => (
                                <div
                                    key={entry.gymId}
                                    className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-4"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-white">{entry.name}</p>
                                        <p className="text-xs text-white/40">Gym ID: {entry.gymId.slice(-6)}</p>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest text-brand">
                                        {entry.count} members
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Latest Payments</h3>
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Last 5</span>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-8 text-white/40">
                            <div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3"></div>
                            <p className="font-mono text-[10px] uppercase tracking-widest">Loading payments...</p>
                        </div>
                    ) : latestPayments.length === 0 ? (
                        <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">
                            No payments recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {latestPayments.map((payment) => {
                                const gymName = gymsMap.get(getGymId(payment.gymId))?.name || 'Unknown Gym';
                                const memberName = payment.subscription?.member
                                    ? `${payment.subscription.member.firstName || ''} ${payment.subscription.member.lastName || ''}`.trim()
                                    : 'Member';

                                return (
                                    <div
                                        key={payment._id}
                                        className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-4"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-white">{memberName || 'Member'}</p>
                                            <p className="text-xs text-white/40">{gymName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-white">{formatCurrency(payment.amount)}</p>
                                            <p className="text-[10px] text-white/40">{formatDate(payment.paidAt)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
