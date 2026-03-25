import { Flame, Swords, Wind, Dumbbell, Zap, PlusSquare } from 'lucide-react';

// Mock data based on user's exact clubs overview design
const MOCK_CLUBS = [
    {
        id: 1,
        name: 'Downtown Branch',
        type: 'CrossFit & High Intensity',
        icon: Flame,
        occupancy: 84,
        coachName: 'Alex Rivera',
        coachImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqCyfVqIMvX2igxHEsvUciJZ2pJXrnWKtuoQWgzsiatPGKEHQxmKPUecg-Ram6p_i87Q2MeGJzglIaGWvMehqxDt4jcfqnBZj_1HjwIInetIE6GhYVV5_l61vFxiVwtDCdQ0QjNmKPAZ_gXUEXlE0uHHOlWcmbaK9E3ksOo_Yz7EdXj858vlDN4_iCin9Tun4nLl87G77qYD-bcyky1Xd-GZQimYX8H0_DFU1fv_KywgOc65bxcuQnpPAy4zMsuKT8J2xBesWna_g'
    },
    {
        id: 2,
        name: 'Elite Center',
        type: 'Pro Boxing & Combat',
        icon: Swords,
        occupancy: 42,
        coachName: 'Sarah Chen',
        coachImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO1qTFYdw8vhwWkrxtfaHHfC2LIhz-PYUYx6FAHsyEBKdRoNn7X2vyr91tal8VRsxzjuyGaR7m6hM2B3NkU0meb_cYDseGy-F2xg_VL8VjMi63OObhWukDu0NJ74tHHZA5ETjnvgfk0wj5OcNMJzv2Sk7ACpeASUgXXJUgLN8GZ2lZI-DY7ou1J8wSda1dDeW5XPPMamqoP-Aljo3IvHOT75xLyC1jznmNz26nNCUWPPBNXI-Fsd0U3kdTONtka1cdPTqydvnrMCQ'
    },
    {
        id: 3,
        name: 'Zen Space',
        type: 'Premium Yoga & Pilates',
        icon: Wind,
        occupancy: 12,
        coachName: 'Marcus Volt',
        coachImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLzT7_DSiOu8VJSov2dCw6mR4j7ypd6SldzX4mWJ_ey7eVPcwvUVuJNa8bjzhvaKB06fdIfFPu7ZxpDQFNEKsf9iopdYk7ldWkBePjuxRpU0TkRP9sPjYgf-VP2pkB33G16a3v7MUIbpeRVR0v4ieobBVEXyQwhdWVspFa_xBA4C8D2xXrdsHBtzIxBjNrGEQmGCz5sAkVBpbT6wyVJVRUZ6nhQ7slvQhKOYspkTtwnU9EhvYnHNy_-nbZy5DcIuQ04bfamh-WBvc'
    },
    {
        id: 4,
        name: 'Iron Vault',
        type: 'Heavy Lifting & Physique',
        icon: Dumbbell,
        occupancy: 67,
        coachName: 'Jaxson Steel',
        coachImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8zPV_YnYuo5hcZIBehiBMZpqUJfC_NI_P4-MP2HeFQabmxKXA9RHr6RhJFFE97cQKIi3rnakd9yuKSpNGkbLYebKEQE5mRPGxNsfz4aKyS6f6CPzvBeLAWc6Tc3KbaHX78bgmsjvYttJcxv_HmZHU7PwXoOy1X95BBCeN1xVDZZKuM-uxBFvu2CGDro5hS-94Qsajn17PSZ5x_NRY0l1UAxWLg6w6Xafae5W0Ffu_4qoy5oyC3eMT0Y-VLnPqIclQ20dsGIuaEcg'
    },
    {
        id: 5,
        name: 'Metro Pump',
        type: 'Functional Training',
        icon: Zap,
        occupancy: 95,
        coachName: 'Dani Park',
        coachImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-p-Ktu0lmVqWBKaelkhXruKvLJHYxIkoJ8jn-xfC_g4eMV9L4aETlrYrfyxuWIk3afHl35l41Iew8wJsyS52EfJiqANoHWIX_lqRXnqkmmcYRA43S_Uv86_HBlWpLGmAuzAWztNd_ToW9CYGhZmVX-aBhJ0emoZwMeTDB14JV089rTglwtE_vjEYmm-PavHOnnHmWg-EYJBiXcW10l3FHkLUogm9KFTuuQYKHMEiDayvtOhhpHNBN5WuKG4XrEj9WbJImCxcN3n8'
    }
];

export const SuperAdminDashboard = () => {
    return (
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="club-grid">
                
                {MOCK_CLUBS.map((club, index) => (
                    <article 
                        key={club.id} 
                        className="bg-slate-900 border border-white/10 p-6 flex flex-col justify-between group hover:border-brand/40 transition-colors animate-fade-in" 
                        style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    >
                        <div className="mb-8">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold tracking-tight">{club.name}</h3>
                                <span className="bg-white/5 p-2 border border-white/10 text-brand" title={club.type.split(' ')[0]}>
                                    <club.icon className="h-5 w-5" />
                                </span>
                            </div>
                            
                            <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-6">
                                {club.type}
                            </p>
                            
                            <div className="space-y-2" data-purpose="occupancy-stats">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                    <span className="text-white/60">Live Occupancy</span>
                                    <span className="text-brand">{club.occupancy}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 border border-white/5">
                                    <div className="bg-brand h-full transition-all duration-1000 ease-out" style={{ width: `${club.occupancy}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-white/10 overflow-hidden border border-white/20">
                                    <img alt="Coach Avatar" className="h-full w-full object-cover" src={club.coachImage} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase font-bold">Head Coach</p>
                                    <p className="text-xs font-semibold">{club.coachName}</p>
                                </div>
                            </div>
                            <button className="bg-brand text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-white transition-colors">
                                Manage
                            </button>
                        </div>
                    </article>
                ))}

                {/* Add New Club Placeholder */}
                <button 
                    className="border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-4 text-white/20 hover:text-brand hover:border-brand/40 transition-all hover:bg-white/[0.02] animate-fade-in" 
                    style={{ animationDelay: `${(MOCK_CLUBS.length + 1) * 100}ms` }}
                >
                    <PlusSquare className="h-10 w-10" />
                    <span className="text-xs font-bold uppercase tracking-widest">Register New Club</span>
                </button>
            </div>
        </div>
    );
};
