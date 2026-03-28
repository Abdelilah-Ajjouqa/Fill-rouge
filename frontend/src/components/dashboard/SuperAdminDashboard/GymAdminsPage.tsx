import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../../api/axios';
import type { User } from '../../../types/auth';
import { GymAdminListSection } from './Helpers/GymAdminListSection';

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

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">Add Gym Admin</h3>
                        <p className="text-white/60 text-sm mb-6">Create a new admin for this gym.</p>

                        <form onSubmit={handleCreateAdmin} className="space-y-5">
                            {formError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formValues.firstName}
                                        onChange={handleInputChange('firstName')}
                                        required
                                        placeholder="e.g. Sarah"
                                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formValues.lastName}
                                        onChange={handleInputChange('lastName')}
                                        required
                                        placeholder="e.g. Bennani"
                                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formValues.email}
                                        onChange={handleInputChange('email')}
                                        required
                                        placeholder="e.g. admin@gym.com"
                                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={formValues.password}
                                        onChange={handleInputChange('password')}
                                        minLength={6}
                                        required
                                        placeholder="Minimum 6 characters"
                                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Add Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingAdmin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">Edit Gym Admin</h3>
                        <p className="text-white/60 text-sm mb-6">Update admin details.</p>

                        <form onSubmit={handleUpdateAdmin} className="space-y-5">
                            {editError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                    {editError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editValues.firstName}
                                        onChange={handleEditChange('firstName')}
                                        required
                                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editValues.lastName}
                                        onChange={handleEditChange('lastName')}
                                        required
                                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={editValues.email}
                                        onChange={handleEditChange('email')}
                                        required
                                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={editValues.password}
                                        onChange={handleEditChange('password')}
                                        minLength={6}
                                        placeholder="Leave blank to keep current"
                                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={isUpdating}
                                    className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
