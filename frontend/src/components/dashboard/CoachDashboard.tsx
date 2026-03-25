import { Users, Clock, AlertTriangle } from 'lucide-react';
import { StatCard } from './StatCard';

const UPCOMING_SESSIONS = [
    { id: 1, name: 'CrossFit Basics', time: '16:00 - 17:00', enrolled: 25, capacity: 30 },
    { id: 2, name: 'Advanced WOD', time: '18:00 - 19:30', enrolled: 30, capacity: 30 },
    { id: 3, name: 'Mobility & Stretching', time: '20:00 - 21:00', enrolled: 12, capacity: 40 },
];

const UNPAID_MEMBERS = [
    { id: 1, name: 'Ahmed Rami', debt: '200 DH' },
    { id: 2, name: 'Nadia El Fassi', debt: '300 DH' },
];

export const CoachDashboard = () => {
    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Coach Dashboard</h2>
                    <p className="text-white/40 text-sm mt-1">Manage your activities and members</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard 
                    title="My Members" 
                    value="85" 
                    icon={<Users className="h-5 w-5" />} 
                    subtitle="Across 3 active classes"
                    delay={100}
                />
                <StatCard 
                    title="Next Class" 
                    value="16:00" 
                    icon={<Clock className="h-5 w-5" />} 
                    subtitle="CrossFit Basics"
                    delay={200}
                />
                <StatCard 
                    title="Unpaid Dues" 
                    value="500 DH" 
                    icon={<AlertTriangle className="h-5 w-5" />} 
                    subtitle="From 2 members"
                    delay={300}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule Widget */}
                <div className="lg:col-span-2 bg-slate-900 border border-white/10 p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <h3 className="text-lg font-bold mb-6 tracking-tight">Today's Schedule</h3>
                    <div className="space-y-4">
                        {UPCOMING_SESSIONS.map((session) => (
                            <div key={session.id} className="p-4 border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-white/90">{session.name}</p>
                                    <p className="text-xs text-white/40 font-mono mt-1">{session.time}</p>
                                </div>
                                <div className="space-y-2 min-w-[150px]">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                        <span className="text-white/60">Enrolled</span>
                                        <span className={session.enrolled === session.capacity ? 'text-red-400' : 'text-brand'}>
                                            {session.enrolled} / {session.capacity}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 border border-white/5">
                                        <div 
                                            className={`h-full transition-all duration-1000 ease-out ${session.enrolled === session.capacity ? 'bg-red-500' : 'bg-brand'}`} 
                                            style={{ width: `${(session.enrolled / session.capacity) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Unpaid Members List */}
                <div className="bg-slate-900 border border-white/10 p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold tracking-tight">Unpaid Dues</h3>
                        <span className="text-brand text-[10px] font-bold uppercase tracking-widest">{UNPAID_MEMBERS.length} Pending</span>
                    </div>
                    <div className="space-y-3">
                        {UNPAID_MEMBERS.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.02]">
                                <span className="text-sm font-medium">{member.name}</span>
                                <span className="text-xs font-bold text-red-400">{member.debt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
