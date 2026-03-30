import { DollarSign, Users, Award, AlertCircle } from 'lucide-react';
import { StatCard } from '../StatCard';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

export const AdminDashboard = () => {
    const { data, isLoading, error } = useAdminDashboard();
    const expiredMembers = data?.expiredMembers ?? [];

    const stats = [
        { t: "Monthly Revenue", v: isLoading ? '...' : `${(data?.monthlyRevenue ?? 0).toLocaleString()} DH`, i: <DollarSign className="h-5 w-5" />, s: isLoading ? 'Loading...' : 'Updated this month', d: 100 },
        { t: "Active Members", v: isLoading ? '...' : (data?.activeMembers ?? 0), i: <Users className="h-5 w-5" />, s: isLoading ? 'Loading...' : 'Currently active', d: 200 },
        { t: "Top Activity", v: isLoading ? '...' : data?.topActivity?.name || 'N/A', i: <Award className="h-5 w-5" />, s: isLoading ? 'Loading...' : 'Most popular program', d: 300 }
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div><h2 className="text-2xl font-bold tracking-tight">Gym Overview</h2><p className="text-white/40 text-sm mt-1">Live metrics for your facility</p></div>
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map(s => <StatCard key={s.t} title={s.t} value={s.v} icon={s.i} subtitle={s.s} delay={s.d} />)}
            </div>

            <div className="bg-slate-900 border border-white/10 p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Needs Attention</h3>
                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-red-500/20">{isLoading ? '...' : `${expiredMembers.length} Expired`}</span>
                </div>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-white/40"><div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3"></div><p className="font-mono text-[10px] uppercase tracking-widest">Loading Expired Members...</p></div>
                ) : !expiredMembers.length ? (
                    <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">No expired members found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest"><tr>{['Member Name', 'Activity', 'Expired Date', 'Status', 'Action'].map(h => <th key={h} className={`p-4 ${h === 'Action' ? 'text-right' : ''}`}>{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {expiredMembers.map(m => (
                                    <tr key={m.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="p-4 font-medium">{m.name}</td><td className="p-4 text-white/60">{m.activity}</td>
                                        <td className="p-4 font-mono text-white/60">{m.expiredOn && !Number.isNaN(new Date(m.expiredOn).getTime()) ? new Date(m.expiredOn).toLocaleDateString() : '--'}</td>
                                        <td className="p-4"><span className="flex items-center gap-1 text-red-400"><AlertCircle className="h-3 w-3" />{m.status}</span></td>
                                        <td className="p-4 text-right"><button className="text-brand text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Renew</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
