import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import type {
	AdminDashboardData,
	Payment,
	Subscription,
	TopActivity,
	UseAdminDashboardResult,
} from './types/type';

const isSameDay = (left: Date, right: Date) =>
	left.toDateString() === right.toDateString();

export const useAdminDashboard = (): UseAdminDashboardResult => {
	const [data, setData] = useState<AdminDashboardData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;

		const fetchDashboard = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const [paymentsResponse, subscriptionsResponse] = await Promise.all([
					api.get<Payment[]>('/payments'),
					api.get<Subscription[]>('/subscriptions'),
				]);

				if (!isActive) {
					return;
				}

				const payments = paymentsResponse.data;
				const subscriptions = subscriptionsResponse.data;

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
						.map((sub) => sub.member?._id)
						.filter(Boolean) as string[]
				);

				const activeMembers = activeMemberIds.size;

				const activityCounts = new Map<string, TopActivity>();
				for (const sub of activeSubscriptions) {
					const activityId = sub.activity?._id;
					if (!activityId) {
						continue;
					}
					const existing = activityCounts.get(activityId);
					if (existing) {
						existing.count += 1;
					} else {
						activityCounts.set(activityId, {
							name: sub.activity?.name || 'Unknown Activity',
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
						const memberName = sub.member
							? `${sub.member.firstName || ''} ${sub.member.lastName || ''}`.trim()
							: 'Unknown Member';
						const endDate = sub.endDate ? new Date(sub.endDate) : null;
						const status = endDate && isSameDay(endDate, now)
							? 'Expired Today'
							: 'Expired';

						return {
							id: sub._id,
							name: memberName || 'Unknown Member',
							activity: sub.activity?.name || 'Unknown Activity',
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

				setData({
					monthlyRevenue,
					activeMembers,
					topActivity,
					expiredMembers,
				});
			} catch (err) {
				if (!isActive) {
					return;
				}
				setError('Failed to load dashboard data.');
				setData(null);
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
	}, []);

	return { data, isLoading, error };
};
