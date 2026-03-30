import type { ChangeEvent, FormEvent } from 'react';


export type MemberFormState = { firstName: string; lastName: string; email: string; password: string; phone: string; dateOfBirth: string; };

interface MemberModalProps { isOpen: boolean; mode: 'create' | 'edit'; values: MemberFormState; error: string | null; isSubmitting: boolean; onChange: (field: keyof MemberFormState) => (event: ChangeEvent<HTMLInputElement>) => void; onClose: () => void; onSubmit: (event: FormEvent) => void; }

export const MemberModal = ({ isOpen, mode, values, error, isSubmitting, onChange, onClose, onSubmit }: MemberModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto h-screen">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl p-6 max-w-md w-full relative animate-fade-in max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">{mode === 'create' ? 'Add Member' : 'Edit Member'}</h3>
                <p className="text-white/60 text-sm mb-6">{mode === 'create' ? 'Create a new member.' : 'Update member details.'}</p>
                <form onSubmit={onSubmit} className="space-y-5">
                    {error && <div className="p-3 bg-red-500/10 text-red-500 text-xs">{error}</div>}
                    <div className="space-y-4">
                        {[
                            { field: 'firstName', type: 'text', placeholder: 'e.g. Karim', label: 'First Name *', required: true },
                            { field: 'lastName', type: 'text', placeholder: 'e.g. Alaoui', label: 'Last Name *', required: true },
                            { field: 'email', type: 'email', placeholder: 'member@gym.com', label: 'Email *', required: true },
                            { field: 'password', type: 'password', placeholder: mode === 'create' ? 'Min 6 chars' : 'Leave blank to keep current', label: mode === 'create' ? 'Password *' : 'New Password (optional)', minLength: 6, required: mode === 'create' },
                            { field: 'phone', type: 'tel', placeholder: 'e.g. 0600000000', label: 'Phone (optional)', required: false },
                            { field: 'dateOfBirth', type: 'date', placeholder: '', label: 'Date of Birth (optional)', required: false }
                        ].map(config => (
                            <div key={config.field}>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">{config.label}</label>
                                <input type={config.type} value={(values as any)[config.field]} onChange={onChange(config.field as any)} required={config.required} minLength={config.minLength} placeholder={config.placeholder} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 pt-2 border-t border-white/5">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 bg-white/5 py-3 text-xs font-bold uppercase hover:bg-white/10 transitions">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase hover:bg-white disabled:opacity-50">{isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Member' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
