import type { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    subtitle?: string;
    delay?: number;
}

export const StatCard = ({ title, value, icon, subtitle, delay = 100 }: StatCardProps) => {
    return (
        <article 
            className="bg-slate-900 border border-white/10 p-6 flex flex-col justify-between group hover:border-brand/40 transition-colors animate-fade-in"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold tracking-tight text-white/90">{title}</h3>
                <span className="bg-white/5 p-2 border border-white/10 text-brand">
                    {icon}
                </span>
            </div>
            
            <div className="mt-4">
                <p className="text-3xl font-bold text-white group-hover:text-brand transition-colors">{value}</p>
                {subtitle && (
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-2">
                        {subtitle}
                    </p>
                )}
            </div>
        </article>
    );
};
