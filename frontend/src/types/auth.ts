export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COACH' | 'MEMBER';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  gymId: string | null;
}

export interface AuthResponse {
  access_token: string;
}
