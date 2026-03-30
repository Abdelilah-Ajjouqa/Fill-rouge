import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Edit2, Plus, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../api/axios';
import type { RootState, AppDispatch } from '../../../store/store';
import { createActivity, fetchActivities, updateActivity } from '../../../store/slices/activitiesSlice';
import { createUser, fetchUsers } from '../../../store/slices/usersSlice';
import type { Activity, Gym, Hall, ScheduleSlot } from '../../../types/models';
import type { User } from '../../../types/auth';
import { CoachCreateModal, type CoachFormState } from '../modals/CoachCreateModal';

type ActivityModalProps = {
    isOpen: boolean;
    activity: Activity | null;
    halls: Hall[];
    coaches: User[];
    onClose: () => void;
    onSaved: () => void;
};

const resolveCoachId = (activity: Activity | null) => {
    if (!activity) {
        return '';
    }

    if (typeof activity.coach === 'string') {
        return activity.coach;
    }

    return activity.coach?._id || '';
};

const DAY_OPTIONS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const getDefaultScheduleSlot = (): ScheduleSlot => ({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
});

const parseTimeToMinutes = (time: string) => {
    const [hourText, minuteText] = time.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);

    if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
        return null;
    }

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return null;
    }

    return hour * 60 + minute;
};

const scheduleSlotsOverlap = (left: ScheduleSlot, right: ScheduleSlot) => {
    if (left.day !== right.day) {
        return false;
    }

    const leftStart = parseTimeToMinutes(left.startTime);
    const leftEnd = parseTimeToMinutes(left.endTime);
    const rightStart = parseTimeToMinutes(right.startTime);
    const rightEnd = parseTimeToMinutes(right.endTime);

    if (
        leftStart === null ||
        leftEnd === null ||
        rightStart === null ||
        rightEnd === null
    ) {
        return false;
    }

    return leftStart < rightEnd && rightStart < leftEnd;
};

const ActivityModal = ({ isOpen, activity, halls, coaches, onClose, onSaved }: ActivityModalProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [name, setName] = useState('');
    const [coachId, setCoachId] = useState('');
    const [hallId, setHallId] = useState('');
    const [monthlyPrice, setMonthlyPrice] = useState(0);
    const [maxCapacity, setMaxCapacity] = useState(1);
    const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([getDefaultScheduleSlot()]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const defaultHallId = activity?.hallId || halls[0]?._id || '';
        const defaultCoachId = resolveCoachId(activity) || coaches[0]?._id || '';

        setName(activity?.name || '');
        setCoachId(defaultCoachId);
        setHallId(defaultHallId);
        setMonthlyPrice(activity?.monthlyPrice ?? 0);
        setMaxCapacity(activity?.maxCapacity ?? Math.max(1, halls[0]?.capacity ?? 1));
        setScheduleSlots(
            activity?.schedule?.length
                ? activity.schedule.map((slot) => ({
                    day: slot.day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                }))
                : [getDefaultScheduleSlot()],
        );
    }, [activity, halls, coaches, isOpen]);

    if (!isOpen) {
        return null;
    }

    const selectedHall = halls.find((hall) => hall._id === hallId);
    const effectiveCapacity = selectedHall
        ? Math.min(Number(maxCapacity) || 0, selectedHall.capacity)
        : Number(maxCapacity) || 0;

    const updateScheduleSlot = (index: number, field: keyof ScheduleSlot, value: string) => {
        setScheduleSlots((prev) => prev.map((slot, slotIndex) => (
            slotIndex === index
                ? { ...slot, [field]: value }
                : slot
        )));
    };

    const addScheduleSlot = () => {
        setScheduleSlots((prev) => [...prev, getDefaultScheduleSlot()]);
    };

    const removeScheduleSlot = (index: number) => {
        setScheduleSlots((prev) => {
            if (prev.length <= 1) {
                return prev;
            }
            return prev.filter((_, slotIndex) => slotIndex !== index);
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!name.trim() || !coachId || !hallId) {
            toast.error('Please fill all required fields.');
            return;
        }

        const priceValue = Number(monthlyPrice);
        const capacityValue = Number(maxCapacity);

        if (!Number.isFinite(priceValue) || priceValue < 0) {
            toast.error('Monthly price must be 0 or higher.');
            return;
        }

        if (!Number.isFinite(capacityValue) || capacityValue < 1) {
            toast.error('Max capacity must be at least 1.');
            return;
        }

        if (selectedHall && capacityValue > selectedHall.capacity) {
            toast.error(`Max capacity cannot exceed hall capacity (${selectedHall.capacity}).`);
            return;
        }

        if (!scheduleSlots.length) {
            toast.error('At least one schedule slot is required.');
            return;
        }

        const normalizedSchedule = scheduleSlots.map((slot) => ({
            day: slot.day.trim(),
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));

        if (normalizedSchedule.some((slot) => !slot.day || !slot.startTime || !slot.endTime)) {
            toast.error('Please complete all schedule fields.');
            return;
        }

        for (const slot of normalizedSchedule) {
            const start = parseTimeToMinutes(slot.startTime);
            const end = parseTimeToMinutes(slot.endTime);

            if (start === null || end === null) {
                toast.error('Invalid schedule time format.');
                return;
            }

            if (start >= end) {
                toast.error('Schedule start time must be before end time.');
                return;
            }
        }

        for (let i = 0; i < normalizedSchedule.length; i += 1) {
            for (let j = i + 1; j < normalizedSchedule.length; j += 1) {
                if (scheduleSlotsOverlap(normalizedSchedule[i], normalizedSchedule[j])) {
                    toast.error('Schedule contains overlapping slots.');
                    return;
                }
            }
        }

        const payload = {
            name: name.trim(),
            coach: coachId,
            hallId,
            monthlyPrice: priceValue,
            maxCapacity: capacityValue,
            schedule: normalizedSchedule,
        };

        setIsSaving(true);

        try {
            if (activity) {
                const result = await dispatch(updateActivity({ id: activity._id, data: payload }));
                if (updateActivity.fulfilled.match(result)) {
                    toast.success('Activity updated successfully.');
                    onSaved();
                } else {
                    toast.error(typeof result.payload === 'string' ? result.payload : 'Failed to save activity.');
                }
            } else {
                const result = await dispatch(createActivity(payload));
                if (createActivity.fulfilled.match(result)) {
                    toast.success('Activity created successfully.');
                    onSaved();
                } else {
                    toast.error(typeof result.payload === 'string' ? result.payload : 'Failed to save activity.');
                }
            }
        } catch {
            toast.error('Failed to save activity.');
        } finally {
            setIsSaving(false);
        }
    };

    const hasHalls = halls.length > 0;
    const hasCoaches = coaches.length > 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto h-screen">
            <div className="min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
                <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-lg w-full animate-fade-in max-h-[90vh] overflow-y-auto my-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold">{activity ? 'Edit Activity' : 'Create Activity'}</h3>
                            <p className="text-white/60 text-sm mt-1">Assign a hall and coach to the activity.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {!hasHalls && (
                        <div className="mb-4 p-3 border border-dashed border-white/10 text-white/50 text-xs">
                            No halls found for this gym. Ask the Super Admin to add halls before creating activities.
                        </div>
                    )}

                    {!hasCoaches && (
                        <div className="mb-4 p-3 border border-dashed border-white/10 text-white/50 text-xs">
                            No coaches found. Create a coach before assigning an activity.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                Activity Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
                                placeholder="e.g. CrossFit Basics"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                    Hall *
                                </label>
                                <select
                                    value={hallId}
                                    onChange={(event) => {
                                        const nextHallId = event.target.value;
                                        setHallId(nextHallId);
                                        const nextHall = halls.find((hall) => hall._id === nextHallId);
                                        if (nextHall && maxCapacity > nextHall.capacity) {
                                            setMaxCapacity(nextHall.capacity);
                                        }
                                    }}
                                    className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                                    required
                                    disabled={!hasHalls}
                                >
                                    <option value="">Select a hall</option>
                                    {halls.map((hall) => (
                                        <option key={hall._id || hall.name} value={hall._id}>
                                            {hall.name} · {hall.type} ({hall.capacity})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-white/40 mt-1">
                                    Hall capacity: {selectedHall ? selectedHall.capacity : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                    Coach *
                                </label>
                                <select
                                    value={coachId}
                                    onChange={(event) => setCoachId(event.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                                    required
                                    disabled={!hasCoaches}
                                >
                                    <option value="">Select a coach</option>
                                    {coaches.map((coach) => (
                                        <option key={coach._id} value={coach._id}>
                                            {coach.firstName} {coach.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                    Monthly Price (DH) *
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={monthlyPrice}
                                    onChange={(event) => setMonthlyPrice(Number(event.target.value))}
                                    className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                    Max Capacity *
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={selectedHall?.capacity}
                                    value={maxCapacity}
                                    onChange={(event) => {
                                        const nextValue = Number(event.target.value);
                                        if (!Number.isFinite(nextValue)) {
                                            return;
                                        }

                                        if (selectedHall) {
                                            setMaxCapacity(Math.min(nextValue, selectedHall.capacity));
                                            return;
                                        }

                                        setMaxCapacity(nextValue);
                                    }}
                                    className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                                    required
                                />
                                <p className="text-[10px] text-white/40 mt-1">
                                    Effective capacity: {effectiveCapacity}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60">
                                    Schedule Slots *
                                </label>
                                <button
                                    type="button"
                                    onClick={addScheduleSlot}
                                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 border border-white/10 text-white/60 hover:text-white hover:border-brand/40 transition-colors"
                                >
                                    Add Slot
                                </button>
                            </div>

                            <div className="space-y-3">
                                {scheduleSlots.map((slot, index) => (
                                    <div key={`${slot.day}-${index}`} className="bg-slate-950 border border-white/10 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] uppercase tracking-widest text-white/40">Slot {index + 1}</p>
                                            <button
                                                type="button"
                                                onClick={() => removeScheduleSlot(index)}
                                                className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-300 transition-colors disabled:opacity-40"
                                                disabled={scheduleSlots.length === 1}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <select
                                                value={slot.day}
                                                onChange={(event) => updateScheduleSlot(index, 'day', event.target.value)}
                                                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                                            >
                                                {DAY_OPTIONS.map((day) => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="time"
                                                value={slot.startTime}
                                                onChange={(event) => updateScheduleSlot(index, 'startTime', event.target.value)}
                                                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                                            />
                                            <input
                                                type="time"
                                                value={slot.endTime}
                                                onChange={(event) => updateScheduleSlot(index, 'endTime', event.target.value)}
                                                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || !hasHalls || !hasCoaches}
                                className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : activity ? 'Update Activity' : 'Create Activity'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const ActivitiesPage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isAdmin = user?.role === 'ADMIN';
    const isCoach = user?.role === 'COACH';

    const dispatch = useDispatch<AppDispatch>();
    const { activities, isLoading: activitiesLoading, error: activitiesError } = useSelector(
        (state: RootState) => state.activities,
    );
    const { users, isLoading: usersLoading, error: usersError } = useSelector(
        (state: RootState) => state.users,
    );

    const [halls, setHalls] = useState<Hall[]>([]);
    const [gymName, setGymName] = useState('');
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
    const [coachForm, setCoachForm] = useState<CoachFormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [coachError, setCoachError] = useState<string | null>(null);
    const [isCoachSubmitting, setIsCoachSubmitting] = useState(false);

    const handleCoachChange = (field: keyof CoachFormState) => (event: ChangeEvent<HTMLInputElement>) => {
        setCoachForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const resetCoachForm = () => {
        setCoachForm({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        });
    };

    const openCoachModal = () => {
        setCoachError(null);
        setIsCoachModalOpen(true);
    };

    const closeCoachModal = () => {
        setIsCoachModalOpen(false);
        setCoachError(null);
        resetCoachForm();
    };

    const handleCreateCoach = async (event: FormEvent) => {
        event.preventDefault();
        setCoachError(null);

        if (!coachForm.firstName.trim() || !coachForm.lastName.trim() || !coachForm.email.trim() || !coachForm.password.trim()) {
            setCoachError('Please fill all required fields.');
            return;
        }

        setIsCoachSubmitting(true);
        try {
            const result = await dispatch(createUser({
                firstName: coachForm.firstName.trim(),
                lastName: coachForm.lastName.trim(),
                email: coachForm.email.trim(),
                password: coachForm.password,
                role: 'COACH',
            }));

            if (createUser.fulfilled.match(result)) {
                toast.success('Coach created successfully.');
                closeCoachModal();
            } else {
                setCoachError(
                    typeof result.payload === 'string'
                        ? result.payload
                        : 'Failed to create coach.',
                );
            }
        } catch (err) {
            let message = 'Failed to create coach.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            setCoachError(message);
        } finally {
            setIsCoachSubmitting(false);
        }
    };

    const hallLookup = useMemo(() => {
        const map = new Map<string, Hall>();
        halls.forEach((hall) => {
            if (hall._id) {
                map.set(hall._id, hall);
            }
        });
        return map;
    }, [halls]);

    const coachList = useMemo(
        () => users.filter((entry) => entry.role === 'COACH'),
        [users],
    );

    const coachLookup = useMemo(() => {
        const map = new Map<string, User>();
        coachList.forEach((coach) => {
            map.set(coach._id, coach);
        });
        return map;
    }, [coachList]);

    const gymId = user?.gymId;

    const loadAdminResources = useCallback(async () => {
        if (!isAdmin || !gymId) {
            setGymName('');
            setHalls([]);
            return;
        }

        setIsAdminLoading(true);
        setPageError(null);

        try {
            const gymResponse = await api.get<Gym>(`/gyms/${gymId}`);
            setGymName(gymResponse.data.name);
            setHalls(gymResponse.data.halls ?? []);
        } catch (fetchError) {
            let message = 'Failed to load activities.';
            if (axios.isAxiosError(fetchError)) {
                message = fetchError.response?.data?.message || message;
            }
            setPageError(message);
        } finally {
            setIsAdminLoading(false);
        }
    }, [gymId, isAdmin]);

    const refreshActivities = useCallback(() => {
        dispatch(fetchActivities());
    }, [dispatch]);

    useEffect(() => {
        if (!user || (!isAdmin && !isCoach)) {
            return;
        }

        refreshActivities();

        if (isAdmin) {
            loadAdminResources();
            dispatch(fetchUsers());
        } else {
            setGymName('');
            setHalls([]);
        }
    }, [user, isAdmin, isCoach, refreshActivities, loadAdminResources, dispatch]);

    const isLoading = activitiesLoading || isAdminLoading || (isAdmin ? usersLoading : false);
    const errorMessage = pageError || activitiesError || (isAdmin ? usersError : null);

    if (!user) {
        return (
            <div className="p-8">
                <p className="text-white/60">Loading profile...</p>
            </div>
        );
    }

    if (!isAdmin && !isCoach) {
        return (
            <div className="p-8">
                <div className="bg-slate-900 border border-white/10 p-6">
                    <h2 className="text-lg font-bold">Activities</h2>
                    <p className="text-white/40 text-sm mt-2">This section is available for gym admins and coaches.</p>
                </div>
            </div>
        );
    }

    const handleOpenCreate = () => {
        setSelectedActivity(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedActivity(null);
    };

    const handleSaved = () => {
        handleModalClose();
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Activities</h2>
                    <p className="text-white/40 text-sm mt-1">
                        {isAdmin ? `Manage classes for ${gymName || 'your gym'}.` : 'Review your assigned classes.'}
                    </p>
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openCoachModal}
                            className="border border-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-3 hover:border-brand/40 hover:text-white transition-colors"
                        >
                            Add Coach
                        </button>
                        <button
                            onClick={handleOpenCreate}
                            className="bg-brand text-black text-xs font-bold uppercase tracking-widest px-4 py-3 hover:bg-white transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Activity
                        </button>
                    </div>
                )}
            </div>

            {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {errorMessage}
                </div>
            )}

            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-white/10 p-4">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Halls configured</p>
                        <p className="text-2xl font-bold mt-2">{halls.length}</p>
                        <p className="text-xs text-white/40">Gym capacity is {halls.length} rooms</p>
                    </div>
                    <div className="bg-slate-900 border border-white/10 p-4">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Coaches</p>
                        <p className="text-2xl font-bold mt-2">{coachList.length}</p>
                        <p className="text-xs text-white/40">Available to assign</p>
                    </div>
                    <div className="bg-slate-900 border border-white/10 p-4">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Activities</p>
                        <p className="text-2xl font-bold mt-2">{activities.length}</p>
                        <p className="text-xs text-white/40">Total classes</p>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-white/40">
                    <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4"></div>
                    <p className="font-mono text-[10px] uppercase tracking-widest">Loading Activities...</p>
                </div>
            ) : activities.length === 0 ? (
                <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">
                    No activities found yet. {isAdmin ? 'Create your first class to get started.' : 'Check back once your admin assigns classes.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activities.map((activity, index) => {
                        const hall = hallLookup.get(activity.hallId);
                        const coachLabel = typeof activity.coach === 'string'
                            ? coachLookup.get(activity.coach)
                            : activity.coach;

                        const coachName = coachLabel
                            ? `${coachLabel.firstName || ''} ${coachLabel.lastName || ''}`.trim() || coachLabel.email || 'Coach'
                            : 'Coach assigned';

                        const hallLabel = hall
                            ? `${hall.name} · ${hall.type}`
                            : activity.hallId
                                ? `Hall ${activity.hallId.slice(-6)}`
                                : 'Hall unassigned';

                        return (
                            <div
                                key={activity._id}
                                className="bg-slate-900 border border-white/10 p-6 flex flex-col gap-4 animate-fade-in"
                                style={{ animationDelay: `${(index + 1) * 80}ms` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white/90">{activity.name}</h3>
                                        <p className="text-xs text-white/50 mt-1">Hall: {hallLabel}</p>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleOpenEdit(activity)}
                                            className="p-2 hover:bg-white/5 text-white/40 hover:text-brand transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs text-white/50">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>Coach: {coachName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>Hall cap: {hall?.capacity ?? 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-white/60">
                                    <span>Price: {activity.monthlyPrice} DH</span>
                                    <span>Max capacity: {activity.maxCapacity}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isAdmin && (
                <ActivityModal
                    isOpen={isModalOpen}
                    activity={selectedActivity}
                    halls={halls}
                    coaches={coachList}
                    onClose={handleModalClose}
                    onSaved={handleSaved}
                />
            )}
            {isAdmin && (
                <CoachCreateModal
                    isOpen={isCoachModalOpen}
                    values={coachForm}
                    error={coachError}
                    isSubmitting={isCoachSubmitting}
                    onChange={handleCoachChange}
                    onClose={closeCoachModal}
                    onSubmit={handleCreateCoach}
                />
            )}
        </div>
    );
};
