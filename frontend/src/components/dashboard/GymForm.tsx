import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGym, clearGymsError } from '../../store/slices/gymsSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { Gym } from '../../types/models';

interface GymFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const GymForm = ({ onSuccess, onCancel }: GymFormProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.gyms);

    const [formData, setFormData] = useState<Partial<Gym>>({
        name: '',
        address: '',
        phone: '',
        isActive: true,
        logo: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearGymsError());
        
        const resultAction = await dispatch(createGym(formData));
        if (createGym.fulfilled.match(resultAction)) {
            onSuccess();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        required
                        placeholder="e.g. FitClub Downtown"
                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        Address *
                    </label>
                    <input 
                        type="text" 
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 123 Main St, Casablanca"
                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        Phone Number *
                    </label>
                    <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        required
                        placeholder="e.g. +212 600 000 000"
                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        Logo URL (Optional)
                    </label>
                    <input 
                        type="url" 
                        name="logo"
                        value={formData.logo || ''}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-white/10 p-3 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                    <input 
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive || false}
                        onChange={handleChange}
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
                    {isLoading ? 'Saving...' : 'Register Gym'}
                </button>
            </div>
        </form>
    );
};
