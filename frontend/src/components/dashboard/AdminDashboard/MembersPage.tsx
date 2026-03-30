import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit2, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { RootState, AppDispatch } from '../../../store/store';
import { fetchMembers, createMember, updateMember, deleteMember, clearMembersError } from '../../../store/slices/membersSlice';
import type { MemberInput } from '../../../store/interfaces';
import type { Member } from '../../../types/models';
import { StatCard } from '../StatCard';
import { MemberModal, type MemberFormState } from '../modals/MemberModal';

const normalizeDateInput = (valueString?: string) => valueString && !Number.isNaN(new Date(valueString).getTime()) ? new Date(valueString).toISOString().slice(0, 10) : '';
const formatDate = (valueString?: string) => valueString && !Number.isNaN(new Date(valueString).getTime()) ? new Date(valueString).toLocaleDateString() : '--';

export const MembersPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isAdmin = useSelector((state: RootState) => state.auth.user?.role) === 'ADMIN';
    const { members, isLoading, error } = useSelector((state: RootState) => state.members);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [formState, setFormState] = useState<MemberFormState>({ firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: '' });
    const [modalError, setModalError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { if (isAdmin) dispatch(fetchMembers()); }, [dispatch, isAdmin]);

    const newMembersThisMonth = useMemo(() => {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        return members.filter(member => member.createdAt && !Number.isNaN(new Date(member.createdAt).getTime()) && new Date(member.createdAt) >= monthStart).length;
    }, [members]);

    const handleFormChange = (field: keyof MemberFormState) => (event: ChangeEvent<HTMLInputElement>) => setFormState(prevState => ({ ...prevState, [field]: event.target.value }));
    const resetForm = () => setFormState({ firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: '' });

    const openModal = (memberToEdit?: Member) => {
        setModalMode(memberToEdit ? 'edit' : 'create');
        setSelectedMember(memberToEdit || null);
        setFormState(memberToEdit ? { firstName: memberToEdit.firstName || '', lastName: memberToEdit.lastName || '', email: memberToEdit.email || '', password: '', phone: memberToEdit.phone ? String(memberToEdit.phone) : '', dateOfBirth: normalizeDateInput(memberToEdit.dateOfBirth) } : { firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: '' });
        setModalError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setSelectedMember(null); setModalError(null); resetForm(); dispatch(clearMembersError()); };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setModalError(null);
        dispatch(clearMembersError());
        if (!formState.firstName.trim() || !formState.lastName.trim() || !formState.email.trim()) return setModalError('First name, last name, and email are required.');
        if (modalMode === 'create' && !formState.password.trim()) return setModalError('Password is required for new members.');

        const payload: MemberInput = { firstName: formState.firstName.trim(), lastName: formState.lastName.trim(), email: formState.email.trim(), ...(formState.password.trim() && { password: formState.password }), ...(formState.phone.trim() && { phone: formState.phone.trim() }), ...(formState.dateOfBirth && { dateOfBirth: formState.dateOfBirth }) };
        setIsSubmitting(true);
        const action = modalMode === 'create' ? createMember(payload) : updateMember({ id: selectedMember!._id, data: payload });
        const res: any = await dispatch(action as any);
        setIsSubmitting(false);

        if (typeof res.type === 'string' && res.type.endsWith('/fulfilled')) { toast.success(`Member ${modalMode === 'create' ? 'created' : 'updated'}.`); closeModal(); }
        else setModalError(typeof res.payload === 'string' ? res.payload : 'Operation failed.');
    };

    const handleDelete = async (member: Member) => {
        if (!window.confirm(`Remove ${member.firstName} ${member.lastName}?`)) return;
        const res: any = await dispatch(deleteMember(member._id) as any);
        if (typeof res.type === 'string' && res.type.endsWith('/fulfilled')) toast.success('Member deleted.');
        else toast.error(typeof res.payload === 'string' ? res.payload : 'Failed to delete member.');
    };

    if (!isAdmin) return <div className="p-8"><div className="bg-slate-900 border border-white/10 p-6"><h2 className="text-lg font-bold">Members</h2><p className="text-white/40 text-sm mt-2">Available for gym admins only.</p></div></div>;

    const statsArray = [
        { title: "Total Members", value: isLoading ? '...' : members.length, subtitle: "Gym members" },
        { title: "New This Month", value: isLoading ? '...' : newMembersThisMonth, subtitle: "Joined recently" }
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex justify-between items-center gap-4">
                <div><h2 className="text-2xl font-bold tracking-tight">Members</h2><p className="text-white/40 text-sm mt-1">Manage memberships for your gym.</p></div>
                <button onClick={() => openModal()} className="bg-brand text-black text-xs font-bold uppercase px-4 py-3 hover:bg-white flex items-center gap-2"><Plus className="h-4 w-4" /> Add Member</button>
            </div>

            {error && <div className="p-4 bg-red-500/10 text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statsArray.map((stat, index) => <StatCard key={stat.title} title={stat.title} value={stat.value} icon={<Users className="h-5 w-5" />} subtitle={stat.subtitle} delay={(index + 1) * 100} />)}
            </div>

            <div className="bg-slate-900 border border-white/10 p-6">
                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold">Member Directory</h3><span className="text-[10px] uppercase tracking-widest text-white/40">{members.length} total</span></div>
                {isLoading ? <div className="p-8 text-center text-white/40">Loading members...</div> : !members.length ? <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No members found yet.</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest"><tr>{['Name', 'Email', 'Phone', 'Date of Birth', 'Joined', 'Actions'].map(header => <th key={header} className={`p-4 ${header === 'Actions' ? 'text-right' : ''}`}>{header}</th>)}</tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {members.map(member => (
                                    <tr key={member._id} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4 font-medium">{member.firstName} {member.lastName}</td><td className="p-4 text-white/60">{member.email}</td><td className="p-4 text-white/60">{member.phone || '--'}</td>
                                        <td className="p-4 text-white/60">{formatDate(member.dateOfBirth)}</td><td className="p-4 text-white/60">{formatDate(member.createdAt)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openModal(member)} className="p-2 text-white/40 hover:text-brand"><Edit2 className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(member)} className="p-2 text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <MemberModal isOpen={isModalOpen} mode={modalMode} values={formState} error={modalError} isSubmitting={isSubmitting} onChange={handleFormChange} onClose={closeModal} onSubmit={handleSubmit} />
        </div>
    );
};
