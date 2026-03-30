import type { ChangeEvent, FormEvent } from "react";
import type { User } from "./auth";

export type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export type UseGymAdminActionsArgs = {
    gymId?: string;
    admins: User[];
};

export type UseGymAdminActionsResult = {
    hasAdmin: boolean;
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    isSubmitting: boolean;
    isUpdating: boolean;
    isToggling: boolean;
    isDeleting: boolean;
    formError: string | null;
    editError: string | null;
    availableAdmins: User[];
    selectedExistingAdminId: string;
    formValues: FormState;
    editValues: FormState;
    editingAdmin: User | null;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    openEditModal: (admin: User) => void;
    closeEditModal: () => void;
    handleExistingAdminSelect: (value: string) => void;
    handleInputChange: (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => void;
    handleEditChange: (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => void;
    handleCreateAdmin: (event: FormEvent) => Promise<void>;
    handleUpdateAdmin: (event: FormEvent) => Promise<void>;
    handleToggleActive: (admin: User) => Promise<void>;
    handleDeleteAdmin: (admin: User) => Promise<void>;
};