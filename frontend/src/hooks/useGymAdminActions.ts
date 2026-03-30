import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '../store/store';
import { createUser, deleteUser, updateUser } from '../store/slices/usersSlice';
import type { User } from '../types/auth';
import type { FormState, UseGymAdminActionsArgs, UseGymAdminActionsResult } from '../types/gym-admins';

const initForm = { firstName: '', lastName: '', email: '', password: '' };

export const useGymAdminActions = ({ gymId, admins }: UseGymAdminActionsArgs): UseGymAdminActionsResult => {
    const dispatch = useDispatch<AppDispatch>();
    const { users } = useSelector((state: RootState) => state.users);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [formError, setFormError] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    
    const [selectedExistingAdminId, setSelectedExistingAdminId] = useState('');
    const [formValues, setFormValues] = useState<FormState>(initForm);
    const [editValues, setEditValues] = useState<FormState>(initForm);
    const [editingAdmin, setEditingAdmin] = useState<User | null>(null);

    const hasAdmin = useMemo(() => admins.length > 0, [admins.length]);
    const availableAdmins = useMemo(() => users.filter((u) => u.role === 'ADMIN' && !u.gymId), [users]);

    const resetForm = () => { setFormValues(initForm); setSelectedExistingAdminId(''); setFormError(null); };
    const resetEditForm = () => { setEditValues(initForm); setEditError(null); setEditingAdmin(null); };

    const openCreateModal = () => { if (hasAdmin) return toast.error('This gym already has an admin.'); resetForm(); setIsCreateModalOpen(true); };
    const closeCreateModal = () => { setIsCreateModalOpen(false); resetForm(); };

    const openEditModal = (admin: User) => {
        setEditValues({ firstName: admin.firstName, lastName: admin.lastName, email: admin.email, password: '' });
        setEditingAdmin(admin);
        setEditError(null);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => { setIsEditModalOpen(false); resetEditForm(); };

    const handleExistingAdminSelect = (value: string) => { setSelectedExistingAdminId(value); setFormError(null); };

    const handleInputChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, [field]: e.target.value }));
    const handleEditChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setEditValues((p) => ({ ...p, [field]: e.target.value }));

    const handleAction = async (action: () => Promise<void>, setLoading: (v: boolean) => void, setError: ((v: string | null) => void) | null, defaultErrMsg: string) => {
        setLoading(true);
        if (setError) setError(null);
        try {
            await action();
        } catch (err) {
            const message = typeof err === 'string' ? err : defaultErrMsg;
            if (setError) setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: FormEvent) => {
        e.preventDefault();
        if (!gymId) return setFormError('Missing gym id.');
        if (hasAdmin) return setFormError('This gym already has an admin.');

        handleAction(async () => {
            if (selectedExistingAdminId) {
                await dispatch(updateUser({ id: selectedExistingAdminId, data: { gymId } })).unwrap();
                toast.success('Existing admin assigned successfully.');
            } else {
                await dispatch(createUser({ ...formValues, role: 'ADMIN', gymId })).unwrap();
                toast.success('Admin added successfully.');
            }
            closeCreateModal();
        }, setIsSubmitting, setFormError, 'Failed to add admin.');
    };

    const handleUpdateAdmin = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingAdmin) return setEditError('Missing admin details.');

        handleAction(async () => {
            const payload: Partial<FormState> = { ...editValues };
            if (!payload.password?.trim()) delete payload.password;
            
            await dispatch(updateUser({ id: editingAdmin._id, data: payload })).unwrap();
            toast.success('Admin updated successfully.');
            closeEditModal();
        }, setIsUpdating, setEditError, 'Failed to update admin.');
    };

    const handleToggleActive = async (admin: User) => {
        const nextState = admin.isActive === false;
        handleAction(async () => {
            await dispatch(updateUser({ id: admin._id, data: { isActive: nextState } })).unwrap();
            toast.success(nextState ? 'Admin activated.' : 'Admin deactivated.');
        }, setIsToggling, null, 'Failed to update admin status.');
    };

    const handleDeleteAdmin = async (admin: User) => {
        if (!window.confirm(`Delete admin ${admin.firstName} ${admin.lastName}?`)) return;
        handleAction(async () => {
            await dispatch(deleteUser(admin._id)).unwrap();
            toast.success('Admin deleted.');
        }, setIsDeleting, null, 'Failed to delete admin.');
    };

    return {
        hasAdmin, isCreateModalOpen, isEditModalOpen, isSubmitting, isUpdating, isToggling, isDeleting,
        formError, editError, availableAdmins, selectedExistingAdminId, formValues, editValues, editingAdmin,
        openCreateModal, closeCreateModal, openEditModal, closeEditModal, handleExistingAdminSelect,
        handleInputChange, handleEditChange, handleCreateAdmin, handleUpdateAdmin, handleToggleActive, handleDeleteAdmin,
    };
};
