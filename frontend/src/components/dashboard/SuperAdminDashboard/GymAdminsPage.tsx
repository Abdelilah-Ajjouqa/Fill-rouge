import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../../api/axios';
import type { User } from '../../../types/auth';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<FormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

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

    const handleInputChange = (field: keyof FormState) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
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

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-white/40">
                    <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4"></div>
                    <p className="font-mono text-[10px] uppercase tracking-widest">Fetching Admin...</p>
                </div>
            ) : admins.length === 0 ? (
                <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm flex items-center justify-between gap-4">
                    <span>No admin assigned yet.</span>
                    <button
                        onClick={openCreateModal}
                        disabled={hasAdmin}
                        className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-3 py-2 hover:bg-white transition-colors disabled:opacity-50"
                    >
                        Add Admin
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {admins.map((admin) => (
                        <article
                            key={admin._id}
                            className="bg-slate-900 border border-white/10 p-5 hover:border-brand/40 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-white">
                                {admin.firstName} {admin.lastName}
                            </h3>
                            <p className="text-xs text-white/60 mt-1">{admin.email}</p>
                            <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand">
                                {admin.role}
                            </div>
                        </article>
                    ))}
                </div>
            )}

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
        </div>
    );
};
