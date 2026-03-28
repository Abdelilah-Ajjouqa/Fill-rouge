import type { User } from '../../../../types/auth';

type GymAdminListSectionProps = {
    isLoading: boolean;
    admins: User[];
    hasAdmin: boolean;
    onAddAdmin: () => void;
    onEditAdmin: (admin: User) => void;
    onToggleActive: (admin: User) => void;
    onDeleteAdmin: (admin: User) => void;
    isToggling: boolean;
    isDeleting: boolean;
};

export const GymAdminListSection = ({
    isLoading,
    admins,
    hasAdmin,
    onAddAdmin,
    onEditAdmin,
    onToggleActive,
    onDeleteAdmin,
    isToggling,
    isDeleting,
}: GymAdminListSectionProps) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-white/40">
                <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4"></div>
                <p className="font-mono text-[10px] uppercase tracking-widest">Fetching Admin...</p>
            </div>
        );
    }

    if (admins.length === 0) {
        return (
            <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm flex items-center justify-between gap-4">
                <span>No admin assigned yet.</span>
                <button
                    onClick={onAddAdmin}
                    disabled={hasAdmin}
                    className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-3 py-2 hover:bg-white transition-colors disabled:opacity-50"
                >
                    Add Admin
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {admins.map((admin) => (
                <article
                    key={admin._id}
                    className="bg-slate-900 border border-white/10 p-5 hover:border-brand/40 transition-colors"
                >
                    <h3 className="text-lg font-semibold text-white">
                        {admin.firstName} {admin.lastName}
                    </h3>
                    <p className="text-xs text-white/60 mt-1">{admin.email}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-brand">
                            {admin.role}
                        </div>
                        <span
                            className={
                                admin.isActive === false
                                    ? 'text-[10px] font-bold uppercase tracking-widest text-red-400'
                                    : 'text-[10px] font-bold uppercase tracking-widest text-brand'
                            }
                        >
                            {admin.isActive === false ? 'Inactive' : 'Active'}
                        </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => onEditAdmin(admin)}
                            className="bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-widest px-3 py-2 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onToggleActive(admin)}
                            disabled={isToggling}
                            className="bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-widest px-3 py-2 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                        >
                            {admin.isActive === false ? 'Activate' : 'Deactivate'}
                        </button>
                        <button
                            onClick={() => onDeleteAdmin(admin)}
                            disabled={isDeleting}
                            className="bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest px-3 py-2 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                            Delete
                        </button>
                    </div>
                </article>
            ))}
        </div>
    );
};
