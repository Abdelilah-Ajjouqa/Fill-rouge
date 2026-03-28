import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGym, clearGymsError, updateGym } from '../../store/slices/gymsSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { Gym, Hall } from '../../types/models';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface GymFormProps {
    gym?: Gym;
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
    const [halls, setHalls] = useState<Hall[]>(() => {
        if (!gym?.halls?.length) {
            return [];
        }
        return gym.halls.map((hall) => ({
            _id: hall._id,
            name: hall.name || '',
            type: hall.type || '',
            capacity: Number.isFinite(hall.capacity) ? hall.capacity : 1,
        }));
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        gym?.logo ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${gym.logo}` : null
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearGymsError());

        if (halls.length === 0) {
            toast.error('Add at least one hall with capacity.');
            return;
        }

        const hasInvalidHall = halls.some((hall) => {
            const hasName = hall.name.trim().length > 0;
            const hasType = hall.type.trim().length > 0;
            return !hasName || !hasType || !Number.isFinite(hall.capacity) || hall.capacity < 1;
        });

        if (hasInvalidHall) {
            toast.error('Fill all hall details and set capacity to at least 1.');
            return;
        }

        const normalizedHalls = halls.map((hall) => ({
            _id: hall._id,
            name: hall.name.trim(),
            type: hall.type.trim(),
            capacity: Number(hall.capacity),
        }));

        const formData = new FormData();
        formData.append('name', name);
        formData.append('address', address);
        formData.append('phone', phone);
        formData.append('isActive', String(isActive));
        formData.append('halls', JSON.stringify(normalizedHalls));

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

    const addHall = () => {
        setHalls((prev) => ([
            ...prev,
            { name: '', type: '', capacity: 1 },
        ]));
    };

    const updateHall = (index: number, field: keyof Hall, value: string | number) => {
        setHalls((prev) => prev.map((hall, idx) => (
            idx === index ? { ...hall, [field]: value } : hall
        )));
    };

    const removeHall = (index: number) => {
        setHalls((prev) => prev.filter((_, idx) => idx !== index));
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

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60">
                                Halls & Capacity *
                            </label>
                            <p className="text-[10px] text-white/30 mt-1">Gym capacity equals number of halls.</p>
                        </div>
                        <button
                            type="button"
                            onClick={addHall}
                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 border border-white/10 text-white/60 hover:text-white hover:border-brand/40 transition-colors"
                        >
                            Add Hall
                        </button>
                    </div>

                    {halls.length === 0 ? (
                        <div className="p-4 border border-dashed border-white/10 text-white/40 text-xs">
                            No halls added yet. Add at least one room to set capacity.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {halls.map((hall, index) => (
                                <div
                                    key={hall._id ?? `hall-${index}`}
                                    className="bg-slate-950 border border-white/10 p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] uppercase tracking-widest text-white/40">
                                            Hall {index + 1}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => removeHall(index)}
                                            className="p-1 text-white/30 hover:text-red-300 transition-colors"
                                            aria-label="Remove hall"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            value={hall.name}
                                            onChange={(e) => updateHall(index, 'name', e.target.value)}
                                            placeholder="Hall name (e.g. A-2)"
                                            className="w-full bg-slate-950 border border-white/10 p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                        />
                                        <input
                                            type="text"
                                            value={hall.type}
                                            onChange={(e) => updateHall(index, 'type', e.target.value)}
                                            placeholder="Type (e.g. Yoga)"
                                            className="w-full bg-slate-950 border border-white/10 p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                        />
                                        <input
                                            type="number"
                                            min={1}
                                            value={hall.capacity}
                                            onChange={(e) => updateHall(index, 'capacity', Number(e.target.value))}
                                            placeholder="Capacity"
                                            className="w-full bg-slate-950 border border-white/10 p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
