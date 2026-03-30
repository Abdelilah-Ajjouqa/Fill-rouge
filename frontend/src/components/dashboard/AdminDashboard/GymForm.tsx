import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGym, clearGymsError, updateGym } from '../../../store/slices/gymsSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import type { Gym, Hall } from '../../../types/models';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export interface GymFormProps { gym?: Gym; onSuccess: () => void; onCancel: () => void; }

const resolveGymLogoUrl = (l?: string | null) => l ? (l.startsWith('http') || l.startsWith('data:') ? l : `${import.meta.env.VITE_API_BASE_URL || ''}${l.startsWith('/') ? '' : '/uploads/'}${l}`) : null;

export const GymForm = ({ gym, onSuccess, onCancel }: GymFormProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.gyms);
    
    const [state, setState] = useState({ name: gym?.name || '', address: gym?.address || '', phone: gym?.phone || '' });
    const [isActive, setIsActive] = useState(gym?.isActive ?? true);
    const [halls, setHalls] = useState<Hall[]>(() => gym?.halls?.map(h => ({ _id: h._id, name: h.name || '', type: h.type || '', capacity: Number.isFinite(h.capacity) ? h.capacity : 1 })) || []);
    const [logo, setLogo] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: resolveGymLogoUrl(gym?.logo) });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearGymsError());
        if (!halls.length) return toast.error('Add at least one hall.');
        if (halls.some(h => !h.name.trim() || !h.type.trim() || !Number.isFinite(h.capacity) || h.capacity < 1)) return toast.error('Fill all hall details.');

        const fd = new FormData();
        Object.entries(state).forEach(([k, v]) => fd.append(k, v));
        fd.append('isActive', String(isActive));
        fd.append('halls', JSON.stringify(halls.map(h => ({ _id: h._id, name: h.name.trim(), type: h.type.trim(), capacity: Number(h.capacity) }))));
        if (logo.file) fd.append('logo', logo.file);

        const action = gym ? updateGym({ id: gym._id, formData: fd }) : createGym(fd);
        const res: any = await dispatch(action as any);
        if (typeof res.type === 'string' && res.type.endsWith('/fulfilled')) {
            toast.success(`Gym ${gym ? 'updated' : 'created'}`);
            onSuccess();
        } else toast.error(typeof res.payload === 'string' ? res.payload : 'Operation failed');
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/') && file.size <= 2097152) setLogo({ file, preview: URL.createObjectURL(file) });
    };

    const Input = ({ label, k, type, ph, max, ptn, text }: any) => (
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">{label} *</label>
            <input type={type} value={state[k as keyof typeof state]} onChange={e => {
                let v = e.target.value;
                if (k === 'phone') { v = v.replace(/\D/g, ''); if (v.length > 10) return; }
                setState(prev => ({ ...prev, [k]: v }));
            }} required maxLength={max} pattern={ptn} placeholder={ph} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors" />
            {text && <p className="text-[10px] text-white/20 mt-1">{text}</p>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{error}</div>}
            
            <div className="space-y-4">
                <Input label="Gym Name" k="name" type="text" ph="e.g. FitClub Downtown" />
                <Input label="Address" k="address" type="text" ph="e.g. 123 Main St, Casablanca" />
                <Input label="Phone Number" k="phone" type="tel" ph="e.g. 0600000000" max={10} ptn="\d{10}" text={`${state.phone.length}/10 digits`} />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-white/60">Halls & Capacity *</label><p className="text-[10px] text-white/30 mt-1">Gym capacity equals number of halls.</p></div>
                        <button type="button" onClick={() => setHalls(p => [...p, { name: '', type: '', capacity: 1 }])} className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 border border-white/10 text-white/60 hover:text-white hover:border-brand/40 transition-colors">Add Hall</button>
                    </div>

                    {!halls.length ? <div className="p-4 border border-dashed border-white/10 text-white/40 text-xs">No halls added.</div> : (
                        <div className="space-y-3">
                            {halls.map((h, i) => (
                                <div key={h._id || i} className="bg-slate-950 border border-white/10 p-4">
                                    <div className="flex justify-between mb-3"><p className="text-[10px] uppercase text-white/40">Hall {i + 1}</p><button type="button" onClick={() => setHalls(p => p.filter((_, idx) => idx !== i))} className="text-white/30 hover:text-red-300"><X className="h-4 w-4" /></button></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {[
                                            { k: 'name', t: 'text', ph: 'Hall name (e.g. A-2)' },
                                            { k: 'type', t: 'text', ph: 'Type (e.g. Yoga)' },
                                            { k: 'capacity', t: 'number', ph: 'Capacity' }
                                        ].map(f => (
                                            <input key={f.k} type={f.t} min={f.k === 'capacity' ? 1 : undefined} value={(h as any)[f.k]} onChange={e => setHalls(p => p.map((hh, idx) => idx === i ? { ...hh, [f.k]: f.t === 'number' ? Number(e.target.value) : e.target.value } : hh))} placeholder={f.ph} className="w-full bg-slate-950 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-brand" />
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

                <div className="flex items-center gap-3 pt-2"><input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 bg-slate-950 accent-brand" /><label className="text-sm font-medium text-white/80">Gym is currently active</label></div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="button" onClick={onCancel} disabled={isLoading} className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">{isLoading ? 'Saving...' : gym ? 'Update Gym' : 'Register Gym'}</button>
            </div>
        </form>
    );
};
