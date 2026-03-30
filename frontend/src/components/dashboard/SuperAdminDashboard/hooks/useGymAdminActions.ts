import {
    useMemo,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '../../../../store/store';
import type { UserInput } from '../../../../store/interfaces';
import { createUser, deleteUser, updateUser } from '../../../../store/slices/usersSlice';
import type { User } from '../../../../types/auth';

type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

type UseGymAdminActionsArgs = {
    gymId?: string;
    admins: User[];
};

type UseGymAdminActionsResult = {
    hasAdmin: boolean;
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    isSubmitting: boolean;
    isUpdating: boolean;
    isToggling: boolean;
    isDeleting: boolean;
    formError: string | null;
    editError: string | null;
    availableAdmins: User[];
    selectedExistingAdminId: string;
    formValues: FormState;
    editValues: FormState;
    editingAdmin: User | null;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    openEditModal: (admin: User) => void;
    closeEditModal: () => void;
    handleExistingAdminSelect: (value: string) => void;
    handleInputChange: (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => void;
    handleEditChange: (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => void;
    handleCreateAdmin: (event: FormEvent) => Promise<void>;
    handleUpdateAdmin: (event: FormEvent) => Promise<void>;
    handleToggleActive: (admin: User) => Promise<void>;
    handleDeleteAdmin: (admin: User) => Promise<void>;
};

export const useGymAdminActions = ({
    gymId,
    admins,
}: UseGymAdminActionsArgs): UseGymAdminActionsResult => {
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
    const [formValues, setFormValues] = useState<FormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [editValues, setEditValues] = useState<FormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [editingAdmin, setEditingAdmin] = useState<User | null>(null);

    const hasAdmin = useMemo(() => admins.length > 0, [admins.length]);
    const availableAdmins = useMemo(
        () => users.filter((user) => user.role === 'ADMIN' && !user.gymId),
        [users],
    );

    const resetForm = () => {
        setFormValues({ firstName: '', lastName: '', email: '', password: '' });
        setSelectedExistingAdminId('');
        setFormError(null);
    };

    const resetEditForm = () => {
        setEditValues({ firstName: '', lastName: '', email: '', password: '' });
        setEditError(null);
        setEditingAdmin(null);
    };

    const openCreateModal = () => {
        if (hasAdmin) {
            toast.error('This gym already has an admin.');
            return;
        }
        resetForm();
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        resetForm();
    };

    const openEditModal = (admin: User) => {
        setEditValues({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            password: '',
        });
        setEditingAdmin(admin);
        setEditError(null);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        resetEditForm();
    };

    const handleExistingAdminSelect = (value: string) => {
        setSelectedExistingAdminId(value);
        setFormError(null);
    };

    const handleInputChange = (field: keyof FormState) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
        };

    const handleEditChange = (field: keyof FormState) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setEditValues((prev) => ({ ...prev, [field]: event.target.value }));
        };

    const handleCreateAdmin = async (event: FormEvent) => {
        event.preventDefault();

        if (!gymId) {
            setFormError('Missing gym id.');
            return;
        }

        if (hasAdmin) {
            setFormError('This gym already has an admin.');
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        try {
            if (selectedExistingAdminId) {
                await dispatch(updateUser({ id: selectedExistingAdminId, data: { gymId } })).unwrap();
                toast.success('Existing admin assigned successfully.');
                closeCreateModal();
                return;
            }

            const payload: UserInput = {
                ...formValues,
                role: 'ADMIN',
                gymId,
            };
            await dispatch(createUser(payload)).unwrap();
            toast.success('Admin added successfully.');
            closeCreateModal();
        } catch (err) {
            let message = 'Failed to add admin.';
            if (typeof err === 'string') {
                message = err;
            }
            setFormError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateAdmin = async (event: FormEvent) => {
        event.preventDefault();

        if (!editingAdmin) {
            setEditError('Missing admin details.');
            return;
        }

        setIsUpdating(true);
        setEditError(null);

        try {
            const payload: Partial<FormState> = {
                firstName: editValues.firstName,
                lastName: editValues.lastName,
                email: editValues.email,
            };

            if (editValues.password.trim().length > 0) {
                payload.password = editValues.password;
            }

            await dispatch(updateUser({ id: editingAdmin._id, data: payload })).unwrap();
            toast.success('Admin updated successfully.');
            closeEditModal();
        } catch (err) {
            let message = 'Failed to update admin.';
            if (typeof err === 'string') {
                message = err;
            }
            setEditError(message);
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleActive = async (admin: User) => {
        const isActive = admin.isActive !== false;
        const nextState = !isActive;

        setIsToggling(true);

        try {
            await dispatch(updateUser({ id: admin._id, data: { isActive: nextState } })).unwrap();
            toast.success(nextState ? 'Admin activated.' : 'Admin deactivated.');
        } catch (err) {
            let message = 'Failed to update admin status.';
            if (typeof err === 'string') {
                message = err;
            }
            toast.error(message);
        } finally {
            setIsToggling(false);
        }
    };

    const handleDeleteAdmin = async (admin: User) => {
        const confirmed = window.confirm(`Delete admin ${admin.firstName} ${admin.lastName}?`);
        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        try {
            await dispatch(deleteUser(admin._id)).unwrap();
            toast.success('Admin deleted.');
        } catch (err) {
            let message = 'Failed to delete admin.';
            if (typeof err === 'string') {
                message = err;
            }
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        hasAdmin,
        isCreateModalOpen,
        isEditModalOpen,
        isSubmitting,
        isUpdating,
        isToggling,
        isDeleting,
        formError,
        editError,
        availableAdmins,
        selectedExistingAdminId,
        formValues,
        editValues,
        editingAdmin,
        openCreateModal,
        closeCreateModal,
        openEditModal,
        closeEditModal,
        handleExistingAdminSelect,
        handleInputChange,
        handleEditChange,
        handleCreateAdmin,
        handleUpdateAdmin,
        handleToggleActive,
        handleDeleteAdmin,
    };
};
