import { Power, UserCog } from 'lucide-react';
import type { StaffRole, StaffUser } from '../../../store/slices/staffSlice';

interface StaffMemberCardProps {
    member: StaffUser;
    isUpdating: boolean;
    disableAdminOption?: boolean;
    onRoleChange: (memberId: string, currentRole: StaffRole, nextRole: StaffRole) => void;
    onStatusToggle: (member: StaffUser) => void;
}

export const StaffMemberCard = ({
    member,
    isUpdating,
    disableAdminOption = false,
    onRoleChange,
    onStatusToggle,
}: StaffMemberCardProps) => {
    return (
        <div className="border border-white/10 bg-slate-950 p-3">
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
                            onChange={(e) => onRoleChange(member._id, member.role, e.target.value as StaffRole)}
                            disabled={isUpdating}
                            className="w-full bg-slate-950 border border-white/10 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
                        >
                            <option value="ADMIN" disabled={disableAdminOption}>ADMIN</option>
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
                        onClick={() => onStatusToggle(member)}
                        disabled={isUpdating}
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
    );
};