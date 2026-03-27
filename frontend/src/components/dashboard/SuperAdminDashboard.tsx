import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGyms } from '../../store/slices/gymsSlice';
import { Flame, PlusSquare, MapPin, Phone } from 'lucide-react';
import { GymForm } from './GymForm';
import type { AppDispatch, RootState } from '../../store/store';

export const SuperAdminDashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { gyms, isLoading, error } = useSelector((state: RootState) => state.gyms);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchGyms());
    }, [dispatch]);

    const handleSuccess = () => {
        setIsCreateModalOpen(false);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Active Clubs</h2>
                    <p className="text-white/40 text-sm mt-1">Manage all registered gyms on the platform</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="club-grid">
                
                {isLoading && gyms.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-white/40">
                        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4"></div>
                        <p className="font-mono text-[10px] uppercase tracking-widest">Fetching Gyms...</p>
                    </div>
                ) : (
                    gyms.map((gym: any, index: any) => (
                        <article 
                            key={gym._id} 
                            className="bg-slate-900 border border-white/10 p-6 flex flex-col justify-between group hover:border-brand/40 transition-colors animate-fade-in" 
                            style={{ animationDelay: `${(index + 1) * 100}ms` }}
                        >
                            <div className="mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold tracking-tight truncate pr-4" title={gym.name}>{gym.name}</h3>
                                    <span className="bg-white/5 p-2 border border-white/10 text-brand shrink-0">
                                        {gym.logo ? (
                                            <img src={`http://localhost:3000${gym.logo}`} alt="Logo" className="h-5 w-5 object-cover" />
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
                                        <span className={gym.isActive ? "text-brand" : "text-red-400"}>
                                            {gym.isActive ? "ACTIVE" : "SUSPENDED"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="text-[10px] text-white/40 uppercase font-mono">
                                    ID: {gym._id ? gym._id.slice(-6) : 'NEW'}
                                </div>
                                <button className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors">
                                    Manage
                                </button>
                            </div>
                        </article>
                    ))
                )}

                {/* Add New Club Button */}
                {!isLoading && (
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-4 text-white/20 hover:text-brand hover:border-brand/40 transition-all hover:bg-white/[0.02] animate-fade-in" 
                        style={{ animationDelay: `${(gyms.length + 1) * 100}ms` }}
                    >
                        <PlusSquare className="h-10 w-10" />
                        <span className="text-xs font-bold uppercase tracking-widest">Register New Club</span>
                    </button>
                )}
            </div>
            
            {/* Create Gym Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">Register New Gym</h3>
                        <p className="text-white/60 text-sm mb-6">Enter the facility details below to add it to the platform.</p>
                        
                        <GymForm 
                            onSuccess={handleSuccess} 
                            onCancel={() => setIsCreateModalOpen(false)} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
