import type { User } from "../../types/auth";
import type { Activity, Gym, Member, Payment, Subscription } from "../../types/models";

// Auth Interfaces
export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}


// Gyms Interfaces
export interface GymsState {
    gyms: Gym[];
    isLoading: boolean;
    error: string | null;
}


// Members Interfaces
export interface MemberInput {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
    dateOfBirth?: string;
    gymId?: string;
}

export interface MembersState {
    members: Member[];
    isLoading: boolean;
    error: string | null;
}

// Activities Interfaces
export interface ActivityInput {
    name: string;
    coach: string;
    hallId: string;
    monthlyPrice: number;
    maxCapacity: number;
}

export interface ActivitiesState {
    activities: Activity[];
    isLoading: boolean;
    error: string | null;
}

// Users Interfaces
export interface UserInput {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role?: User["role"];
    gymId?: string | null;
    isActive?: boolean;
}

export interface UsersState {
    users: User[];
    isLoading: boolean;
    error: string | null;
}

// Payments Interfaces
export interface PaymentsState {
    payments: Payment[];
    isLoading: boolean;
    error: string | null;
}

// Subscriptions Interfaces
export interface SubscriptionsState {
    subscriptions: Subscription[];
    isLoading: boolean;
    error: string | null;
}