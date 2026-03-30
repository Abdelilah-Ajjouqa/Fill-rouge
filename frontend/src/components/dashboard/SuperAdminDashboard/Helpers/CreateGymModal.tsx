import { GymForm } from '../../AdminDashboard/GymForm';

type CreateGymModalProps = {
    isOpen: boolean;
    onSuccess: () => void;
    onClose: () => void;
};

export const CreateGymModal = ({ isOpen, onSuccess, onClose }: CreateGymModalProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto h-screen">
            <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in max-h-[90vh] overflow-y-auto my-6">
                <h3 className="text-xl font-bold mb-4">Register New Gym</h3>
                <p className="text-white/60 text-sm mb-6">Enter the facility details below to add it to the platform.</p>

                <GymForm
                    onSuccess={onSuccess}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
};
