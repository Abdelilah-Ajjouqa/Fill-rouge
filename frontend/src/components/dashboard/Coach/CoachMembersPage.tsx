import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '../../../store/store';
import {
  fetchMembers,
  createMember,
  updateMember,
  clearMembersError,
} from '../../../store/slices/membersSlice';
import type { MemberInput } from '../../../store/interfaces';
import type { Member } from '../../../types/models';
import { StatCard } from '../StatCard';

type MemberFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
};

type MemberModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  values: MemberFormState;
  error: string | null;
  isSubmitting: boolean;
  onChange: (field: keyof MemberFormState) => (event: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
};

const normalizeDateInput = (value?: string) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

const formatDate = (value?: string) => {
  if (!value) {
    return '--';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return date.toLocaleDateString();
};

const MemberModal = ({
  isOpen,
  mode,
  values,
  error,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: MemberModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto h-screen">
      <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in max-h-[90vh] overflow-y-auto my-6">
        <h3 className="text-xl font-bold mb-4">{mode === 'create' ? 'Add Member' : 'Edit Member'}</h3>
        <p className="text-white/60 text-sm mb-6">
          {mode === 'create'
            ? 'Create a new member for your gym.'
            : 'Update member details.'}
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={values.firstName}
                onChange={onChange('firstName')}
                required
                placeholder="e.g. Karim"
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={values.lastName}
                onChange={onChange('lastName')}
                required
                placeholder="e.g. Alaoui"
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={values.email}
                onChange={onChange('email')}
                required
                placeholder="member@gym.com"
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                {mode === 'create' ? 'Password *' : 'New Password (optional)'}
              </label>
              <input
                type="password"
                value={values.password}
                onChange={onChange('password')}
                minLength={6}
                required={mode === 'create'}
                placeholder={mode === 'create' ? 'Minimum 6 characters' : 'Leave blank to keep current'}
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={values.phone}
                onChange={onChange('phone')}
                placeholder="e.g. 0600000000"
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                Date of Birth (optional)
              </label>
              <input
                type="date"
                value={values.dateOfBirth}
                onChange={onChange('dateOfBirth')}
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Member' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CoachMembersPage = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isCoach = userRole === 'COACH';
  const dispatch = useDispatch<AppDispatch>();
  const { members, isLoading, error } = useSelector(
    (state: RootState) => state.members,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formState, setFormState] = useState<MemberFormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isCoach) {
      return;
    }

    dispatch(fetchMembers());
  }, [dispatch, isCoach]);

  const handleFormChange = (field: keyof MemberFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => {
    setFormState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
    });
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedMember(null);
    resetForm();
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setModalMode('edit');
    setSelectedMember(member);
    setFormState({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      password: '',
      phone: member.phone ? String(member.phone) : '',
      dateOfBirth: normalizeDateInput(member.dateOfBirth),
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setModalError(null);
    resetForm();
    dispatch(clearMembersError());
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setModalError(null);
    dispatch(clearMembersError());

    if (!formState.firstName.trim() || !formState.lastName.trim() || !formState.email.trim()) {
      setModalError('First name, last name, and email are required.');
      return;
    }

    if (modalMode === 'create' && !formState.password.trim()) {
      setModalError('Password is required for new members.');
      return;
    }

    const payload: MemberInput = {
      firstName: formState.firstName.trim(),
      lastName: formState.lastName.trim(),
      email: formState.email.trim(),
    };

    if (formState.password.trim()) {
      payload.password = formState.password;
    }

    if (formState.phone.trim()) {
      payload.phone = formState.phone.trim();
    }

    if (formState.dateOfBirth) {
      payload.dateOfBirth = formState.dateOfBirth;
    }

    setIsSubmitting(true);

    try {
      if (modalMode === 'create') {
        const result = await dispatch(createMember(payload));
        if (createMember.fulfilled.match(result)) {
          toast.success('Member created successfully.');
          closeModal();
          dispatch(fetchMembers());
        } else {
          setModalError(
            typeof result.payload === 'string'
              ? result.payload
              : 'Failed to create member.',
          );
        }
      } else if (selectedMember) {
        const result = await dispatch(
          updateMember({ id: selectedMember._id, data: payload }),
        );
        if (updateMember.fulfilled.match(result)) {
          toast.success('Member updated successfully.');
          closeModal();
        } else {
          setModalError(
            typeof result.payload === 'string'
              ? result.payload
              : 'Failed to update member.',
          );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMembers = members.length;
  const newMembersThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return members.filter((member) => {
      if (!member.createdAt) {
        return false;
      }
      const createdAt = new Date(member.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        return false;
      }
      return createdAt >= monthStart;
    }).length;
  }, [members]);

  if (!isCoach) {
    return (
      <div className="p-8">
        <div className="bg-slate-900 border border-white/10 p-6">
          <h2 className="text-lg font-bold">My Members</h2>
          <p className="text-white/40 text-sm mt-2">
            This view is available for coaches only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Members</h2>
          <p className="text-white/40 text-sm mt-1">
            Manage members in your gym.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-brand text-black text-xs font-bold uppercase tracking-widest px-4 py-3 hover:bg-white transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Members"
          value={isLoading ? '...' : totalMembers}
          icon={<Users className="h-5 w-5" />}
          subtitle="Active enrollments"
          delay={100}
        />
        <StatCard
          title="New This Month"
          value={isLoading ? '...' : newMembersThisMonth}
          icon={<Users className="h-5 w-5" />}
          subtitle="Joined recently"
          delay={200}
        />
      </div>

      <div className="bg-slate-900 border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Member Directory</h3>
          <span className="text-[10px] uppercase tracking-widest text-white/40">
            {members.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-white/40">
            <div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3"></div>
            <p className="font-mono text-[10px] uppercase tracking-widest">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">
            No members found yet for your classes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Date of Birth</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member) => (
                  <tr key={member._id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 font-medium">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="p-4 text-white/60">{member.email}</td>
                    <td className="p-4 text-white/60">{member.phone || '--'}</td>
                    <td className="p-4 text-white/60">{formatDate(member.dateOfBirth)}</td>
                    <td className="p-4 text-white/60">{formatDate(member.createdAt)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 hover:bg-white/5 text-white/40 hover:text-brand transition-colors"
                        aria-label="Edit member"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MemberModal
        isOpen={isModalOpen}
        mode={modalMode}
        values={formState}
        error={modalError}
        isSubmitting={isSubmitting}
        onChange={handleFormChange}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
