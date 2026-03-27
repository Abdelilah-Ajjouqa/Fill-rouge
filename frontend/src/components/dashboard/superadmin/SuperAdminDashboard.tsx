import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteGym, fetchGyms } from '../../../store/slices/gymsSlice';
import { PlusSquare } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store/store';
import type { Gym } from '../../../types/models';
import { clearStaff, fetchStaffByGym, updateStaff, type StaffRole, type StaffUser } from '../../../store/slices/staffSlice';
import { toast } from 'sonner';
import { GymCard } from './GymCard';
import { GymEditorModal } from './GymEditorModal';
import { StaffManagementModal } from './StaffManagementModal';

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

    const mapStaffErrorMessage = (message: string) => {
        if (message === 'This gym already has an ADMIN') {
            return 'This gym already has one admin. Replace the current admin first.';
        }

        return message;
    };

    const handleRoleChange = async (
        memberId: string,
        currentRole: StaffRole,
        nextRole: StaffRole,
    ) => {
        if (currentRole === nextRole) return;

        if (nextRole === 'ADMIN') {
            const currentAdmin = staff.find((member) => member.role === 'ADMIN');

            if (currentAdmin && currentAdmin._id !== memberId) {
                const confirmed = window.confirm(
                    `This gym already has ADMIN (${currentAdmin.firstName} ${currentAdmin.lastName}). Replace with selected staff member?`,
                );

                if (!confirmed) {
                    return;
                }

                const demoteAction = await dispatch(
                    updateStaff({ id: currentAdmin._id, role: 'COACH' }),
                );

                if (!updateStaff.fulfilled.match(demoteAction)) {
                    const demoteMessage = typeof demoteAction.payload === 'string'
                        ? demoteAction.payload
                        : 'Failed to demote current admin';
                    toast.error(mapStaffErrorMessage(demoteMessage));
                    return;
                }
            }
        }

        const resultAction = await dispatch(updateStaff({ id: memberId, role: nextRole }));

        if (updateStaff.fulfilled.match(resultAction)) {
            toast.success(`Role updated to ${nextRole}`);
            return;
        }

        const message = typeof resultAction.payload === 'string'
            ? resultAction.payload
            : 'Failed to update role';
        toast.error(mapStaffErrorMessage(message));
    };

    const handleStatusToggle = async (member: StaffUser) => {
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
        toast.error(mapStaffErrorMessage(message));
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
                        <GymCard
                            key={gym._id}
                            gym={gym}
                            index={index}
                            onEdit={(targetGym) => {
                                setSelectedGym(targetGym);
                                setIsEditModalOpen(true);
                            }}
                            onDelete={(targetGym) => {
                                if (window.confirm(`Are you sure you want to delete ${targetGym.name}?`)) {
                                    dispatch(deleteGym(targetGym._id));
                                }
                            }}
                            onManageStaff={(targetGym) => {
                                setSelectedGym(targetGym);
                                setIsStaffModalOpen(true);
                            }}
                        />
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

            <GymEditorModal
                isOpen={isCreateModalOpen}
                title="Register New Gym"
                description="Enter the facility details below to add it to the platform."
                onSuccess={handleSuccess}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedGym(null);
                }}
            />

            <GymEditorModal
                isOpen={isEditModalOpen && !!selectedGym}
                title="Edit Gym"
                description="Update the facility details below."
                gym={selectedGym ?? undefined}
                onSuccess={handleSuccess}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedGym(null);
                }}
            />

            <StaffManagementModal
                isOpen={isStaffModalOpen}
                gym={selectedGym}
                staff={staff}
                isLoading={isStaffLoading}
                error={staffError}
                updatingIds={updatingIds}
                onClose={closeStaffModal}
                onRoleChange={handleRoleChange}
                onStatusToggle={handleStatusToggle}
                onCreated={() => {
                    if (selectedGym?._id) {
                        dispatch(fetchStaffByGym(selectedGym._id));
                    }
                }}
            />
        </div>
    );
};
