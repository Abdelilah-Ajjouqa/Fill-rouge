import type { Gym } from './models';
import type { User } from './auth';

export type AccountFormState = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export type GymCardProps = {
    gym: Gym;
    animationDelayMs?: number;
    onEdit: (g: Gym) => void;
    onDelete: (id: string) => void;
    onManageAdmins: (g: Gym) => void;
    onViewDetails: (g: Gym) => void;
};

export type GymAdminListSectionProps = {
    isLoading: boolean;
    admins: User[];
    hasAdmin: boolean;
    onAddAdmin: () => void;
    onEditAdmin: (admin: User) => void;
    onToggleActive: (admin: User) => void;
    onDeleteAdmin: (admin: User) => void;
    isToggling: boolean;
    isDeleting: boolean;
};
