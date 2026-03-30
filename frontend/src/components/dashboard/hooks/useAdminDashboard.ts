import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchPayments, fetchPaymentsByGym } from '../../../store/slices/paymentsSlice';
import { fetchSubscriptions, fetchSubscriptionsByGym } from '../../../store/slices/subscriptionsSlice';
import type { Subscription } from '../../../types/models';
import type {
	AdminDashboardData,
	TopActivity,
	UseAdminDashboardResult,
} from './types/type';

const isSameDay = (left: Date, right: Date) =>
	left.toDateString() === right.toDateString();

const getMemberId = (subscription: Subscription) => {
	if (!subscription.member) {
		return '';
	}
	return typeof subscription.member === 'string'
		? subscription.member
		: subscription.member._id;
};

const getMemberName = (subscription: Subscription) => {
	if (!subscription.member || typeof subscription.member === 'string') {
		return 'Unknown Member';
	}
	const firstName = subscription.member.firstName || '';
	const lastName = subscription.member.lastName || '';
	const fullName = `${firstName} ${lastName}`.trim();
	return fullName || subscription.member.email || 'Unknown Member';
};

const getActivityId = (subscription: Subscription) => {
	if (!subscription.activity) {
		return '';
	}
	return typeof subscription.activity === 'string'
		? subscription.activity
		: subscription.activity._id;
};

const getActivityName = (subscription: Subscription) => {
	if (!subscription.activity || typeof subscription.activity === 'string') {
		return 'Unknown Activity';
	}
	return subscription.activity.name || 'Unknown Activity';
};

export const useAdminDashboard = (): UseAdminDashboardResult => {
	const dispatch = useDispatch<AppDispatch>();
	const gymId = useSelector((state: RootState) => state.auth.user?.gymId || undefined);
	const { payments, isLoading: paymentsLoading, error: paymentsError } = useSelector(
		(state: RootState) => state.payments
	);
	const { subscriptions, isLoading: subscriptionsLoading, error: subscriptionsError } = useSelector(
		(state: RootState) => state.subscriptions
	);
	const isLoading = paymentsLoading || subscriptionsLoading;
	const error = paymentsError || subscriptionsError;

	useEffect(() => {
		if (gymId) {
			dispatch(fetchPaymentsByGym(gymId));
			dispatch(fetchSubscriptionsByGym(gymId));
			return;
		}

		dispatch(fetchPayments());
		dispatch(fetchSubscriptions());
	}, [dispatch, gymId]);

	const data = useMemo<AdminDashboardData | null>(() => {
		if (error) {
			return null;
		}

		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

		const monthlyRevenue = payments.reduce((total, payment) => {
			if (!payment.paidAt) {
				return total;
			}
			const paidAt = new Date(payment.paidAt);
			if (paidAt >= monthStart && paidAt < nextMonthStart) {
				return total + payment.amount;
			}
			return total;
		}, 0);

		const activeSubscriptions = subscriptions.filter((sub) => {
			if (sub.status !== 'active') {
				return false;
			}
			if (!sub.endDate) {
				return true;
			}
			return new Date(sub.endDate) >= now;
		});

		const activeMemberIds = new Set(
			activeSubscriptions
				.map((sub) => getMemberId(sub))
				.filter(Boolean) as string[]
		);

		const activityCounts = new Map<string, TopActivity>();
		for (const sub of activeSubscriptions) {
			const activityId = getActivityId(sub);
			if (!activityId) {
				continue;
			}
			const existing = activityCounts.get(activityId);
			const activityName = getActivityName(sub);
			if (existing) {
				existing.count += 1;
			} else {
				activityCounts.set(activityId, {
					name: activityName,
					count: 1,
				});
			}
		}

		const topActivity = Array.from(activityCounts.values()).sort(
			(a, b) => b.count - a.count
		)[0] || null;

		const expiredMembers = subscriptions
			.filter((sub) => {
				const endDate = sub.endDate ? new Date(sub.endDate) : null;
				if (sub.status === 'expired') {
					return true;
				}
				if (endDate && endDate < now) {
					return true;
				}
				return false;
			})
			.map((sub) => {
				const memberName = getMemberName(sub);
				const endDate = sub.endDate ? new Date(sub.endDate) : null;
				const status = endDate && isSameDay(endDate, now)
					? 'Expired Today'
					: 'Expired';

				return {
					id: sub._id,
					name: memberName || 'Unknown Member',
					activity: getActivityName(sub),
					expiredOn: sub.endDate || '',
					status,
				};
			})
			.sort((left, right) => {
				const leftDate = left.expiredOn ? new Date(left.expiredOn).getTime() : 0;
				const rightDate = right.expiredOn ? new Date(right.expiredOn).getTime() : 0;
				return rightDate - leftDate;
			})
			.slice(0, 6);

		return {
			monthlyRevenue,
			activeMembers: activeMemberIds.size,
			topActivity,
			expiredMembers,
		};
	}, [error, payments, subscriptions]);

	return { data, isLoading, error };
};
