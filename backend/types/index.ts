import { UserRole } from "src/users/schemas/user.schema";

export interface ActingUser {
    userId: string;
    role: UserRole;
    gymId?: string | null;
}