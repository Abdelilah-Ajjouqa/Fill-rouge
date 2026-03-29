import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Users } from 'lucide-react';
import api from '../../api/axios';
import type { RootState } from '../../store/store';
import type { Member } from '../../types/models';
import { StatCard } from './StatCard';

const formatDate = (value?: string) => {
  if (!value) {
    return '--';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return date.toLocaleDateString();
};

export const CoachMembersPage = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isCoach = userRole === 'COACH';
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCoach) {
      return;
    }

    let isActive = true;

    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<Member[]>('/members');
        if (!isActive) {
          return;
        }
        setMembers(response.data);
      } catch (err) {
        if (!isActive) {
          return;
        }

        let message = 'Failed to load members.';
        if (axios.isAxiosError(err)) {
          message = err.response?.data?.message || message;
        }
        setError(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      isActive = false;
    };
  }, [isCoach]);

  const totalMembers = members.length;
  const newMembersThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return members.filter((member) => {
      if (!member.createdAt) {
        return false;
      }
      const createdAt = new Date(member.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        return false;
      }
      return createdAt >= monthStart;
    }).length;
  }, [members]);

  if (!isCoach) {
    return (
      <div className="p-8">
        <div className="bg-slate-900 border border-white/10 p-6">
          <h2 className="text-lg font-bold">My Members</h2>
          <p className="text-white/40 text-sm mt-2">
            This view is available for coaches only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Members</h2>
          <p className="text-white/40 text-sm mt-1">
            Track the members enrolled in your activities.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Members"
          value={isLoading ? '...' : totalMembers}
          icon={<Users className="h-5 w-5" />}
          subtitle="Active enrollments"
          delay={100}
        />
        <StatCard
          title="New This Month"
          value={isLoading ? '...' : newMembersThisMonth}
          icon={<Users className="h-5 w-5" />}
          subtitle="Joined recently"
          delay={200}
        />
      </div>

      <div className="bg-slate-900 border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Member Directory</h3>
          <span className="text-[10px] uppercase tracking-widest text-white/40">
            {members.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-white/40">
            <div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-3"></div>
            <p className="font-mono text-[10px] uppercase tracking-widest">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-6 border border-dashed border-white/10 text-white/40 text-sm">
            No members found yet for your classes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member) => (
                  <tr key={member._id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 font-medium">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="p-4 text-white/60">{member.email}</td>
                    <td className="p-4 text-white/60">{member.phone || '--'}</td>
                    <td className="p-4 text-white/60">{formatDate(member.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
