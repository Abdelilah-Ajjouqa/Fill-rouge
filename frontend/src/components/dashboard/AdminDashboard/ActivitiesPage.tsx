import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit2, Plus, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../api/axios';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchActivities } from '../../../store/slices/activitiesSlice';
import { createUser, fetchUsers } from '../../../store/slices/usersSlice';
import type { Activity, Gym, Hall } from '../../../types/models';
import { CoachCreateModal } from '../modals/CoachCreateModal';
import { ActivityModal } from '../modals/ActivityModal';

export const ActivitiesPage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const { activities, isLoading: isActivitiesLoading, error: activitiesError } = useSelector((state: RootState) => state.activities);
    const { users, isLoading: isUsersLoading, error: usersError } = useSelector((state: RootState) => state.users);

    const [halls, setHalls] = useState<Hall[]>([]);
    const [gymName, setGymName] = useState('');
    const [isGymLoading, setIsGymLoading] = useState(false);
    const [gymError, setGymError] = useState<string | null>(null);
    const [modal, setModal] = useState<{ open: boolean; item: Activity | null }>({ open: false, item: null });
    const [coachModal, setCoachModal] = useState({ open: false, form: { firstName: '', lastName: '', email: '', password: '' }, errorState: null as string | null, isSubmitting: false });

    const coachList = useMemo(() => users.filter(userElement => userElement.role === 'COACH'), [users]);
    const isAdmin = user?.role === 'ADMIN';
    const isCoach = user?.role === 'COACH';

    useEffect(() => {
        if (!user || (!isAdmin && !isCoach)) return;
        dispatch(fetchActivities());
        if (isAdmin && user.gymId) {
            setIsGymLoading(true);
            api.get<Gym>(`/gyms/${user.gymId}`).then(response => { setGymName(response.data.name); setHalls(response.data.halls ?? []); }).catch(error => setGymError((error as any).response?.data?.message || 'Error')).finally(() => setIsGymLoading(false));
            dispatch(fetchUsers());
        }
    }, [user, isAdmin, isCoach, dispatch]);

    const submitCoach = async (event: FormEvent) => {
        event.preventDefault();
        const { firstName, lastName, email, password } = coachModal.form;
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) return setCoachModal(state => ({ ...state, errorState: 'Fill all fields' }));
        setCoachModal(state => ({ ...state, isSubmitting: true }));
        const res: any = await dispatch(createUser({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password: password, role: 'COACH' }) as any);
        setCoachModal(state => ({ ...state, isSubmitting: false }));
        if (typeof res.type === 'string' && res.type.endsWith('/fulfilled')) { toast.success('Coach added'); setCoachModal(state => ({ ...state, open: false, form: { firstName: '', lastName: '', email: '', password: '' } })); }
        else setCoachModal(state => ({ ...state, errorState: typeof res.payload === 'string' ? res.payload : 'Failed' }));
    };

    if (!user) return <div className="p-8 text-white/60">Loading...</div>;
    if (!isAdmin && !isCoach) return <div className="p-8"><div className="bg-slate-900 border border-white/10 p-6">Activities available for admins/coaches.</div></div>;

    const isPageLoading = isActivitiesLoading || isGymLoading || (isAdmin && isUsersLoading);
    const pageError = gymError || activitiesError || (isAdmin && usersError);

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex justify-between gap-4">
                <div><h2 className="text-2xl font-bold">Activities</h2><p className="text-white/40 text-sm mt-1">{isAdmin ? `Manage ${gymName}` : 'Your classes'}</p></div>
                {isAdmin && <div className="flex gap-3"><button onClick={() => setCoachModal(state => ({...state, open: true}))} className="border border-white/10 text-xs font-bold uppercase px-4 py-3 hover:border-brand/40 text-white/70 hover:text-white">Add Coach</button><button onClick={() => setModal({ open: true, item: null })} className="bg-brand text-black text-xs font-bold uppercase px-4 py-3 hover:bg-white flex items-center gap-2"><Plus className="h-4 w-4" /> Add Activity</button></div>}
            </div>
            {pageError && <div className="p-4 bg-red-500/10 text-red-500 text-sm">{pageError}</div>}
            {isAdmin && (
                <div className="grid grid-cols-3 gap-4">
                    {[{ title: 'Halls', value: halls.length }, { title: 'Coaches', value: coachList.length }, { title: 'Activities', value: activities.length }].map(stat => <div key={stat.title} className="bg-slate-900 border border-white/10 p-4"><p className="text-[10px] uppercase text-white/40">{stat.title}</p><p className="text-2xl font-bold mt-2">{stat.value}</p></div>)}
                </div>
            )}
            {isPageLoading ? <div className="p-12 text-center text-white/40">Loading...</div> : !activities.length ? <div className="p-6 border border-white/10 text-white/40">No activities found.</div> : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activities.map(activity => {
                        const assignedHall = halls.find(hall => hall._id === activity.hallId), assignedCoach = typeof activity.coach === 'string' ? coachList.find(coach => coach._id === activity.coach) : activity.coach;
                        return (
                            <div key={activity._id} className="bg-slate-900 border border-white/10 p-6 flex flex-col gap-4">
                                <div className="flex justify-between"><div><h3 className="text-lg font-bold">{activity.name}</h3><p className="text-xs text-white/50">Hall: {assignedHall?.name || 'Unassigned'}</p></div>{isAdmin && <button onClick={() => setModal({ open: true, item: activity })} className="text-white/40 hover:text-brand"><Edit2 className="h-4 w-4" /></button>}</div>
                                <div className="grid grid-cols-2 gap-4 text-xs text-white/50"><div className="flex items-center gap-2"><Users className="h-4 w-4"/> Coach: {assignedCoach ? `${assignedCoach.firstName} ${assignedCoach.lastName}` : 'Unassigned'}</div><div className="flex items-center gap-2"><MapPin className="h-4 w-4"/> Cap: {assignedHall?.capacity ?? 'N/A'}</div></div>
                                <div className="flex justify-between text-xs text-white/60"><span>{activity.monthlyPrice} DH</span><span>Max: {activity.maxCapacity}</span></div>
                            </div>
                        );
                    })}
                </div>
            )}
            {isAdmin && <ActivityModal isOpen={modal.open} activity={modal.item} halls={halls} coaches={coachList} onClose={() => setModal({ open: false, item: null })} onSaved={() => setModal({ open: false, item: null })} />}
            {isAdmin && <CoachCreateModal isOpen={coachModal.open} values={coachModal.form} error={coachModal.errorState} isSubmitting={coachModal.isSubmitting} onChange={field => event => setCoachModal(state => ({ ...state, form: { ...state.form, [field]: event.target.value } }))} onClose={() => setCoachModal(state => ({ ...state, open: false, form: { firstName: '', lastName: '', email: '', password: '' }, errorState: null }))} onSubmit={submitCoach} />}
        </div>
    );
};
