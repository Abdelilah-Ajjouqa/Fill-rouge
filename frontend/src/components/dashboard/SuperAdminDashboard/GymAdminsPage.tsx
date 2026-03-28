import { useNavigate, useParams } from 'react-router-dom';
import { GymAdminListSection } from './Helpers/GymAdminListSection';
import { GymAdminCreateModal } from './Helpers/GymAdminCreateModal';
import { GymAdminEditModal } from './Helpers/GymAdminEditModal';
import { useGymAdminActions } from './hooks/useGymAdminActions';
import { useGymAdmins } from './hooks/useGymAdmins';

export const GymAdminsPage = () => {
    const { gymId } = useParams();
    const navigate = useNavigate();
    const { admins, setAdmins, isLoading, error } = useGymAdmins(gymId);
    const {
        hasAdmin,
        isCreateModalOpen,
        isEditModalOpen,
        isSubmitting,
        isUpdating,
        isToggling,
        isDeleting,
        formError,
        editError,
        formValues,
        editValues,
        editingAdmin,
        openCreateModal,
        closeCreateModal,
        openEditModal,
        closeEditModal,
        handleInputChange,
        handleEditChange,
        handleCreateAdmin,
        handleUpdateAdmin,
        handleToggleActive,
        handleDeleteAdmin,
    } = useGymAdminActions({ gymId, admins, setAdmins });

    return (
        <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gym Admin</h2>
                    <p className="text-white/40 text-sm mt-1">
                        Manage the admin for gym {gymId ? gymId.slice(-6) : 'Unknown'}
                    </p>
                    <p className="text-white/40 text-xs mt-1">Only one admin is allowed per gym.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={openCreateModal}
                        disabled={hasAdmin}
                        className="bg-brand text-black text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors disabled:opacity-50"
                    >
                        Add Admin
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-white/5 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-2 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        Back to clubs
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">
                    {error}
                </div>
            )}

            <GymAdminListSection
                isLoading={isLoading}
                admins={admins}
                hasAdmin={hasAdmin}
                onAddAdmin={openCreateModal}
                onEditAdmin={openEditModal}
                onToggleActive={handleToggleActive}
                onDeleteAdmin={handleDeleteAdmin}
                isToggling={isToggling}
                isDeleting={isDeleting}
            />

            <GymAdminCreateModal
                isOpen={isCreateModalOpen}
                values={formValues}
                error={formError}
                isSubmitting={isSubmitting}
                onChange={handleInputChange}
                onClose={closeCreateModal}
                onSubmit={handleCreateAdmin}
            />

            <GymAdminEditModal
                isOpen={isEditModalOpen && Boolean(editingAdmin)}
                values={editValues}
                error={editError}
                isSubmitting={isUpdating}
                onChange={handleEditChange}
                onClose={closeEditModal}
                onSubmit={handleUpdateAdmin}
            />
        </div>
    );
};
