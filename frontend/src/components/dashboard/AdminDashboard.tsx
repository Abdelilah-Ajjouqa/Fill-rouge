import { DollarSign, Users, Award, AlertCircle } from 'lucide-react';
import { StatCard } from './StatCard';

const EXPIRED_MEMBERS = [
    { id: 1, name: 'Karim Alaoui', activity: 'Boxe', expiredOn: '2026-03-20', status: 'Expired' },
    { id: 2, name: 'Sara Bennani', activity: 'Yoga', expiredOn: '2026-03-24', status: 'Expired' },
    { id: 3, name: 'Youssef Tazi', activity: 'CrossFit', expiredOn: '2026-03-25', status: 'Expired Today' },
];

export const AdminDashboard = () => {
    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gym Overview</h2>
                    <p className="text-white/40 text-sm mt-1">Live metrics for your facility</p>
                </div>
                <button className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors border border-brand">
                    Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="Monthly Revenue" 
                    value="45,000 DH" 
                    icon={<DollarSign className="h-5 w-5" />} 
                    subtitle="+12% from last month"
                    delay={100}
                />
                <StatCard 
                    title="Active Members" 
                    value="320" 
                    icon={<Users className="h-5 w-5" />} 
                    subtitle="15 new this week"
                    delay={200}
                />
                <StatCard 
                    title="Top Activity" 
                    value="CrossFit" 
                    icon={<Award className="h-5 w-5" />} 
                    subtitle="Generating 40% of revenue"
                    delay={300}
                />
            </div>

            <div className="bg-slate-900 border border-white/10 p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Needs Attention</h3>
                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-red-500/20">
                        {EXPIRED_MEMBERS.length} Expired
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="p-4">Member Name</th>
                                <th className="p-4">Activity</th>
                                <th className="p-4">Expired Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {EXPIRED_MEMBERS.map((member) => (
                                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4 font-medium">{member.name}</td>
                                    <td className="p-4 text-white/60">{member.activity}</td>
                                    <td className="p-4 font-mono text-white/60">{member.expiredOn}</td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1 text-red-400">
                                            <AlertCircle className="h-3 w-3" />
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-brand text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                                            Renew
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
