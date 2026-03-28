import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGym, clearGymsError, updateGym } from '../../store/slices/gymsSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface GymFormProps {
    gym?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export const GymForm = ({ gym, onSuccess, onCancel }: GymFormProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.gyms);

    const [name, setName] = useState(gym?.name || '');
    const [address, setAddress] = useState(gym?.address || '');
    const [phone, setPhone] = useState(gym?.phone || '');
    const [isActive, setIsActive] = useState(gym ? gym.isActive : true);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        gym?.logo ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${gym.logo}` : null
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearGymsError());

        const formData = new FormData();
        formData.append('name', name);
        formData.append('address', address);
        formData.append('phone', phone);
        formData.append('isActive', String(isActive));

        if (logoFile) {
            formData.append('logo', logoFile);
        }

        if (gym) {
            const resultAction = await dispatch(updateGym({ id: gym._id, formData }));
            if (updateGym.fulfilled.match(resultAction)) {
                toast.success('Gym updated successfully');
                onSuccess();
            } else {
                const message = typeof resultAction.payload === 'string'
                    ? resultAction.payload
                    : 'Failed to update gym';
                toast.error(message);
            }
            return;
        }

        const resultAction = await dispatch(createGym(formData));
        if (createGym.fulfilled.match(resultAction)) {
            toast.success('Gym created successfully');
            onSuccess();
        } else {
            const message = typeof resultAction.payload === 'string'
                ? resultAction.payload
                : 'Failed to create gym';
            toast.error(message);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) return;
        if (file.size > 2 * 1024 * 1024) return;

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const removeLogo = () => {
        setLogoFile(null);
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        Gym Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. FitClub Downtown"
                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        Address *
                    </label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder="e.g. 123 Main St, Casablanca"
                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, ''); //remove everything not a number
                            if (digits.length <= 10) setPhone(digits);
                        }}
                        required
                        maxLength={10}
                        pattern="\d{10}"
                        placeholder="e.g. 0600000000"
                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                    />
                    <p className="text-[10px] text-white/20 mt-1">{phone.length}/10 digits</p>
                </div>

                {/* Logo File Upload */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">
                        Logo (Optional)
                    </label>

                    {logoPreview ? (
                        <div className="relative inline-block">
                            <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="h-20 w-20 object-cover border border-white/10"
                            />
                            <button
                                type="button"
                                onClick={removeLogo}
                                className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 flex items-center justify-center hover:bg-red-400 transition-colors"
                            >
                                <X className="h-3 w-3 text-white" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 bg-slate-950 cursor-pointer hover:border-brand/40 hover:bg-white/2 transition-all">
                            <Upload className="h-6 w-6 text-white/20 mb-2" />
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                Click to upload image
                            </span>
                            <span className="text-[10px] text-white/20 mt-1">PNG, JPG (Max 2MB)</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 bg-slate-950 border-white/10 accent-brand"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-white/80">
                        Gym is currently active
                    </label>
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : gym ? 'Update Gym' : 'Register Gym'}
                </button>
            </div>
        </form>
    );
};
