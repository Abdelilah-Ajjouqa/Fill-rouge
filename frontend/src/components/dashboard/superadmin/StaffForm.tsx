import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { createStaff, type StaffRole } from '../../../store/slices/staffSlice';
import type { AppDispatch, RootState } from '../../../store/store';

interface StaffFormProps {
    gymId: string;
    onCreated?: () => void;
}

export const StaffForm = ({ gymId, onCreated }: StaffFormProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isCreating, error } = useSelector((state: RootState) => state.staff);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<StaffRole>('ADMIN');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (role !== 'ADMIN' && role !== 'COACH') {
            toast.error('Only ADMIN or COACH can be created in this form');
            return;
        }

        const resultAction = await dispatch(
            createStaff({
                gymId,
                firstName,
                lastName,
                email,
                password,
                role,
            }),
        );

        if (createStaff.fulfilled.match(resultAction)) {
            toast.success(`${role} account created successfully`);
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
            setRole('ADMIN');
            onCreated?.();
            return;
        }

        const message =
            typeof resultAction.payload === 'string'
                ? resultAction.payload
                : 'Failed to create staff';
        toast.error(message);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                            First Name *
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            placeholder="e.g. Sara"
                            className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                            Last Name *
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            placeholder="e.g. El Amrani"
                            className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        Email *
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Minimum 6 characters"
                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        Role *
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as StaffRole)}
                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                    >
                        <option value="ADMIN">ADMIN</option>
                        <option value="COACH">COACH</option>
                    </select>
                    <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">
                        Super Admin can create only ADMIN or COACH in this flow.
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
            >
                {isCreating ? 'Creating...' : 'Create Staff Account'}
            </button>
        </form>
    );
};