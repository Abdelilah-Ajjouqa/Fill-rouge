import { Activity, CreditCard, Calendar } from 'lucide-react';

const MY_SUBSCRIPTIONS = [
    { id: 1, name: 'Kick-Boxing Adulte', status: 'Active', expires: '15 Days', progress: 50 },
    { id: 2, name: 'Yoga Basics', status: 'Active', expires: '28 Days', progress: 10 },
];

const PAYMENTS = [
    { id: 1, date: '2026-03-01', amount: '300 DH', status: 'Paid in full', for: 'Kick-Boxing Adulte' },
    { id: 2, date: '2026-03-10', amount: '150 DH', status: 'Partial (150 DH Debt)', for: 'Yoga Basics' },
];

export const MemberDashboard = () => {
    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome back, User</h2>
                    <p className="text-white/40 text-sm mt-1">Here is your fitness summary</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Balance Due</span>
                    <span className="text-lg font-bold text-red-400">150 DH</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Subscriptions */}
                <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-2 mb-2 text-white/60">
                        <Activity className="h-4 w-4" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Active Memberships</h3>
                    </div>
                    
                    {MY_SUBSCRIPTIONS.map((sub) => (
                        <article key={sub.id} className="bg-slate-900 border border-white/10 p-6 group hover:border-brand/40 transition-colors">
                            <div className="flex justify-between items-start mb-6">
                                <h4 className="text-lg font-bold tracking-tight">{sub.name}</h4>
                                <span className="bg-brand/10 text-brand px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-brand/20">
                                    {sub.status}
                                </span>
                            </div>
                            
                            <div className="space-y-2" data-purpose="occupancy-stats">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                    <span className="text-white/60">Time Remaining</span>
                                    <span className="text-white">{sub.expires}</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 border border-white/5">
                                    <div className="bg-white/40 h-full" style={{ width: `${sub.progress}%` }}></div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* History & Schedule */}
                <div className="space-y-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-white/60">
                            <CreditCard className="h-4 w-4" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">Recent Payments</h3>
                        </div>
                        <div className="bg-slate-900 border border-white/10 p-4">
                            <div className="space-y-4">
                                {PAYMENTS.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between text-sm pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-bold">{payment.for}</p>
                                            <p className="text-[10px] text-white/40 font-mono mt-1">{payment.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{payment.amount}</p>
                                            <p className={payment.status.includes('Debt') ? 'text-red-400 text-[10px] font-bold uppercase mt-1' : 'text-brand text-[10px] font-bold uppercase mt-1'}>
                                                {payment.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4 text-white/60">
                            <Calendar className="h-4 w-4" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">My Next Session</h3>
                        </div>
                        <div className="bg-slate-900 border border-white/10 p-6 flex items-center justify-between group hover:border-brand/40 transition-colors">
                            <div>
                                <h4 className="font-bold tracking-tight">Kick-Boxing Adulte</h4>
                                <p className="text-sm text-white/60 mt-1">Today · 18:00 - 19:30</p>
                            </div>
                            <div className="h-10 w-10 border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-brand group-hover:text-black transition-colors">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
