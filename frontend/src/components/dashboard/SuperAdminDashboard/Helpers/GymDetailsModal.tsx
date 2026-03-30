import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '../../../../store/store';
import type { MemberInput } from '../../../../store/interfaces';
import { createMember, fetchMembersByGym } from '../../../../store/slices/membersSlice';
import { createUser, fetchUsers } from '../../../../store/slices/usersSlice';
import type { Gym } from '../../../../types/models';
import { CoachCreateModal, type CoachFormState } from '../../modals/CoachCreateModal';
import { MemberCreateModal, type MemberFormState } from '../../modals/MemberCreateModal';

const formatDate = (v?: string) => v && !Number.isNaN(new Date(v).getTime()) ? new Date(v).toLocaleDateString() : 'N/A';
const initCoach = { firstName: '', lastName: '', email: '', password: '' };
const initMember = { firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: '' };

export const GymDetailsModal = ({ gym, isOpen, onClose }: { gym: Gym | null; isOpen: boolean; onClose: () => void; }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, isLoading: usersLoading, error: usersError } = useSelector((s: RootState) => s.users);
    const { members, isLoading: membersLoading, error: membersError } = useSelector((s: RootState) => s.members);

    const [cModal, setCModal] = useState(false);
    const [cForm, setCForm] = useState<CoachFormState>(initCoach);
    const [cErr, setCErr] = useState<string | null>(null);
    const [cSubmitting, setCSubmitting] = useState(false);

    const [mModal, setMModal] = useState(false);
    const [mForm, setMForm] = useState<MemberFormState>(initMember);
    const [mErr, setMErr] = useState<string | null>(null);
    const [mSubmitting, setMSubmitting] = useState(false);

    const isLoading = usersLoading || membersLoading;
    const error = usersError || membersError;

    useEffect(() => {
        if (!isOpen || !gym) return;
        dispatch(fetchUsers()); dispatch(fetchMembersByGym(gym._id));
    }, [dispatch, gym, isOpen]);

    const staff = useMemo(() => gym ? users.filter(u => u.gymId === gym._id && ['ADMIN', 'COACH'].includes(u.role || '')) : [], [gym, users]);
    const gymMembers = useMemo(() => gym ? members.filter(m => m.gymId === gym._id) : [], [gym, members]);

    const closeCoach = () => { setCModal(false); setCErr(null); setCForm(initCoach); };
    const closeMember = () => { setMModal(false); setMErr(null); setMForm(initMember); };

    const handleCoachSubmit = async (e: FormEvent) => {
        e.preventDefault(); if (!gym) return;
        if (!cForm.firstName.trim() || !cForm.lastName.trim() || !cForm.email.trim() || !cForm.password.trim()) return setCErr('Please fill all required fields.');

        setCErr(null); setCSubmitting(true);
        try {
            await dispatch(createUser({ firstName: cForm.firstName.trim(), lastName: cForm.lastName.trim(), email: cForm.email.trim(), password: cForm.password, role: 'COACH', gymId: gym._id })).unwrap();
            toast.success('Coach created successfully.'); closeCoach();
        } catch (err: any) {
            setCErr(typeof err === 'string' ? err : 'Failed to create coach.');
        }
        finally { setCSubmitting(false); }
    };

    const handleMemberSubmit = async (e: FormEvent) => {
        e.preventDefault(); if (!gym) return;
        if (!mForm.firstName.trim() || !mForm.lastName.trim() || !mForm.email.trim() || !mForm.password.trim()) return setMErr('Please fill all required fields.');

        setMErr(null); setMSubmitting(true);
        try {
            const payload: MemberInput = { firstName: mForm.firstName.trim(), lastName: mForm.lastName.trim(), email: mForm.email.trim(), password: mForm.password, gymId: gym._id };
            if (mForm.phone.trim()) payload.phone = mForm.phone.trim();
            if (mForm.dateOfBirth) payload.dateOfBirth = mForm.dateOfBirth;

            await dispatch(createMember(payload)).unwrap();
            toast.success('Member created successfully.'); closeMember();
        } catch (err: any) {
            setMErr(typeof err === 'string' ? err : 'Failed to create member.');
        }
        finally { setMSubmitting(false); }
    };

    if (!isOpen || !gym) return null;

    const admins = staff.filter(u => u.role === 'ADMIN').length;
    const coaches = staff.filter(u => u.role === 'COACH').length;
    const mPreview = gymMembers.slice(0, 6);
    const hallCount = gym.halls?.length || 0;
    const hPreview = gym.halls?.slice(0, 6) || [];

    const Empty = ({ msg }: { msg: string }) => <div className="p-4 border border-dashed border-white/10 text-white/40 text-sm">{msg}</div>;
    const SectionHeader = ({ title, action, onAction }: any) => (
        <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-white/40">{title}</p>
            {action && <button onClick={onAction} className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 border border-white/10 text-white/60 hover:text-white hover:border-brand/40 transition-colors">{action}</button>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-4xl w-full relative animate-fade-in">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div><h3 className="text-2xl font-bold">{gym.name}</h3><p className="text-white/60 text-sm mt-1">Club details and activity overview.</p></div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 text-white/60 hover:text-white transition-colors" aria-label="Close"><X className="h-5 w-5" /></button>
                </div>

                {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">{error}</div>}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-white/40"><div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4" /><p className="font-mono text-[10px] uppercase tracking-widest">Loading Club Data...</p></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <div className="bg-slate-950/60 border border-white/5 p-4 text-sm">
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Basic info</p>
                                <div className="space-y-2">
                                    {[['Address', gym.address], ['Phone', gym.phone], ['Status', <span key="status" className={gym.isActive ? 'text-brand' : 'text-red-400'}>{gym.isActive ? 'Active' : 'Suspended'}</span>], ['Created', formatDate(gym.createdAt)]].map(([l, v], i) => (
                                        <div key={i}><span className="text-white/40 mr-2">{l as string}</span><p className="text-white/90 inline">{v as React.ReactNode}</p></div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-950/60 border border-white/5 p-4"><p className="text-[10px] uppercase tracking-widest text-white/40">Staff</p><p className="text-2xl font-bold mt-2">{staff.length}</p><p className="text-xs text-white/40">Admins: {admins} · Coaches: {coaches}</p></div>
                                <div className="bg-slate-950/60 border border-white/5 p-4"><p className="text-[10px] uppercase tracking-widest text-white/40">Members</p><p className="text-2xl font-bold mt-2">{gymMembers.length}</p><p className="text-xs text-white/40">Active members linked</p></div>
                            </div>
                            <div className="bg-slate-950/60 border border-white/5 p-4"><p className="text-[10px] uppercase tracking-widest text-white/40">Halls</p><p className="text-2xl font-bold mt-2">{hallCount}</p><p className="text-xs text-white/40">Total rooms configured</p></div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <SectionHeader title="Staff" action="Add Coach" onAction={() => { setCErr(null); setCModal(true); }} />
                                {!staff.length ? <Empty msg="No staff assigned yet." /> : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {staff.map(u => (
                                            <div key={u._id} className="bg-slate-950/60 border border-white/5 p-4">
                                                <p className="text-sm font-semibold text-white">{u.firstName} {u.lastName}</p>
                                                <p className="text-xs text-white/40 mt-1">{u.email}</p><p className="text-[10px] uppercase tracking-widest text-brand mt-3">{u.role}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <SectionHeader title="Members" action="Add Member" onAction={() => { setMErr(null); setMModal(true); }} />
                                {!gymMembers.length ? <Empty msg="No members found yet." /> : (
                                    <div className="space-y-2">
                                        {mPreview.map(m => (
                                            <div key={m._id} className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-3">
                                                <div><p className="text-sm text-white">{m.firstName} {m.lastName}</p><p className="text-xs text-white/40">{m.email}</p></div>
                                                <span className="text-[10px] uppercase tracking-widest text-white/40">{m.phone || 'No phone'}</span>
                                            </div>
                                        ))}
                                        {gymMembers.length > mPreview.length && <p className="text-xs text-white/40">+{gymMembers.length - mPreview.length} more members</p>}
                                    </div>
                                )}
                            </div>

                            <div>
                                <SectionHeader title="Halls" />
                                {!hallCount ? <Empty msg="No halls configured yet." /> : (
                                    <div className="space-y-2">
                                        {hPreview.map(h => (
                                            <div key={h._id || h.name} className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-3">
                                                <div><p className="text-sm text-white">{h.name}</p><p className="text-xs text-white/40">{h.type}</p></div>
                                                <span className="text-[10px] uppercase tracking-widest text-white/40">{h.capacity} seats</span>
                                            </div>
                                        ))}
                                        {hallCount > hPreview.length && <p className="text-xs text-white/40">+{hallCount - hPreview.length} more halls</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CoachCreateModal isOpen={cModal} values={cForm} error={cErr} isSubmitting={cSubmitting} onChange={(f) => (e) => setCForm(p => ({ ...p, [f]: e.target.value }))} onClose={closeCoach} onSubmit={handleCoachSubmit} />
            <MemberCreateModal isOpen={mModal} values={mForm} error={mErr} isSubmitting={mSubmitting} onChange={(f) => (e) => setMForm(p => ({ ...p, [f]: e.target.value }))} onClose={closeMember} onSubmit={handleMemberSubmit} />
        </div>
    );
};
