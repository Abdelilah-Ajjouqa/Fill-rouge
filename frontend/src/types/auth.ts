export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COACH' | 'MEMBER';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  gymId: string | null;
  isActive?: boolean;
  phone?: string;
  photo?: string;
}

export interface AuthResponse {
  access_token: string;
}
