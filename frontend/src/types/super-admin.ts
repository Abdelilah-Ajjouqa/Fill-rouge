import type { Gym } from './models';

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
