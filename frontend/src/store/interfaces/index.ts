import type { User } from "../../types/auth";
import type { Gym, Member } from "../../types/models";

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
}

export interface MembersState {
    members: Member[];
    isLoading: boolean;
    error: string | null;
}