import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Save, BadgeCheck, Palette, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../api/axios';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchProfile } from '../../../store/slices/authSlice';

const BRANDING_STORAGE_KEY = 'superadmin_branding';

type AccountFormState = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

type BrandingFormState = {
    platformName: string;
    logoUrl: string;
    tagline: string;
};

const defaultBranding: BrandingFormState = {
    platformName: 'FitManager',
    logoUrl: '',
    tagline: 'Global fitness operations',
};

export const SuperAdminSettingsPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const [accountForm, setAccountForm] = useState<AccountFormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [accountError, setAccountError] = useState<string | null>(null);
    const [isAccountSaving, setIsAccountSaving] = useState(false);

    const [brandingForm, setBrandingForm] = useState<BrandingFormState>(defaultBranding);
    const [brandingError, setBrandingError] = useState<string | null>(null);
    const [isBrandingSaving, setIsBrandingSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }
        setAccountForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            password: '',
        });
    }, [user]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const stored = window.localStorage.getItem(BRANDING_STORAGE_KEY);
        if (!stored) {
            return;
        }
        try {
            const parsed = JSON.parse(stored) as Partial<BrandingFormState>;
            setBrandingForm({
                platformName: parsed.platformName || defaultBranding.platformName,
                logoUrl: parsed.logoUrl || defaultBranding.logoUrl,
                tagline: parsed.tagline || defaultBranding.tagline,
            });
        } catch {
            setBrandingForm(defaultBranding);
        }
    }, []);

    const handleAccountChange = (field: keyof AccountFormState) => (event: ChangeEvent<HTMLInputElement>) => {
        setAccountForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleBrandingChange = (field: keyof BrandingFormState) => (event: ChangeEvent<HTMLInputElement>) => {
        setBrandingForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Logo image must be 2MB or smaller.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            if (!result) {
                toast.error('Unable to read the selected image.');
                return;
            }
            setBrandingForm((prev) => ({ ...prev, logoUrl: result }));
        };
        reader.onerror = () => {
            toast.error('Unable to read the selected image.');
        };
        reader.readAsDataURL(file);
    };

    const handleLogoRemove = () => {
        setBrandingForm((prev) => ({ ...prev, logoUrl: '' }));
    };

    const handleAccountSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!user?._id) {
            return;
        }

        setAccountError(null);

        if (!accountForm.firstName.trim() || !accountForm.lastName.trim() || !accountForm.email.trim()) {
            setAccountError('First name, last name, and email are required.');
            return;
        }

        const payload: Record<string, string> = {
            firstName: accountForm.firstName.trim(),
            lastName: accountForm.lastName.trim(),
            email: accountForm.email.trim(),
        };

        if (accountForm.password.trim()) {
            payload.password = accountForm.password;
        }

        setIsAccountSaving(true);
        try {
            await api.patch(`/users/${user._id}`, payload);
            await dispatch(fetchProfile());
            setAccountForm((prev) => ({ ...prev, password: '' }));
            toast.success('Account updated successfully.');
        } catch (error) {
            let message = 'Failed to update account.';
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || message;
            }
            setAccountError(message);
        } finally {
            setIsAccountSaving(false);
        }
    };

    const handleBrandingSubmit = (event: FormEvent) => {
        event.preventDefault();
        setBrandingError(null);

        if (!brandingForm.platformName.trim()) {
            setBrandingError('Platform name is required.');
            return;
        }

        setIsBrandingSaving(true);
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify({
                    platformName: brandingForm.platformName.trim(),
                    logoUrl: brandingForm.logoUrl.trim(),
                    tagline: brandingForm.tagline.trim(),
                }));
                window.dispatchEvent(new Event('branding-updated'));
            }
            toast.success('Branding saved locally.');
        } finally {
            setIsBrandingSaving(false);
        }
    };

    const handleBrandingReset = () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(BRANDING_STORAGE_KEY);
            window.dispatchEvent(new Event('branding-updated'));
        }
        setBrandingForm(defaultBranding);
        setBrandingError(null);
        toast.success('Branding reset to default.');
    };

    if (!isSuperAdmin) {
        return (
            <div className="p-8">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <h2 className="text-lg font-bold">Settings</h2>
                    <p className="text-white/40 text-sm mt-2">This view is available for Super Admins only.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-white/40 text-sm mt-1">Manage your Super Admin profile and platform branding.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Account Settings</h3>
                            <p className="text-xs text-white/40 mt-1">Update your Super Admin identity.</p>
                        </div>
                        <BadgeCheck className="h-5 w-5 text-brand" />
                    </div>

                    <form onSubmit={handleAccountSubmit} className="space-y-5">
                        {accountError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                {accountError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.firstName}
                                    onChange={handleAccountChange('firstName')}
                                    className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.lastName}
                                    onChange={handleAccountChange('lastName')}
                                    className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={accountForm.email}
                                onChange={handleAccountChange('email')}
                                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                New Password (optional)
                            </label>
                            <input
                                type="password"
                                value={accountForm.password}
                                onChange={handleAccountChange('password')}
                                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                placeholder="Leave blank to keep current"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <p className="text-[10px] uppercase tracking-widest text-white/40">Changes apply instantly</p>
                            <button
                                type="submit"
                                disabled={isAccountSaving}
                                className="bg-brand text-black text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {isAccountSaving ? 'Saving...' : 'Save Account'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-slate-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Platform Branding</h3>
                            <p className="text-xs text-white/40 mt-1">Saved locally in this browser.</p>
                        </div>
                        <Palette className="h-5 w-5 text-brand" />
                    </div>

                    <form onSubmit={handleBrandingSubmit} className="space-y-5">
                        {brandingError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                {brandingError}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                Platform Name
                            </label>
                            <input
                                type="text"
                                value={brandingForm.platformName}
                                onChange={handleBrandingChange('platformName')}
                                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">
                                Logo (Upload)
                            </label>
                            <div className="flex items-center gap-3">
                                <label className="flex-1 flex items-center gap-2 border border-dashed border-white/10 bg-slate-950 p-3 text-xs text-white/50 cursor-pointer hover:border-brand/40 hover:text-white transition-colors">
                                    <Upload className="h-4 w-4" />
                                    <span>Choose image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                </label>
                                {brandingForm.logoUrl && (
                                    <button
                                        type="button"
                                        onClick={handleLogoRemove}
                                        className="p-2 border border-white/10 text-white/50 hover:text-red-300 hover:border-red-400/40 transition-colors"
                                        aria-label="Remove logo"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-white/30 mt-2">PNG/JPG up to 2MB. Stored locally in this browser.</p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                Tagline
                            </label>
                            <input
                                type="text"
                                value={brandingForm.tagline}
                                onChange={handleBrandingChange('tagline')}
                                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                placeholder="Optional slogan"
                            />
                        </div>

                        <div className="bg-slate-950/60 border border-white/10 p-4">
                            <p className="text-[10px] uppercase tracking-widest text-white/40">Preview</p>
                            <div className="flex items-center gap-3 mt-3">
                                <div className="h-12 w-12 border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                                    {brandingForm.logoUrl ? (
                                        <img
                                            src={brandingForm.logoUrl}
                                            alt="Logo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs text-white/40">Logo</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{brandingForm.platformName}</p>
                                    <p className="text-xs text-white/40">{brandingForm.tagline}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <button
                                type="button"
                                onClick={handleBrandingReset}
                                className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                            >
                                Reset to default
                            </button>
                            <button
                                type="submit"
                                disabled={isBrandingSaving}
                                className="bg-brand text-black text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {isBrandingSaving ? 'Saving...' : 'Save Branding'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
