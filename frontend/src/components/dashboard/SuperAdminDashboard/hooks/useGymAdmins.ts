import { useEffect, useState } from 'react';
import api from '../../../../api/axios';
import type { User } from '../../../../types/auth';

type UseGymAdminsResult = {
    admins: User[];
    setAdmins: React.Dispatch<React.SetStateAction<User[]>>;
    isLoading: boolean;
    error: string | null;
};

export const useGymAdmins = (gymId?: string): UseGymAdminsResult => {
    const [admins, setAdmins] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gymId) {
            setError('Missing gym id.');
            setAdmins([]);
            return;
        }

        let isActive = true;

        const fetchAdmins = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await api.get<User[]>('/users');
                if (!isActive) {
                    return;
                }

                const gymAdmins = response.data.filter(
                    (user) => user.role === 'ADMIN' && user.gymId === gymId
                );
                setAdmins(gymAdmins);
            } catch (err) {
                if (!isActive) {
                    return;
                }
                setError('Failed to load admins.');
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchAdmins();

        return () => {
            isActive = false;
        };
    }, [gymId]);

    return { admins, setAdmins, isLoading, error };
};
