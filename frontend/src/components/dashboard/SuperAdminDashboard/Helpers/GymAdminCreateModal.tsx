import type { GymAdminCreateModalProps } from '../../../../types/super-admin';

export const GymAdminCreateModal = ({ isOpen, values, error, isSubmitting, availableAdmins, selectedExistingAdminId, onSelectExistingAdmin, onChange, onClose, onSubmit }: GymAdminCreateModalProps) => {
    if (!isOpen) return null;

    const fields = [
        { label: 'First Name *', key: 'firstName', type: 'text', ph: "e.g. Sarah", min: undefined },
        { label: 'Last Name *', key: 'lastName', type: 'text', ph: "e.g. Bennani", min: undefined },
        { label: 'Email *', key: 'email', type: 'email', ph: "e.g. admin@gym.com", min: undefined },
        { label: 'Password *', key: 'password', type: 'password', ph: "Minimum 6 characters", min: 6 }
    ] as const;

    const disabled = Boolean(selectedExistingAdminId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto h-screen">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in max-h-[90vh] overflow-y-auto my-6">
                <h3 className="text-xl font-bold mb-4">Add Gym Admin</h3>
                <p className="text-white/60 text-sm mb-6">Assign an existing admin or create a new one for this gym.</p>

                <form onSubmit={onSubmit} className="space-y-5">
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{error}</div>}

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Existing Unassigned Admin</label>
                        <select value={selectedExistingAdminId} onChange={e => onSelectExistingAdmin(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors">
                            <option value="">Create new admin instead</option>
                            {availableAdmins.map(a => <option key={a._id} value={a._id}>{a.firstName} {a.lastName} · {a.email}</option>)}
                        </select>
                        <p className="text-[10px] text-white/30 mt-1">Choose one to attach it to this gym.</p>
                    </div>

                    <div className="space-y-4">
                        {fields.map(f => (
                            <div key={f.key}>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">{f.label}</label>
                                <input type={f.type} value={values[f.key as keyof typeof values]} onChange={onChange(f.key as keyof typeof values)} required={!disabled} disabled={disabled} minLength={f.min} placeholder={f.ph} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors" />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 pt-2 border-t border-white/5">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">{isSubmitting ? 'Saving...' : selectedExistingAdminId ? 'Assign Admin' : 'Add Admin'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
