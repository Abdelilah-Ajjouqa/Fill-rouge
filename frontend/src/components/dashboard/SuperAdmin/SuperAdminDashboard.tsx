import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteGym, fetchGyms } from '../../../store/slices/gymsSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import type { Gym } from '../../../types/models';
import { EditBtn } from './Helpers/Edit-btn';
import { AddNewClubBtn } from './Helpers/AddNewClub-btn';
import { GymCard } from './Helpers/GymCard';
import { CreateGymModal } from './Helpers/CreateGymModal';

export const SuperAdminDashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { gyms, isLoading, error } = useSelector((state: RootState) => state.gyms);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

    useEffect(() => {
        dispatch(fetchGyms());
    }, [dispatch]);

    const handleSuccess = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedGym(null);
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
                            animationDelayMs={(index + 1) * 100}
                            onEdit={(selected) => {
                                setSelectedGym(selected);
                                setIsEditModalOpen(true);
                            }}
                            onDelete={(gymId) => dispatch(deleteGym(gymId))}
                        />
                    ))
                )}

                {/* Add New Club Button */}
                {!isLoading && (
                    <AddNewClubBtn
                        onClick={() => {
                            setSelectedGym(null);
                            setIsCreateModalOpen(true);
                        }}
                        animationDelayMs={(gyms.length + 1) * 100}
                    />
                )}
            </div>

            {/* Create Gym Modal */}
            <CreateGymModal
                isOpen={isCreateModalOpen}
                onSuccess={handleSuccess}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedGym(null);
                }}
            />

            {/* Edit Gym Modal */}
            <EditBtn
                isOpen={isEditModalOpen}
                selectedGym={selectedGym}
                onSuccess={handleSuccess}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedGym(null);
                }}
            />
        </div>
    );
};
