import { GymForm } from './GymForm';
import type { Gym } from '../../../types/models';

interface GymEditorModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    gym?: Gym;
    onSuccess: () => void;
    onClose: () => void;
}

export const GymEditorModal = ({
    isOpen,
    title,
    description,
    gym,
    onSuccess,
    onClose,
}: GymEditorModalProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <p className="text-white/60 text-sm mb-6">{description}</p>

                <GymForm
                    gym={gym}
                    onSuccess={onSuccess}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
};