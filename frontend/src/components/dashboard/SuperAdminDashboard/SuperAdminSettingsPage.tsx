import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Save, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../api/axios';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchProfile } from '../../../store/slices/authSlice';
import type { AccountFormState } from '../../../types/super-admin';

const InputField = ({ label, type = "text", value, onChange, placeholder, required = false, wrapperClass = "" }: any) => (
    <div className={wrapperClass}>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">{label}</label>
        <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
            className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors" />
    </div>
);

export const SuperAdminSettingsPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const [accountForm, setAccountForm] = useState<AccountFormState>({ firstName: '', lastName: '', email: '', password: '' });

    const [accountError, setAccountError] = useState<string | null>(null);
    const [isAccountSaving, setIsAccountSaving] = useState(false);

    useEffect(() => {
        if (user) setAccountForm((p) => ({ ...p, firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '' }));
    }, [user]);

    const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAccountForm((prev) => ({ ...prev, firstName: e.target.value }));
    };

    const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAccountForm((prev) => ({ ...prev, lastName: e.target.value }));
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAccountForm((prev) => ({ ...prev, email: e.target.value }));
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAccountForm((prev) => ({ ...prev, password: e.target.value }));
    };

    const handleAccountSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user?._id) return;

        const { firstName, lastName, email, password } = accountForm;
        if (!firstName.trim() || !lastName.trim() || !email.trim()) return setAccountError('First name, last name, and email are required.');

        setAccountError(null);
        setIsAccountSaving(true);

        try {
            const payload = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), ...(password.trim() ? { password } : {}) };

            await api.patch(`/users/${user._id}`, payload);
            await dispatch(fetchProfile());

            setAccountForm((p) => ({ ...p, password: '' }));
            toast.success('Account updated successfully.');
        } catch (err: any) {
            setAccountError(axios.isAxiosError(err) ? err.response?.data?.message || 'Failed' : 'Failed to update account.');
        } finally {
            setIsAccountSaving(false);
        }
    };

    if (!isSuperAdmin) {
        return <div className="p-8">
            <div className="bg-slate-900 border border-white/10 p-6">
                <h2 className="text-lg font-bold">Settings</h2>
                <p className="text-white/40 text-sm mt-2">Super Admins only.</p>
            </div>
        </div>;
    }

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-white/40 text-sm mt-1">Manage your Super Admin profile.</p>
            </div>
            <div className="max-w-3xl">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h3 className="text-lg font-bold">Account Settings</h3><p className="text-xs text-white/40 mt-1">Update identity.</p></div>
                        <BadgeCheck className="h-5 w-5 text-brand" />
                    </div>
                    <form onSubmit={handleAccountSubmit} className="space-y-5">
                        {accountError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{accountError}</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="First Name" value={accountForm.firstName} onChange={handleFirstNameChange} required />
                            <InputField label="Last Name" value={accountForm.lastName} onChange={handleLastNameChange} required />
                        </div>
                        <InputField label="Email" type="email" value={accountForm.email} onChange={handleEmailChange} required />
                        <InputField label="New Password (optional)" type="password" value={accountForm.password} onChange={handlePasswordChange} placeholder="Leave blank to keep current" />
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <p className="text-[10px] uppercase tracking-widest text-white/40">Changes apply instantly</p>
                            <button type="submit" disabled={isAccountSaving} className="bg-brand text-black text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2">
                                <Save className="h-4 w-4" /> {isAccountSaving ? 'Saving...' : 'Save Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
