import type { ChangeEvent, FormEvent } from 'react';

export type CoachFormState = { firstName: string; lastName: string; email: string; password: string; };

type Props = { isOpen: boolean; values: CoachFormState; error: string | null; isSubmitting: boolean; onChange: (f: keyof CoachFormState) => (e: ChangeEvent<HTMLInputElement>) => void; onClose: () => void; onSubmit: (e: FormEvent) => void; };

export const CoachCreateModal = ({ isOpen, values, error, isSubmitting, onChange, onClose, onSubmit }: Props) => {
    if (!isOpen) return null;

    const fields = [
        { key: 'firstName', label: 'First Name *', type: 'text', req: true, placeholder: 'e.g. Sarah', minLength: undefined },
        { key: 'lastName', label: 'Last Name *', type: 'text', req: true, placeholder: 'e.g. Bennani', minLength: undefined },
        { key: 'email', label: 'Email *', type: 'email', req: true, placeholder: 'e.g. coach@gym.com', minLength: undefined },
        { key: 'password', label: 'Password *', type: 'password', req: true, placeholder: 'Minimum 6 characters', minLength: 6 }
    ] as const;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto h-screen">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in max-h-[90vh] overflow-y-auto my-6">
                <h3 className="text-xl font-bold mb-4">Add Coach</h3><p className="text-white/60 text-sm mb-6">Create a new coach for this gym.</p>
                <form onSubmit={onSubmit} className="space-y-5">
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{error}</div>}
                    <div className="space-y-4">
                        {fields.map(f => (
                            <div key={f.key}>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">{f.label}</label>
                                <input type={f.type} value={values[f.key]} onChange={onChange(f.key)} required={f.req} minLength={f.minLength} placeholder={f.placeholder} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 pt-2 border-t border-white/5">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Add Coach'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
