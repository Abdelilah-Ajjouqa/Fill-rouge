import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteGym, fetchGyms } from '../../store/slices/gymsSlice';
import { Flame, PlusSquare, MapPin, Phone, Edit2, Trash2, Power, UserCog } from 'lucide-react';
import { GymForm } from './GymForm';
import type { AppDispatch, RootState } from '../../store/store';
import type { Gym } from '../../types/models';
import { clearStaff, fetchStaffByGym, updateStaff, type StaffRole } from '../../store/slices/staffSlice';
import { StaffForm } from './StaffForm';
import { toast } from 'sonner';

export const SuperAdminDashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { gyms, isLoading, error } = useSelector((state: RootState) => state.gyms);
    const {
        staff,
        isLoading: isStaffLoading,
        error: staffError,
        updatingIds,
    } = useSelector((state: RootState) => state.staff);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

    useEffect(() => {
        dispatch(fetchGyms());
    }, [dispatch]);

    useEffect(() => {
        if (isStaffModalOpen && selectedGym?._id) {
            dispatch(fetchStaffByGym(selectedGym._id));
        }
    }, [dispatch, isStaffModalOpen, selectedGym]);

    const handleSuccess = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedGym(null);
    };

    const closeStaffModal = () => {
        setIsStaffModalOpen(false);
        setSelectedGym(null);
        dispatch(clearStaff());
    };

    const handleRoleChange = async (
        memberId: string,
        currentRole: StaffRole,
        nextRole: StaffRole,
    ) => {
        if (currentRole === nextRole) return;

        const resultAction = await dispatch(updateStaff({ id: memberId, role: nextRole }));

        if (updateStaff.fulfilled.match(resultAction)) {
            toast.success(`Role updated to ${nextRole}`);
            return;
        }

        const message = typeof resultAction.payload === 'string'
            ? resultAction.payload
            : 'Failed to update role';
        toast.error(message);
    };

    const handleStatusToggle = async (member: { _id: string; firstName: string; lastName: string; isActive?: boolean }) => {
        const isCurrentlyActive = member.isActive !== false;

        if (isCurrentlyActive) {
            const confirmed = window.confirm(
                `Are you sure you want to deactivate ${member.firstName} ${member.lastName}?`,
            );
            if (!confirmed) return;
        }

        const resultAction = await dispatch(
            updateStaff({ id: member._id, isActive: !isCurrentlyActive }),
        );

        if (updateStaff.fulfilled.match(resultAction)) {
            toast.success(
                !isCurrentlyActive ? 'Staff member activated successfully' : 'Staff member deactivated successfully',
            );
            return;
        }

        const message = typeof resultAction.payload === 'string'
            ? resultAction.payload
            : 'Failed to update staff status';
        toast.error(message);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Active Clubs</h2>
                    <p className="text-white/40 text-sm mt-1">Manage all registered gyms on the platform</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="club-grid">

                {isLoading && gyms.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-white/40">
                        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4"></div>
                        <p className="font-mono text-[10px] uppercase tracking-widest">Fetching Gyms...</p>
                    </div>
                ) : (
                    gyms.map((gym: Gym, index: number) => (
                        <article
                            key={gym._id}
                            className="bg-slate-900 border border-white/10 p-6 flex flex-col justify-between group hover:border-brand/40 transition-colors animate-fade-in"
                            style={{ animationDelay: `${(index + 1) * 100}ms` }}
                        >
                            <div className="mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold tracking-tight truncate pr-4" title={gym.name}>{gym.name}</h3>
                                    <span className="bg-white/5 p-2 border border-white/10 text-brand shrink-0">
                                        {gym.logo ? (
                                            <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${gym.logo}`} alt="Logo" className="h-5 w-5 object-cover" />
                                        ) : (
                                            <Flame className="h-5 w-5" />
                                        )}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-2 text-white/60">
                                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                        <p className="text-xs">{gym.address}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/60">
                                        <Phone className="h-4 w-4 shrink-0" />
                                        <p className="text-xs font-mono">{gym.phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                        <span className="text-white/60">Platform Status</span>
                                        <span className={gym.isActive ? "text-brand" : "text-red-400"}>
                                            {gym.isActive ? "ACTIVE" : "SUSPENDED"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedGym(gym);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-white/5 text-white/40 hover:text-brand transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete ${gym.name}?`)) {
                                                dispatch(deleteGym(gym._id));
                                            }
                                        }}
                                        className="p-2 hover:bg-white/5 text-white/40 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedGym(gym);
                                        setIsStaffModalOpen(true);
                                    }}
                                    className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors"
                                >
                                    Manage Admins
                                </button>
                            </div>
                        </article>
                    ))
                )}

                {/* Add New Club Button */}
                {!isLoading && (
                    <button
                        onClick={() => {
                            setSelectedGym(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-4 text-white/20 hover:text-brand hover:border-brand/40 transition-all hover:bg-white/2 animate-fade-in"
                        style={{ animationDelay: `${(gyms.length + 1) * 100}ms` }}
                    >
                        <PlusSquare className="h-10 w-10" />
                        <span className="text-xs font-bold uppercase tracking-widest">Register New Club</span>
                    </button>
                )}
            </div>

            {/* Create Gym Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">Register New Gym</h3>
                        <p className="text-white/60 text-sm mb-6">Enter the facility details below to add it to the platform.</p>

                        <GymForm
                            onSuccess={handleSuccess}
                            onCancel={() => {
                                setIsCreateModalOpen(false);
                                setSelectedGym(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Edit Gym Modal */}
            {isEditModalOpen && selectedGym && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">Edit Gym</h3>
                        <p className="text-white/60 text-sm mb-6">Update the facility details below.</p>

                        <GymForm
                            gym={selectedGym}
                            onSuccess={handleSuccess}
                            onCancel={() => {
                                setIsEditModalOpen(false);
                                setSelectedGym(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Manage Staff Modal */}
            {isStaffModalOpen && selectedGym && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-3xl w-full relative animate-fade-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold">Manage Admins</h3>
                                <p className="text-white/60 text-sm mt-1">
                                    Staff accounts for <span className="text-white font-semibold">{selectedGym.name}</span>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeStaffModal}
                                className="bg-white/5 text-white/70 px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>

                        {staffError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                {staffError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <section className="border border-white/10 bg-slate-950/50 p-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">
                                    Current Staff
                                </h4>

                                {isStaffLoading ? (
                                    <div className="flex items-center gap-3 text-white/40 text-xs">
                                        <div className="h-4 w-4 rounded-full border-2 border-brand border-t-transparent animate-spin"></div>
                                        Loading staff...
                                    </div>
                                ) : staff.length === 0 ? (
                                    <p className="text-white/40 text-xs">
                                        No admins or coaches found for this gym yet.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {staff.map((member) => (
                                            <div key={member._id} className="border border-white/10 bg-slate-950 p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">
                                                            {member.firstName} {member.lastName}
                                                        </p>
                                                        <p className="text-xs text-white/50">{member.email}</p>
                                                    </div>
                                                    <span
                                                        className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-1 ${member.isActive === false
                                                            ? 'text-red-300 bg-red-500/10 border-red-500/30'
                                                            : 'text-brand bg-brand/10 border-brand/30'}`}
                                                    >
                                                        {member.isActive === false ? 'INACTIVE' : 'ACTIVE'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/5">
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                                            Role
                                                        </label>
                                                        <div className="relative">
                                                            <UserCog className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                            <select
                                                                value={member.role}
                                                                onChange={(e) => handleRoleChange(
                                                                    member._id,
                                                                    member.role,
                                                                    e.target.value as StaffRole,
                                                                )}
                                                                disabled={updatingIds.includes(member._id)}
                                                                className="w-full bg-slate-950 border border-white/10 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
                                                            >
                                                                <option value="ADMIN">ADMIN</option>
                                                                <option value="COACH">COACH</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                                            Status
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusToggle(member)}
                                                            disabled={updatingIds.includes(member._id)}
                                                            className={`w-full flex items-center justify-center gap-2 border py-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${member.isActive === false
                                                                ? 'border-brand/40 text-brand hover:bg-brand/10'
                                                                : 'border-red-500/40 text-red-300 hover:bg-red-500/10'}`}
                                                        >
                                                            <Power className="h-3.5 w-3.5" />
                                                            {member.isActive === false ? 'Activate' : 'Deactivate'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="border border-white/10 bg-slate-950/50 p-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">
                                    Create Staff
                                </h4>

                                <StaffForm
                                    gymId={selectedGym._id}
                                    onCreated={() => {
                                        dispatch(fetchStaffByGym(selectedGym._id));
                                    }}
                                />
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
