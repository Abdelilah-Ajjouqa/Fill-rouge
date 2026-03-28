import { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import api from '../../../../api/axios';
import type { Gym, Member } from '../../../../types/models';
import type { User } from '../../../../types/auth';

type GymDetailsModalProps = {
    gym: Gym | null;
    isOpen: boolean;
    onClose: () => void;
};

type GymDetails = {
    staff: User[];
    members: Member[];
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
    const [details, setDetails] = useState<GymDetails>({ staff: [], members: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !gym) {
            return;
        }

        let isActive = true;

        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [usersResponse, membersResponse] = await Promise.all([
                    api.get<User[]>('/users'),
                    api.get<Member[]>('/members', { params: { gymId: gym._id } }),
                ]);

                if (!isActive) {
                    return;
                }

                const staff = usersResponse.data.filter(
                    (user) =>
                        user.gymId === gym._id &&
                        (user.role === 'ADMIN' || user.role === 'COACH')
                );

                setDetails({ staff, members: membersResponse.data });
            } catch (err) {
                if (!isActive) {
                    return;
                }

                let message = 'Failed to load club details.';
                if (axios.isAxiosError(err)) {
                    message = err.response?.data?.message || message;
                }

                setError(message);
                setDetails({ staff: [], members: [] });
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchDetails();

        return () => {
            isActive = false;
        };
    }, [gym, isOpen]);

    if (!isOpen || !gym) {
        return null;
    }

    const adminCount = details.staff.filter((user) => user.role === 'ADMIN').length;
    const coachCount = details.staff.filter((user) => user.role === 'COACH').length;
    const memberPreview = details.members.slice(0, 6);

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
                                    <p className="text-2xl font-bold mt-2">{details.staff.length}</p>
                                    <p className="text-xs text-white/40">Admins: {adminCount} · Coaches: {coachCount}</p>
                                </div>
                                <div className="bg-slate-950/60 border border-white/5 p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Members</p>
                                    <p className="text-2xl font-bold mt-2">{details.members.length}</p>
                                    <p className="text-xs text-white/40">Active members linked</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Staff</p>
                                {details.staff.length === 0 ? (
                                    <div className="p-4 border border-dashed border-white/10 text-white/40 text-sm">
                                        No staff assigned yet.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {details.staff.map((user) => (
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
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Members</p>
                                {details.members.length === 0 ? (
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
                                        {details.members.length > memberPreview.length && (
                                            <p className="text-xs text-white/40">
                                                +{details.members.length - memberPreview.length} more members
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
