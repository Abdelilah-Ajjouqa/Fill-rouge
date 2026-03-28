import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../../api/axios';
import type { User } from '../../../types/auth';
import { GymAdminListSection } from './Helpers/GymAdminListSection';
import { GymAdminCreateModal } from './Helpers/GymAdminCreateModal';
import { GymAdminEditModal } from './Helpers/GymAdminEditModal';

type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export const GymAdminsPage = () => {
    const { gymId } = useParams();
    const navigate = useNavigate();
    const [admins, setAdmins] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    useEffect(() => {
        if (!gymId) {
            setError('Missing gym id.');
            return;
        }

        let isActive = true;

        const fetchAdmins = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await api.get<User[]>('/users');
                if (!isActive) {
                    return;
                }

                const gymAdmins = response.data.filter(
                    (user) => user.role === 'ADMIN' && user.gymId === gymId
                );
                setAdmins(gymAdmins);
            } catch (err) {
                if (!isActive) {
                    return;
                }
                setError('Failed to load admins.');
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchAdmins();

        return () => {
            isActive = false;
        };
    }, [gymId]);

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
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
        };

    const handleEditChange = (field: keyof FormState) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setEditValues((prev) => ({ ...prev, [field]: event.target.value }));
        };

    const handleCreateAdmin = async (event: React.FormEvent) => {
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

    const handleUpdateAdmin = async (event: React.FormEvent) => {
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
            setAdmins([]);
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

    return (
        <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gym Admin</h2>
                    <p className="text-white/40 text-sm mt-1">
                        Manage the admin for gym {gymId ? gymId.slice(-6) : 'Unknown'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={openCreateModal}
                        disabled={hasAdmin}
                        className="bg-brand text-black text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors disabled:opacity-50"
                    >
                        Add Admin
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-white/5 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        Back to clubs
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">
                    {error}
                </div>
            )}

            <GymAdminListSection
                isLoading={isLoading}
                admins={admins}
                hasAdmin={hasAdmin}
                onAddAdmin={openCreateModal}
                onEditAdmin={openEditModal}
                onToggleActive={handleToggleActive}
                onDeleteAdmin={handleDeleteAdmin}
                isToggling={isToggling}
                isDeleting={isDeleting}
            />

            <GymAdminCreateModal
                isOpen={isCreateModalOpen}
                values={formValues}
                error={formError}
                isSubmitting={isSubmitting}
                onChange={handleInputChange}
                onClose={closeCreateModal}
                onSubmit={handleCreateAdmin}
            />

            <GymAdminEditModal
                isOpen={isEditModalOpen && Boolean(editingAdmin)}
                values={editValues}
                error={editError}
                isSubmitting={isUpdating}
                onChange={handleEditChange}
                onClose={closeEditModal}
                onSubmit={handleUpdateAdmin}
            />
        </div>
    );
};
