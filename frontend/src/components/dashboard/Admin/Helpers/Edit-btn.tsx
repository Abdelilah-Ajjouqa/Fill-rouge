import type { Gym } from '../../../../types/models';
import { GymForm } from '../../GymForm';

type EditBtnProps = {
    isOpen: boolean;
    selectedGym: Gym | null;
    onSuccess: () => void;
    onClose: () => void;
};

export const EditBtn = ({ isOpen, selectedGym, onSuccess, onClose }: EditBtnProps) => {
    if (!isOpen || !selectedGym) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in">
                <h3 className="text-xl font-bold mb-4">Edit Gym</h3>
                <p className="text-white/60 text-sm mb-6">Update the facility details below.</p>

                <GymForm
                    gym={selectedGym}
                    onSuccess={onSuccess}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
};
