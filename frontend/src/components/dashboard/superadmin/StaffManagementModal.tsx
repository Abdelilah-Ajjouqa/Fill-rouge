import { StaffForm } from './StaffForm';
import { StaffMemberCard } from './StaffMemberCard';
import type { Gym } from '../../../types/models';
import type { StaffRole, StaffUser } from '../../../store/slices/staffSlice';

interface StaffManagementModalProps {
    isOpen: boolean;
    gym: Gym | null;
    staff: StaffUser[];
    isLoading: boolean;
    error: string | null;
    updatingIds: string[];
    onClose: () => void;
    onRoleChange: (memberId: string, currentRole: StaffRole, nextRole: StaffRole) => void;
    onStatusToggle: (member: StaffUser) => void;
    onCreated: () => void;
}

export const StaffManagementModal = ({
    isOpen,
    gym,
    staff,
    isLoading,
    error,
    updatingIds,
    onClose,
    onRoleChange,
    onStatusToggle,
    onCreated,
}: StaffManagementModalProps) => {
    if (!isOpen || !gym) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-3xl w-full relative animate-fade-in max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold">Manage Admins</h3>
                        <p className="text-white/60 text-sm mt-1">
                            Staff accounts for <span className="text-white font-semibold">{gym.name}</span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white/5 text-white/70 px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                    >
                        Close
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="border border-white/10 bg-slate-950/50 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">
                            Current Staff
                        </h4>

                        {isLoading ? (
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
                                    <StaffMemberCard
                                        key={member._id}
                                        member={member}
                                        isUpdating={updatingIds.includes(member._id)}
                                        onRoleChange={onRoleChange}
                                        onStatusToggle={onStatusToggle}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="border border-white/10 bg-slate-950/50 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">
                            Create Staff
                        </h4>

                        <StaffForm gymId={gym._id} onCreated={onCreated} />
                    </section>
                </div>
            </div>
        </div>
    );
};