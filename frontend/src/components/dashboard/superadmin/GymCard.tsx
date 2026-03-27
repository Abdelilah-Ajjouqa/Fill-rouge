import { Flame, MapPin, Phone, Edit2, Trash2 } from 'lucide-react';
import type { Gym } from '../../../types/models';

interface GymCardProps {
    gym: Gym;
    index: number;
    onEdit: (gym: Gym) => void;
    onDelete: (gym: Gym) => void;
    onManageStaff: (gym: Gym) => void;
}

export const GymCard = ({ gym, index, onEdit, onDelete, onManageStaff }: GymCardProps) => {
    return (
        <article
            className="bg-slate-900 border border-white/10 p-6 flex flex-col justify-between group hover:border-brand/40 transition-colors animate-fade-in"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
        >
            <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold tracking-tight truncate pr-4" title={gym.name}>{gym.name}</h3>
                    <span className="bg-white/5 p-2 border border-white/10 text-brand shrink-0">
                        {gym.logo ? (
                            <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${gym.logo}`} alt="Logo" className="h-5 w-5 object-cover" />
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
                        onClick={() => onEdit(gym)}
                        className="p-2 hover:bg-white/5 text-white/40 hover:text-brand transition-colors"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(gym)}
                        className="p-2 hover:bg-white/5 text-white/40 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <button
                    onClick={() => onManageStaff(gym)}
                    className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors"
                >
                    Manage Admins
                </button>
            </div>
        </article>
    );
};