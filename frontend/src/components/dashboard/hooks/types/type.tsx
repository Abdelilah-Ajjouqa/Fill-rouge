export type ActivityRef = {
    _id: string;
    name?: string;
};

export type MemberRef = {
    _id: string;
    firstName?: string;
    lastName?: string;
};

export type Subscription = {
    _id: string;
    status: string;
    endDate?: string;
    activity?: ActivityRef;
    member?: MemberRef;
};

export type Payment = {
    _id: string;
    amount: number;
    paidAt?: string;
};

export type TopActivity = {
    name: string;
    count: number;
};

export type ExpiredMember = {
    id: string;
    name: string;
    activity: string;
    expiredOn: string;
    status: string;
};

export type AdminDashboardData = {
    monthlyRevenue: number;
    activeMembers: number;
    topActivity: TopActivity | null;
    expiredMembers: ExpiredMember[];
};

export type UseAdminDashboardResult = {
    data: AdminDashboardData | null;
    isLoading: boolean;
    error: string | null;
};