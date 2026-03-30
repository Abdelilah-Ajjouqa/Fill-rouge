import type { GymAdminListSectionProps } from '../../../../types/super-admin';

export const GymAdminListSection = ({ isLoading, admins, hasAdmin, onAddAdmin, onEditAdmin, onToggleActive, onDeleteAdmin, isToggling, isDeleting }: GymAdminListSectionProps) => {
    if (isLoading) return <div className="flex flex-col items-center justify-center p-12 text-white/40"><div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4" /><p className="font-mono text-[10px] uppercase tracking-widest">Fetching Admin...</p></div>;
    
    if (!admins.length) return (
        <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm flex items-center justify-between gap-4">
            <span>No admin assigned yet.</span>
            <button onClick={onAddAdmin} disabled={hasAdmin} className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-3 py-2 hover:bg-white transition-colors disabled:opacity-50">Add Admin</button>
        </div>
    );

    const Btn = ({ onClick, disabled, text, danger = false }: any) => (
        <button onClick={onClick} disabled={disabled} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 transition-colors disabled:opacity-50 ${danger ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}>
            {text}
        </button>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {admins.map(a => (
                <article key={a._id} className="bg-slate-900 border border-white/10 p-5 hover:border-brand/40 transition-colors">
                    <h3 className="text-lg font-semibold text-white">{a.firstName} {a.lastName}</h3>
                    <p className="text-xs text-white/60 mt-1">{a.email}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-brand">{a.role}</div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${a.isActive === false ? 'text-red-400' : 'text-brand'}`}>{a.isActive === false ? 'Inactive' : 'Active'}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Btn onClick={() => onEditAdmin(a)} text="Edit" />
                        <Btn onClick={() => onToggleActive(a)} disabled={isToggling} text={a.isActive === false ? 'Activate' : 'Deactivate'} />
                        <Btn onClick={() => onDeleteAdmin(a)} disabled={isDeleting} text="Delete" danger />
                    </div>
                </article>
            ))}
        </div>
    );
};
