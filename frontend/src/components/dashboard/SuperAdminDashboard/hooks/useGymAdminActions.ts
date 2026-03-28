import {
    useMemo,
    useState,
    type ChangeEvent,
    type Dispatch,
    type FormEvent,
    type SetStateAction,
} from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import api from '../../../../api/axios';
import type { User } from '../../../../types/auth';

type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

type UseGymAdminActionsArgs = {
    gymId?: string;
    admins: User[];
    setAdmins: Dispatch<SetStateAction<User[]>>;
};

type UseGymAdminActionsResult = {
    hasAdmin: boolean;
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    isSubmitting: boolean;
    isUpdating: boolean;
    isToggling: boolean;
    isDeleting: boolean;
    formError: string | null;
    editError: string | null;
    formValues: FormState;
    editValues: FormState;
    editingAdmin: User | null;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    openEditModal: (admin: User) => void;
    closeEditModal: () => void;
    handleInputChange: (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => void;
    handleEditChange: (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => void;
    handleCreateAdmin: (event: FormEvent) => Promise<void>;
    handleUpdateAdmin: (event: FormEvent) => Promise<void>;
    handleToggleActive: (admin: User) => Promise<void>;
    handleDeleteAdmin: (admin: User) => Promise<void>;
};

export const useGymAdminActions = ({
    gymId,
    admins,
    setAdmins,
}: UseGymAdminActionsArgs): UseGymAdminActionsResult => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<FormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [editValues, setEditValues] = useState<FormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [editingAdmin, setEditingAdmin] = useState<User | null>(null);

    const hasAdmin = useMemo(() => admins.length > 0, [admins.length]);

    const resetForm = () => {
        setFormValues({ firstName: '', lastName: '', email: '', password: '' });
        setFormError(null);
    };

    const resetEditForm = () => {
        setEditValues({ firstName: '', lastName: '', email: '', password: '' });
        setEditError(null);
        setEditingAdmin(null);
    };

    const updateAdminState = (updatedAdmin: User) => {
        setAdmins((prev) => prev.map((admin) => (
            admin._id === updatedAdmin._id ? updatedAdmin : admin
        )));
    };

    const openCreateModal = () => {
        if (hasAdmin) {
            toast.error('This gym already has an admin.');
            return;
        }
        resetForm();
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        resetForm();
    };

    const openEditModal = (admin: User) => {
        setEditValues({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            password: '',
        });
        setEditingAdmin(admin);
        setEditError(null);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        resetEditForm();
    };

    const handleInputChange = (field: keyof FormState) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
        };

    const handleEditChange = (field: keyof FormState) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setEditValues((prev) => ({ ...prev, [field]: event.target.value }));
        };

    const handleCreateAdmin = async (event: FormEvent) => {
        event.preventDefault();

        if (!gymId) {
            setFormError('Missing gym id.');
            return;
        }

        if (hasAdmin) {
            setFormError('This gym already has an admin.');
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        try {
            const payload = {
                ...formValues,
                role: 'ADMIN',
                gymId,
            };

            const response = await api.post<User>('/users', payload);
            setAdmins((prev) => [response.data, ...prev]);
            toast.success('Admin added successfully.');
            closeCreateModal();
        } catch (err) {
            let message = 'Failed to add admin.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            setFormError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateAdmin = async (event: FormEvent) => {
        event.preventDefault();

        if (!editingAdmin) {
            setEditError('Missing admin details.');
            return;
        }

        setIsUpdating(true);
        setEditError(null);

        try {
            const payload: Partial<FormState> = {
                firstName: editValues.firstName,
                lastName: editValues.lastName,
                email: editValues.email,
            };

            if (editValues.password.trim().length > 0) {
                payload.password = editValues.password;
            }

            const response = await api.patch<User>(`/users/${editingAdmin._id}`, payload);
            updateAdminState(response.data);
            toast.success('Admin updated successfully.');
            closeEditModal();
        } catch (err) {
            let message = 'Failed to update admin.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            setEditError(message);
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleActive = async (admin: User) => {
        const isActive = admin.isActive !== false;
        const nextState = !isActive;

        setIsToggling(true);

        try {
            const response = await api.patch<User>(`/users/${admin._id}`, { isActive: nextState });
            updateAdminState(response.data);
            toast.success(nextState ? 'Admin activated.' : 'Admin deactivated.');
        } catch (err) {
            let message = 'Failed to update admin status.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setIsToggling(false);
        }
    };

    const handleDeleteAdmin = async (admin: User) => {
        const confirmed = window.confirm(`Delete admin ${admin.firstName} ${admin.lastName}?`);
        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        try {
            await api.delete(`/users/${admin._id}`);
            setAdmins((prev) => prev.filter((item) => item._id !== admin._id));
            toast.success('Admin deleted.');
        } catch (err) {
            let message = 'Failed to delete admin.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        hasAdmin,
        isCreateModalOpen,
        isEditModalOpen,
        isSubmitting,
        isUpdating,
        isToggling,
        isDeleting,
        formError,
        editError,
        formValues,
        editValues,
        editingAdmin,
        openCreateModal,
        closeCreateModal,
        openEditModal,
        closeEditModal,
        handleInputChange,
        handleEditChange,
        handleCreateAdmin,
        handleUpdateAdmin,
        handleToggleActive,
        handleDeleteAdmin,
    };
};
