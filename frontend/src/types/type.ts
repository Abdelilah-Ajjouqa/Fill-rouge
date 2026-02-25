enum UserRole {
    COACH = 'COACH',
    RECEPTIONIST = 'RECEPTIONIST',
    MEMBER = 'MEMBER',
}

export interface UserInterface {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
}