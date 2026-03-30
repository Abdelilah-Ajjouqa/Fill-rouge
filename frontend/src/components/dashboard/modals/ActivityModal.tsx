import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch } from '../../../store/store';
import { createActivity, updateActivity } from '../../../store/slices/activitiesSlice';
import type { Activity, Hall, ScheduleSlot } from '../../../types/models';
import type { User } from '../../../types/auth';

const resolveCoachId = (activity: Activity | null) => typeof activity?.coach === 'string' ? activity.coach : (activity?.coach?._id || '');
const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const getDefaultSlot = (): ScheduleSlot => ({ day: 'Monday', startTime: '09:00', endTime: '10:00' });
const timeToMinutes = (timeString: string) => { const [hours, minutes] = timeString.split(':').map(Number); return Number.isInteger(hours) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60 ? hours * 60 + minutes : null; };
const isOverlapping = (slotA: ScheduleSlot, slotB: ScheduleSlot) => slotA.day === slotB.day && (timeToMinutes(slotA.startTime) ?? 0) < (timeToMinutes(slotB.endTime) ?? 0) && (timeToMinutes(slotB.startTime) ?? 0) < (timeToMinutes(slotA.endTime) ?? 0);

export const ActivityModal = ({ isOpen, activity, halls, coaches, onClose, onSaved }: { isOpen: boolean; activity: Activity | null; halls: Hall[]; coaches: User[]; onClose: () => void; onSaved: () => void; }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [state, setState] = useState({ name: '', coachId: '', hallId: '', monthlyPrice: 0, maxCapacity: 1 });
    const [slots, setSlots] = useState<ScheduleSlot[]>([getDefaultSlot()]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setState({
            name: activity?.name || '',
            coachId: resolveCoachId(activity) || coaches[0]?._id || '',
            hallId: activity?.hallId || halls[0]?._id || '',
            monthlyPrice: activity?.monthlyPrice ?? 0,
            maxCapacity: activity?.maxCapacity ?? Math.max(1, halls[0]?.capacity ?? 1)
        });
        setSlots(activity?.schedule?.length ? activity.schedule.map(s => ({ day: s.day, startTime: s.startTime, endTime: s.endTime })) : [getDefaultSlot()]);
    }, [activity, halls, coaches, isOpen]);

    if (!isOpen) return null;

    const selectedHall = halls.find(hall => hall._id === state.hallId);
    const effectiveMaxCapacity = selectedHall ? Math.min(Number(state.maxCapacity) || 0, selectedHall.capacity) : Number(state.maxCapacity) || 0;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const { name, coachId, hallId, monthlyPrice, maxCapacity } = state;
        if (!name.trim() || !coachId || !hallId) return toast.error('Fill required fields.');
        if (monthlyPrice < 0) return toast.error('Price must be >= 0.');
        if (maxCapacity < 1 || (selectedHall && maxCapacity > selectedHall.capacity)) return toast.error(`Capacity invalid. Max: ${selectedHall?.capacity}`);
        if (!slots.length) return toast.error('Add a slot.');
        
        for (const slot of slots) {
            const start = timeToMinutes(slot.startTime), end = timeToMinutes(slot.endTime);
            if (start === null || end === null || start >= end) return toast.error('Invalid schedule times.');
        }
        if (slots.some((slot, index) => slots.slice(index + 1).some(secondarySlot => isOverlapping(slot, secondarySlot)))) return toast.error('Overlapping slots.');

        setIsSaving(true);
        const data = { name: name.trim(), coach: coachId, hallId, monthlyPrice, maxCapacity, schedule: slots };
        const act = activity ? updateActivity({ id: activity._id, data }) : createActivity(data);
        const res: any = await dispatch(act as any);
        setIsSaving(false);
        if (typeof res.type === 'string' && res.type.endsWith('/fulfilled')) { toast.success('Saved'); onSaved(); }
        else toast.error(typeof res.payload === 'string' ? res.payload : 'Failed to save');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between mb-6"><div><h3 className="text-xl font-bold">{activity ? 'Edit' : 'Create'} Activity</h3><p className="text-white/60 text-sm mt-1">Assign details</p></div><button onClick={onClose} className="text-white/50 hover:text-white">✕</button></div>
                {!halls.length && <div className="mb-4 p-3 border border-dashed border-white/10 text-white/50 text-xs">No halls found.</div>}
                {!coaches.length && <div className="mb-4 p-3 border border-dashed border-white/10 text-white/50 text-xs">No coaches found.</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Name</label><input required value={state.name} onChange={event => setState(currentState => ({...currentState, name: event.target.value}))} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:border-brand" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Hall</label><select required disabled={!halls.length} value={state.hallId} onChange={event => setState(currentState => ({...currentState, hallId: event.target.value, maxCapacity: Math.min(currentState.maxCapacity, halls.find(hall => hall._id === event.target.value)?.capacity || currentState.maxCapacity)}))} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white"><option value="">Select hall</option>{halls.map(hall => <option key={hall._id} value={hall._id}>{hall.name} ({hall.capacity})</option>)}</select><p className="text-[10px] text-white/40 mt-1">Cap: {selectedHall?.capacity}</p></div>
                        <div><label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Coach</label><select required disabled={!coaches.length} value={state.coachId} onChange={event => setState(currentState => ({...currentState, coachId: event.target.value}))} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white"><option value="">Select coach</option>{coaches.map(coach => <option key={coach._id} value={coach._id}>{coach.firstName} {coach.lastName}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Price (DH)</label><input required type="number" min={0} value={state.monthlyPrice} onChange={event => setState(currentState => ({...currentState, monthlyPrice: Number(event.target.value)}))} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white" /></div>
                        <div><label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Max Capacity</label><input required type="number" min={1} max={selectedHall?.capacity} value={state.maxCapacity} onChange={event => setState(currentState => ({...currentState, maxCapacity: Number(event.target.value)}))} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white" /><p className="text-[10px] text-white/40 mt-1">Effective: {effectiveMaxCapacity}</p></div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between"><label className="block text-[10px] font-bold uppercase text-white/60">Slots</label><button type="button" onClick={() => setSlots(currentSlots => [...currentSlots, getDefaultSlot()])} className="text-[10px] font-bold uppercase px-3 py-2 border border-white/10 hover:text-white">Add</button></div>
                        {slots.map((slot, index) => (
                            <div key={index} className="bg-slate-950 border border-white/10 p-3">
                                <div className="flex justify-between mb-2"><p className="text-[10px] uppercase text-white/40">Slot {index + 1}</p><button type="button" onClick={() => setSlots(currentSlots => currentSlots.filter((_, slotIndex) => slotIndex !== index))} disabled={slots.length===1} className="text-[10px] text-white/40 hover:text-red-300">Remove</button></div>
                                <div className="grid grid-cols-3 gap-2">
                                    <select value={slot.day} onChange={event => setSlots(currentSlots => currentSlots.map((item, slotIndex) => slotIndex === index ? {...item, day: event.target.value} : item))} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white">{DAY_OPTIONS.map(dayOption => <option key={dayOption}>{dayOption}</option>)}</select>
                                    <input type="time" value={slot.startTime} onChange={event => setSlots(currentSlots => currentSlots.map((item, slotIndex) => slotIndex === index ? {...item, startTime: event.target.value} : item))} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white" />
                                    <input type="time" value={slot.endTime} onChange={event => setSlots(currentSlots => currentSlots.map((item, slotIndex) => slotIndex === index ? {...item, endTime: event.target.value} : item))} className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 bg-white/5 py-3 text-xs uppercase hover:bg-white/10">Cancel</button><button type="submit" disabled={isSaving||!halls.length||!coaches.length} className="flex-1 bg-brand text-black py-3 text-xs uppercase hover:bg-white disabled:opacity-50">Save</button></div>
                </form>
            </div>
        </div>
    );
};
