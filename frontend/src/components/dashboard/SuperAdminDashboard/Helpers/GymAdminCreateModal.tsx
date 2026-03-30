import type { ChangeEvent, FormEvent } from 'react';
import type { User } from '../../../../types/auth';

type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

type GymAdminCreateModalProps = {
    isOpen: boolean;
    values: FormState;
    error: string | null;
    isSubmitting: boolean;
    availableAdmins: User[];
    selectedExistingAdminId: string;
    onSelectExistingAdmin: (value: string) => void;
    onChange: (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
};

export const GymAdminCreateModal = ({
    isOpen,
    values,
    error,
    isSubmitting,
    availableAdmins,
    selectedExistingAdminId,
    onSelectExistingAdmin,
    onChange,
    onClose,
    onSubmit,
}: GymAdminCreateModalProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in max-h-[90vh] overflow-y-auto my-6">
                <h3 className="text-xl font-bold mb-4">Add Gym Admin</h3>
                <p className="text-white/60 text-sm mb-6">Assign an existing admin or create a new one for this gym.</p>

                <form onSubmit={onSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                            Existing Unassigned Admin
                        </label>
                        <select
                            value={selectedExistingAdminId}
                            onChange={(event) => onSelectExistingAdmin(event.target.value)}
                            className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                        >
                            <option value="">Create new admin instead</option>
                            {availableAdmins.map((admin) => (
                                <option key={admin._id} value={admin._id}>
                                    {admin.firstName} {admin.lastName} · {admin.email}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-white/30 mt-1">Choose one to attach it to this gym.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={values.firstName}
                                onChange={onChange('firstName')}
                                required={!selectedExistingAdminId}
                                disabled={Boolean(selectedExistingAdminId)}
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
                                value={values.lastName}
                                onChange={onChange('lastName')}
                                required={!selectedExistingAdminId}
                                disabled={Boolean(selectedExistingAdminId)}
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
                                value={values.email}
                                onChange={onChange('email')}
                                required={!selectedExistingAdminId}
                                disabled={Boolean(selectedExistingAdminId)}
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
                                value={values.password}
                                onChange={onChange('password')}
                                minLength={6}
                                required={!selectedExistingAdminId}
                                disabled={Boolean(selectedExistingAdminId)}
                                placeholder="Minimum 6 characters"
                                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
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
                            {isSubmitting ? 'Saving...' : selectedExistingAdminId ? 'Assign Admin' : 'Add Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
