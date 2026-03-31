import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '../../../../store/store';
import type { MemberInput } from '../../../../store/interfaces';
import { createMember, fetchMembersByGym } from '../../../../store/slices/membersSlice';
import { createUser, fetchUsers, deleteUser, updateUser } from '../../../../store/slices/usersSlice';
import type { Gym } from '../../../../types/models';
import { CoachCreateModal, type CoachFormState } from '../../modals/CoachCreateModal';
import { MemberCreateModal, type MemberFormState } from '../../modals/MemberCreateModal';
import { GymAdminEditModal } from './GymAdminEditModal';
import type { GymAdminEditFormState } from '../../../../types/super-admin';

const formatDate = (dateString?: string) => dateString && !Number.isNaN(new Date(dateString).getTime()) ? new Date(dateString).toLocaleDateString() : 'N/A';
const initCoach = { firstName: '', lastName: '', email: '', password: '' };
const initMember = { firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: '' };

export const GymDetailsModal = ({ gym, isOpen, onClose }: { gym: Gym | null; isOpen: boolean; onClose: () => void; }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, isLoading: usersLoading, error: usersError } = useSelector((state: RootState) => state.users);
    const { members, isLoading: membersLoading, error: membersError } = useSelector((state: RootState) => state.members);
    
    const [coachModalOpen, setCoachModalOpen] = useState(false);
    const [coachForm, setCoachForm] = useState<CoachFormState>(initCoach);
    const [coachError, setCoachError] = useState<string | null>(null);
    const [isCoachSubmitting, setIsCoachSubmitting] = useState(false);
    
    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [memberForm, setMemberForm] = useState<MemberFormState>(initMember);
    const [memberError, setMemberError] = useState<string | null>(null);
    const [isMemberSubmitting, setIsMemberSubmitting] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<GymAdminEditFormState>({ firstName: '', lastName: '', email: '', password: '' });
    const [editError, setEditError] = useState<string | null>(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);

    const isLoading = usersLoading || membersLoading;
    const error = usersError || membersError;

    useEffect(() => {
        if (!isOpen || !gym) return;
        dispatch(fetchUsers()); dispatch(fetchMembersByGym(gym._id));
    }, [dispatch, gym, isOpen]);

    const staff = useMemo(() => gym ? users.filter(user => user.gymId === gym._id && ['ADMIN', 'COACH'].includes(user.role || '')) : [], [gym, users]);
    const gymMembers = useMemo(() => gym ? members.filter(member => member.gymId === gym._id) : [], [gym, members]);

    const closeCoach = () => { setCoachModalOpen(false); setCoachError(null); setCoachForm(initCoach); };
    const closeMember = () => { setMemberModalOpen(false); setMemberError(null); setMemberForm(initMember); };
    const closeEdit = () => { setEditModalOpen(false); setEditTarget(null); setEditForm({ firstName: '', lastName: '', email: '', password: '' }); };

    const openEdit = (user: any) => { setEditTarget(user._id); setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '' }); setEditError(null); setEditModalOpen(true); };

    const handleCoachSubmit = async (event: FormEvent) => {
        event.preventDefault(); if (!gym) return;
        if (!coachForm.firstName.trim() || !coachForm.lastName.trim() || !coachForm.email.trim() || !coachForm.password.trim()) return setCoachError('Please fill all required fields.');
        
        setCoachError(null); setIsCoachSubmitting(true);
        try {
            await dispatch(createUser({ firstName: coachForm.firstName.trim(), lastName: coachForm.lastName.trim(), email: coachForm.email.trim(), password: coachForm.password, role: 'COACH', gymId: gym._id })).unwrap();
            toast.success('Coach created successfully.'); closeCoach();
        } catch (error: any) { setCoachError(typeof error === 'string' ? error : 'Failed to create coach.'); }
        finally { setIsCoachSubmitting(false); }
    };

    const handleMemberSubmit = async (event: FormEvent) => {
        event.preventDefault(); if (!gym) return;
        if (!memberForm.firstName.trim() || !memberForm.lastName.trim() || !memberForm.email.trim() || !memberForm.password.trim()) return setMemberError('Please fill all required fields.');
        
        setMemberError(null); setIsMemberSubmitting(true);
        try {
            const payload: MemberInput = { firstName: memberForm.firstName.trim(), lastName: memberForm.lastName.trim(), email: memberForm.email.trim(), password: memberForm.password, gymId: gym._id };
            if (memberForm.phone.trim()) payload.phone = memberForm.phone.trim();
            if (memberForm.dateOfBirth) payload.dateOfBirth = memberForm.dateOfBirth;
            
            await dispatch(createMember(payload)).unwrap();
            toast.success('Member created successfully.'); closeMember();
        } catch (error: any) { setMemberError(typeof error === 'string' ? error : 'Failed to create member.'); }
        finally { setIsMemberSubmitting(false); }
    };

    const handleEditSubmit = async (event: FormEvent) => {
        event.preventDefault(); if (!editTarget) return;
        setEditError(null); setIsEditSubmitting(true);
        try {
            const payload: any = { firstName: editForm.firstName.trim(), lastName: editForm.lastName.trim(), email: editForm.email.trim() };
            if (editForm.password.trim()) payload.password = editForm.password;
            await dispatch(updateUser({ id: editTarget, data: payload })).unwrap();
            toast.success('Staff updated successfully.'); closeEdit();
        } catch (error: any) { setEditError(typeof error === 'string' ? error : 'Failed to update user.'); }
        finally { setIsEditSubmitting(false); }
    };

    const handleDeleteStaff = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await dispatch(deleteUser(userId)).unwrap();
            toast.success('Staff member removed.');
        } catch (error: any) { toast.error(typeof error === 'string' ? error : 'Failed to remove staff.'); }
    };

    if (!isOpen || !gym) return null;

    const admins = staff.filter(user => user.role === 'ADMIN').length;
    const coaches = staff.filter(user => user.role === 'COACH').length;
    const memberPreview = gymMembers.slice(0, 6);
    const hallCount = gym.halls?.length || 0;
    const hallPreview = gym.halls?.slice(0, 6) || [];

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
                                    {[['Address', gym.address], ['Phone', gym.phone], ['Status', <span key="status" className={gym.isActive ? 'text-brand' : 'text-red-400'}>{gym.isActive ? 'Active' : 'Suspended'}</span>], ['Created', formatDate(gym.createdAt)]].map(([label, value], index) => (
                                        <div key={index}><span className="text-white/40 mr-2">{label as string}</span><p className="text-white/90 inline">{value as React.ReactNode}</p></div>
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
                                <SectionHeader title="Staff" action="Add Coach" onAction={() => { setCoachError(null); setCoachModalOpen(true); }} />
                                {!staff.length ? <Empty msg="No staff assigned yet." /> : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {staff.map(user => (
                                            <div key={user._id} className="bg-slate-950/60 border border-white/5 p-4 flex justify-between items-start group">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs text-white/40 mt-1">{user.email}</p><p className="text-[10px] uppercase tracking-widest text-brand mt-3">{user.role}</p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(user)} className="p-1 text-white/40 hover:text-brand transition-colors"><Edit2 className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDeleteStaff(user._id)} className="p-1 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <SectionHeader title="Members" action="Add Member" onAction={() => { setMemberError(null); setMemberModalOpen(true); }} />
                                {!gymMembers.length ? <Empty msg="No members found yet." /> : (
                                    <div className="space-y-2">
                                        {memberPreview.map(member => (
                                            <div key={member._id} className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-3">
                                                <div><p className="text-sm text-white">{member.firstName} {member.lastName}</p><p className="text-xs text-white/40">{member.email}</p></div>
                                                <span className="text-[10px] uppercase tracking-widest text-white/40">{member.phone || 'No phone'}</span>
                                            </div>
                                        ))}
                                        {gymMembers.length > memberPreview.length && <p className="text-xs text-white/40">+{gymMembers.length - memberPreview.length} more members</p>}
                                    </div>
                                )}
                            </div>

                            <div>
                                <SectionHeader title="Halls" />
                                {!hallCount ? <Empty msg="No halls configured yet." /> : (
                                    <div className="space-y-2">
                                        {hallPreview.map(hall => (
                                            <div key={hall._id || hall.name} className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-3">
                                                <div><p className="text-sm text-white">{hall.name}</p><p className="text-xs text-white/40">{hall.type}</p></div>
                                                <span className="text-[10px] uppercase tracking-widest text-white/40">{hall.capacity} seats</span>
                                            </div>
                                        ))}
                                        {hallCount > hallPreview.length && <p className="text-xs text-white/40">+{hallCount - hallPreview.length} more halls</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CoachCreateModal isOpen={coachModalOpen} values={coachForm} error={coachError} isSubmitting={isCoachSubmitting} onChange={(field) => (event) => setCoachForm(prev => ({ ...prev, [field]: event.target.value }))} onClose={closeCoach} onSubmit={handleCoachSubmit} />
            <MemberCreateModal isOpen={memberModalOpen} values={memberForm} error={memberError} isSubmitting={isMemberSubmitting} onChange={(field) => (event) => setMemberForm(prev => ({ ...prev, [field]: event.target.value }))} onClose={closeMember} onSubmit={handleMemberSubmit} />
            <GymAdminEditModal isOpen={editModalOpen} values={editForm} error={editError} isSubmitting={isEditSubmitting} onChange={(field) => (event) => setEditForm(prev => ({ ...prev, [field]: event.target.value }))} onClose={closeEdit} onSubmit={handleEditSubmit} />
        </div>
    );
};
