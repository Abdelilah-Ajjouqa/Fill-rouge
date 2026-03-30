import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '../../../../store/store';
import { createMember, fetchMembersByGym } from '../../../../store/slices/membersSlice';
import { createUser, fetchUsers } from '../../../../store/slices/usersSlice';
import type { Gym } from '../../../../types/models';
import { CoachCreateModal } from '../../modals/CoachCreateModal';
import type { CoachFormState } from '../../modals/CoachCreateModal';
import { MemberCreateModal } from '../../modals/MemberCreateModal';
import type { MemberFormState } from '../../modals/MemberCreateModal';

type GymDetailsModalProps = {
    gym: Gym | null;
    isOpen: boolean;
    onClose: () => void;
};

const formatDate = (value?: string) => {
    if (!value) {
        return 'N/A';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'N/A';
    }
    return date.toLocaleDateString();
};

export const GymDetailsModal = ({ gym, isOpen, onClose }: GymDetailsModalProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, isLoading: usersLoading, error: usersError } = useSelector(
        (state: RootState) => state.users,
    );
    const { members, isLoading: membersLoading, error: membersError } = useSelector(
        (state: RootState) => state.members,
    );
    const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
    const [coachForm, setCoachForm] = useState<CoachFormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [coachError, setCoachError] = useState<string | null>(null);
    const [isCoachSubmitting, setIsCoachSubmitting] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [memberForm, setMemberForm] = useState<MemberFormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
    });
    const [memberError, setMemberError] = useState<string | null>(null);
    const [isMemberSubmitting, setIsMemberSubmitting] = useState(false);

    const isLoading = usersLoading || membersLoading;
    const error = usersError || membersError;

    const handleCoachChange = (field: keyof CoachFormState) => (event: ChangeEvent<HTMLInputElement>) => {
        setCoachForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleMemberChange = (field: keyof MemberFormState) => (event: ChangeEvent<HTMLInputElement>) => {
        setMemberForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const resetCoachForm = () => {
        setCoachForm({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        });
    };

    const resetMemberForm = () => {
        setMemberForm({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            dateOfBirth: '',
        });
    };

    useEffect(() => {
        if (!isOpen || !gym) {
            return;
        }

        dispatch(fetchUsers());
        dispatch(fetchMembersByGym(gym._id));
    }, [dispatch, gym, isOpen]);

    const staff = useMemo(() => {
        if (!gym) {
            return [];
        }

        return users.filter(
            (user) =>
                user.gymId === gym._id &&
                (user.role === 'ADMIN' || user.role === 'COACH')
        );
    }, [gym, users]);

    const gymMembers = useMemo(() => {
        if (!gym) {
            return [];
        }

        return members.filter((member) => member.gymId === gym._id);
    }, [gym, members]);

    const openCoachModal = () => {
        setCoachError(null);
        setIsCoachModalOpen(true);
    };

    const closeCoachModal = () => {
        setIsCoachModalOpen(false);
        setCoachError(null);
        resetCoachForm();
    };

    const openMemberModal = () => {
        setMemberError(null);
        setIsMemberModalOpen(true);
    };

    const closeMemberModal = () => {
        setIsMemberModalOpen(false);
        setMemberError(null);
        resetMemberForm();
    };

    const handleCreateCoach = async (event: FormEvent) => {
        event.preventDefault();
        if (!gym) {
            return;
        }

        setCoachError(null);

        if (!coachForm.firstName.trim() || !coachForm.lastName.trim() || !coachForm.email.trim() || !coachForm.password.trim()) {
            setCoachError('Please fill all required fields.');
            return;
        }

        setIsCoachSubmitting(true);
        try {
            await dispatch(createUser({
                firstName: coachForm.firstName.trim(),
                lastName: coachForm.lastName.trim(),
                email: coachForm.email.trim(),
                password: coachForm.password,
                role: 'COACH',
                gymId: gym._id,
            })).unwrap();
            toast.success('Coach created successfully.');
            closeCoachModal();
        } catch (err) {
            let message = 'Failed to create coach.';
            if (typeof err === 'string') {
                message = err;
            }
            setCoachError(message);
        } finally {
            setIsCoachSubmitting(false);
        }
    };

    const handleCreateMember = async (event: FormEvent) => {
        event.preventDefault();
        if (!gym) {
            return;
        }

        setMemberError(null);

        if (!memberForm.firstName.trim() || !memberForm.lastName.trim() || !memberForm.email.trim() || !memberForm.password.trim()) {
            setMemberError('Please fill all required fields.');
            return;
        }

        const payload = {
            firstName: memberForm.firstName.trim(),
            lastName: memberForm.lastName.trim(),
            email: memberForm.email.trim(),
            password: memberForm.password,
            gymId: gym._id,
        };

        if (memberForm.phone.trim()) {
            payload.phone = memberForm.phone.trim();
        }

        if (memberForm.dateOfBirth) {
            payload.dateOfBirth = memberForm.dateOfBirth;
        }

        setIsMemberSubmitting(true);
        try {
            await dispatch(createMember(payload)).unwrap();
            toast.success('Member created successfully.');
            closeMemberModal();
        } catch (err) {
            let message = 'Failed to create member.';
            if (typeof err === 'string') {
                message = err;
            }
            setMemberError(message);
        } finally {
            setIsMemberSubmitting(false);
        }
    };

    if (!isOpen || !gym) {
        return null;
    }

    const adminCount = staff.filter((user) => user.role === 'ADMIN').length;
    const coachCount = staff.filter((user) => user.role === 'COACH').length;
    const memberPreview = gymMembers.slice(0, 6);
    const hallCount = gym.halls?.length || 0;
    const hallPreview = gym.halls?.slice(0, 6) || [];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-4xl w-full relative animate-fade-in">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-2xl font-bold">{gym.name}</h3>
                        <p className="text-white/60 text-sm mt-1">Club details and activity overview.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-white/40">
                        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4"></div>
                        <p className="font-mono text-[10px] uppercase tracking-widest">Loading Club Data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <div className="bg-slate-950/60 border border-white/5 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-white/40">Basic info</p>
                                <div className="mt-3 space-y-2 text-sm">
                                    <div>
                                        <span className="text-white/40">Address</span>
                                        <p className="text-white/90">{gym.address}</p>
                                    </div>
                                    <div>
                                        <span className="text-white/40">Phone</span>
                                        <p className="text-white/90">{gym.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-white/40">Status</span>
                                        <p className={gym.isActive ? 'text-brand' : 'text-red-400'}>
                                            {gym.isActive ? 'Active' : 'Suspended'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-white/40">Created</span>
                                        <p className="text-white/90">{formatDate(gym.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-950/60 border border-white/5 p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Staff</p>
                                    <p className="text-2xl font-bold mt-2">{staff.length}</p>
                                    <p className="text-xs text-white/40">Admins: {adminCount} · Coaches: {coachCount}</p>
                                </div>
                                <div className="bg-slate-950/60 border border-white/5 p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Members</p>
                                    <p className="text-2xl font-bold mt-2">{gymMembers.length}</p>
                                    <p className="text-xs text-white/40">Active members linked</p>
                                </div>
                            </div>

                            <div className="bg-slate-950/60 border border-white/5 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-white/40">Halls</p>
                                <p className="text-2xl font-bold mt-2">{hallCount}</p>
                                <p className="text-xs text-white/40">Total rooms configured</p>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Staff</p>
                                    <button
                                        onClick={openCoachModal}
                                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 border border-white/10 text-white/60 hover:text-white hover:border-brand/40 transition-colors"
                                    >
                                        Add Coach
                                    </button>
                                </div>
                                {staff.length === 0 ? (
                                    <div className="p-4 border border-dashed border-white/10 text-white/40 text-sm">
                                        No staff assigned yet.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {staff.map((user) => (
                                            <div
                                                key={user._id}
                                                className="bg-slate-950/60 border border-white/5 p-4"
                                            >
                                                <p className="text-sm font-semibold text-white">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className="text-xs text-white/40 mt-1">{user.email}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-brand mt-3">
                                                    {user.role}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Members</p>
                                    <button
                                        onClick={openMemberModal}
                                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 border border-white/10 text-white/60 hover:text-white hover:border-brand/40 transition-colors"
                                    >
                                        Add Member
                                    </button>
                                </div>
                                {gymMembers.length === 0 ? (
                                    <div className="p-4 border border-dashed border-white/10 text-white/40 text-sm">
                                        No members found yet.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {memberPreview.map((member) => (
                                            <div
                                                key={member._id}
                                                className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-3"
                                            >
                                                <div>
                                                    <p className="text-sm text-white">
                                                        {member.firstName} {member.lastName}
                                                    </p>
                                                    <p className="text-xs text-white/40">{member.email}</p>
                                                </div>
                                                <span className="text-[10px] uppercase tracking-widest text-white/40">
                                                    {member.phone || 'No phone'}
                                                </span>
                                            </div>
                                        ))}
                                        {gymMembers.length > memberPreview.length && (
                                            <p className="text-xs text-white/40">
                                                +{gymMembers.length - memberPreview.length} more members
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Halls</p>
                                {hallCount === 0 ? (
                                    <div className="p-4 border border-dashed border-white/10 text-white/40 text-sm">
                                        No halls configured yet.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {hallPreview.map((hall) => (
                                            <div
                                                key={hall._id || hall.name}
                                                className="flex items-center justify-between bg-slate-950/60 border border-white/5 p-3"
                                            >
                                                <div>
                                                    <p className="text-sm text-white">{hall.name}</p>
                                                    <p className="text-xs text-white/40">{hall.type}</p>
                                                </div>
                                                <span className="text-[10px] uppercase tracking-widest text-white/40">
                                                    {hall.capacity} seats
                                                </span>
                                            </div>
                                        ))}
                                        {hallCount > hallPreview.length && (
                                            <p className="text-xs text-white/40">
                                                +{hallCount - hallPreview.length} more halls
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <CoachCreateModal
                isOpen={isCoachModalOpen}
                values={coachForm}
                error={coachError}
                isSubmitting={isCoachSubmitting}
                onChange={handleCoachChange}
                onClose={closeCoachModal}
                onSubmit={handleCreateCoach}
            />
            <MemberCreateModal
                isOpen={isMemberModalOpen}
                values={memberForm}
                error={memberError}
                isSubmitting={isMemberSubmitting}
                onChange={handleMemberChange}
                onClose={closeMemberModal}
                onSubmit={handleCreateMember}
            />
        </div>
    );
};
