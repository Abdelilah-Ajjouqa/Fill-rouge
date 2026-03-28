import { Trash2 } from 'lucide-react';
import type { Gym } from '../../../../types/models';

type DeleteBtnProps = {
	gym: Gym;
	onDelete: (gymId: string) => void;
};

export const DeleteBtn = ({ gym, onDelete }: DeleteBtnProps) => {
	const handleDelete = () => {
		if (window.confirm(`Are you sure you want to delete ${gym.name}?`)) {
			onDelete(gym._id);
		}
	};

	return (
		<button
			onClick={handleDelete}
			className="p-2 hover:bg-white/5 text-white/40 hover:text-red-500 transition-colors"
		>
			<Trash2 className="h-4 w-4" />
		</button>
	);
};
