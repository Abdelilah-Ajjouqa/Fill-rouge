import type { ChangeEvent, FormEvent } from 'react';

type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

type GymAdminEditModalProps = {
    isOpen: boolean;
    values: FormState;
    error: string | null;
    isSubmitting: boolean;
    onChange: (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
};

export const GymAdminEditModal = ({
    isOpen,
    values,
    error,
    isSubmitting,
    onChange,
    onClose,
    onSubmit,
}: GymAdminEditModalProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in">
                <h3 className="text-xl font-bold mb-4">Edit Gym Admin</h3>
                <p className="text-white/60 text-sm mb-6">Update admin details.</p>

                <form onSubmit={onSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={values.firstName}
                                onChange={onChange('firstName')}
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
                                value={values.lastName}
                                onChange={onChange('lastName')}
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
                                value={values.email}
                                onChange={onChange('email')}
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
                                value={values.password}
                                onChange={onChange('password')}
                                minLength={6}
                                placeholder="Leave blank to keep current"
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
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
