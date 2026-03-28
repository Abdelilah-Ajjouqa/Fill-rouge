import { PlusSquare } from 'lucide-react';

type AddNewClubBtnProps = {
	onClick: () => void;
	animationDelayMs?: number;
};

export const AddNewClubBtn = ({ onClick, animationDelayMs }: AddNewClubBtnProps) => {
	return (
		<button
			onClick={onClick}
			className="border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-4 text-white/20 hover:text-brand hover:border-brand/40 transition-all hover:bg-white/2 animate-fade-in"
			style={
				typeof animationDelayMs === 'number'
					? { animationDelay: `${animationDelayMs}ms` }
					: undefined
			}
		>
			<PlusSquare className="h-10 w-10" />
			<span className="text-xs font-bold uppercase tracking-widest">Register New Club</span>
		</button>
	);
};
