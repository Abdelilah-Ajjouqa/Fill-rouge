import { Edit2, Flame, MapPin, Phone } from 'lucide-react';
import type { Gym } from '../../../../types/models';
import { DeleteBtn } from './Delete-btn';

type GymCardProps = {
    gym: Gym;
    animationDelayMs?: number;
    onEdit: (gym: Gym) => void;
    onDelete: (gymId: string) => void;
    onManageAdmins: (gym: Gym) => void;
    onViewDetails: (gym: Gym) => void;
};

export const GymCard = ({
    gym,
    animationDelayMs,
    onEdit,
    onDelete,
    onManageAdmins,
    onViewDetails,
}: GymCardProps) => {
    return (
        <article
            className="bg-slate-900 border border-white/10 p-6 flex flex-col justify-between group hover:border-brand/40 transition-colors animate-fade-in cursor-pointer"
            style={
                typeof animationDelayMs === 'number'
                    ? { animationDelay: `${animationDelayMs}ms` }
                    : undefined
            }
            onClick={() => onViewDetails(gym)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onViewDetails(gym);
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold tracking-tight truncate pr-4" title={gym.name}>{gym.name}</h3>
                    <span className="bg-white/5 p-2 border border-white/10 text-brand shrink-0">
                        {gym.logo ? (
                            <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${gym.logo}`}
                                alt="Logo"
                                className="h-5 w-5 object-cover"
                            />
                        ) : (
                            <Flame className="h-5 w-5" />
                        )}
                    </span>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-2 text-white/60">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="text-xs">{gym.address}</p>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                        <Phone className="h-4 w-4 shrink-0" />
                        <p className="text-xs font-mono">{gym.phone}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-white/60">Platform Status</span>
                        <span className={gym.isActive ? 'text-brand' : 'text-red-400'}>
                            {gym.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex gap-2">
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit(gym);
                        }}
                        className="p-2 hover:bg-white/5 text-white/40 hover:text-brand transition-colors"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <div onClick={(event) => event.stopPropagation()}>
                        <DeleteBtn
                            gym={gym}
                            onDelete={onDelete}
                        />
                    </div>
                </div>

                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onManageAdmins(gym);
                    }}
                    className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors"
                >
                    Manage Admins
                </button>
            </div>
        </article>
    );
};
