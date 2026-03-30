import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGym, clearGymsError, updateGym } from '../../../store/slices/gymsSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import type { Gym, Hall } from '../../../types/models';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export interface GymFormProps { gym?: Gym; onSuccess: () => void; onCancel: () => void; }

const resolveGymLogoUrl = (logoString?: string | null) => logoString ? (logoString.startsWith('http') || logoString.startsWith('data:') ? logoString : `${import.meta.env.VITE_API_BASE_URL || ''}${logoString.startsWith('/') ? '' : '/uploads/'}${logoString}`) : null;

export const GymForm = ({ gym, onSuccess, onCancel }: GymFormProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.gyms);
    
    const [state, setState] = useState({ name: gym?.name || '', address: gym?.address || '', phone: gym?.phone || '' });
    const [isActive, setIsActive] = useState(gym?.isActive ?? true);
    const [halls, setHalls] = useState<Hall[]>(() => gym?.halls?.map(hall => ({ _id: hall._id, name: hall.name || '', type: hall.type || '', capacity: Number.isFinite(hall.capacity) ? hall.capacity : 1 })) || []);
    const [logo, setLogo] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: resolveGymLogoUrl(gym?.logo) });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        dispatch(clearGymsError());
        if (!halls.length) return toast.error('Add at least one hall.');
        if (halls.some(hall => !hall.name.trim() || !hall.type.trim() || !Number.isFinite(hall.capacity) || hall.capacity < 1)) return toast.error('Fill all hall details.');

        const formData = new FormData();
        Object.entries(state).forEach(([key, value]) => formData.append(key, value));
        formData.append('isActive', String(isActive));
        formData.append('halls', JSON.stringify(halls.map(hall => ({ _id: hall._id, name: hall.name.trim(), type: hall.type.trim(), capacity: Number(hall.capacity) }))));
        if (logo.file) formData.append('logo', logo.file);

        const action = gym ? updateGym({ id: gym._id, formData }) : createGym(formData);
        const res: any = await dispatch(action as any);
        if (typeof res.type === 'string' && res.type.endsWith('/fulfilled')) {
            toast.success(`Gym ${gym ? 'updated' : 'created'}`);
            onSuccess();
        } else toast.error(typeof res.payload === 'string' ? res.payload : 'Operation failed');
    };

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/') && file.size <= 2097152) setLogo({ file, preview: URL.createObjectURL(file) });
    };

    const Input = ({ label, field, type, placeholder, max, pattern, textContent }: any) => (
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">{label} *</label>
            <input type={type} value={state[field as keyof typeof state]} onChange={event => {
                let value = event.target.value;
                if (field === 'phone') { value = value.replace(/\D/g, ''); if (value.length > 10) return; }
                setState(prevState => ({ ...prevState, [field]: value }));
            }} required maxLength={max} pattern={pattern} placeholder={placeholder} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors" />
            {textContent && <p className="text-[10px] text-white/20 mt-1">{textContent}</p>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{error}</div>}
            
            <div className="space-y-4">
                <Input label="Gym Name" field="name" type="text" placeholder="e.g. FitClub Downtown" />
                <Input label="Address" field="address" type="text" placeholder="e.g. 123 Main St, Casablanca" />
                <Input label="Phone Number" field="phone" type="tel" placeholder="e.g. 0600000000" max={10} pattern="\d{10}" textContent={`${state.phone.length}/10 digits`} />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-white/60">Halls & Capacity *</label><p className="text-[10px] text-white/30 mt-1">Gym capacity equals number of halls.</p></div>
                        <button type="button" onClick={() => setHalls(prevHalls => [...prevHalls, { name: '', type: '', capacity: 1 }])} className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 border border-white/10 text-white/60 hover:text-white hover:border-brand/40 transition-colors">Add Hall</button>
                    </div>

                    {!halls.length ? <div className="p-4 border border-dashed border-white/10 text-white/40 text-xs">No halls added.</div> : (
                        <div className="space-y-3">
                            {halls.map((hall, index) => (
                                <div key={hall._id || index} className="bg-slate-950 border border-white/10 p-4">
                                    <div className="flex justify-between mb-3"><p className="text-[10px] uppercase text-white/40">Hall {index + 1}</p><button type="button" onClick={() => setHalls(prevHalls => prevHalls.filter((_, filterIndex) => filterIndex !== index))} className="text-white/30 hover:text-red-300"><X className="h-4 w-4" /></button></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {[
                                            { field: 'name', type: 'text', placeholder: 'Hall name (e.g. A-2)' },
                                            { field: 'type', type: 'text', placeholder: 'Type (e.g. Yoga)' },
                                            { field: 'capacity', type: 'number', placeholder: 'Capacity' }
                                        ].map(fieldObj => (
                                            <input key={fieldObj.field} type={fieldObj.type} min={fieldObj.field === 'capacity' ? 1 : undefined} value={(hall as any)[fieldObj.field]} onChange={event => setHalls(prevHalls => prevHalls.map((prevHall, mapIndex) => mapIndex === index ? { ...prevHall, [fieldObj.field]: fieldObj.type === 'number' ? Number(event.target.value) : event.target.value } : prevHall))} placeholder={fieldObj.placeholder} className="w-full bg-slate-950 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-brand" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Logo (Optional)</label>
                    {logo.preview ? (
                        <div className="relative inline-block"><img src={logo.preview} className="h-20 w-20 object-cover border border-white/10" /><button type="button" onClick={() => { if (logo.preview) URL.revokeObjectURL(logo.preview); setLogo({ file: null, preview: null }) }} className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 flex items-center justify-center hover:bg-red-400"><X className="h-3 w-3 text-white" /></button></div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 bg-slate-950 cursor-pointer hover:border-brand/40 hover:bg-white/2"><Upload className="h-6 w-6 text-white/20 mb-2" /><span className="text-[10px] text-white/30 uppercase font-bold">Upload image</span><input type="file" accept="image/*" onChange={handleFile} className="hidden" /></label>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-2"><input type="checkbox" checked={isActive} onChange={event => setIsActive(event.target.checked)} className="w-4 h-4 bg-slate-950 accent-brand" /><label className="text-sm font-medium text-white/80">Gym is currently active</label></div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="button" onClick={onCancel} disabled={isLoading} className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">{isLoading ? 'Saving...' : gym ? 'Update Gym' : 'Register Gym'}</button>
            </div>
        </form>
    );
};
