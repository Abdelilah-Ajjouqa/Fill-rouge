import { useState, useEffect, useMemo } from 'react';
import api from '../../../api/axios';
import { toast } from 'sonner';
import {
  X,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  Check,
} from 'lucide-react';
import type { Subscription, Member } from '../../../types/models';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  activityName: string;
  sessionTime?: string;
}

interface AttendanceRecord {
  _id: string;
  memberId: string | Member;
  status: 'present' | 'absent';
  date: string;
}

export const SessionAttendanceModal = ({
  isOpen,
  onClose,
  activityId,
  activityName,
  sessionTime,
}: Props) => {
  const [enrolledMembers, setEnrolledMembers] = useState<Member[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, 'present' | 'absent'>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && activityId) {
      loadData();
    }
  }, [isOpen, activityId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subsRes, attRes] = await Promise.all([
        api.get<Subscription[]>(`/subscriptions/activity/${activityId}`),
        api.get<AttendanceRecord[]>(`/attendance/activity/${activityId}/today`),
      ]);

      // Extract unique active members
      const membersMap = new Map<string, Member>();
      subsRes.data.forEach((sub) => {
        if (
          sub.status === 'active' &&
          sub.member &&
          typeof sub.member === 'object'
        ) {
          membersMap.set(sub.member._id, sub.member);
        }
      });
      setEnrolledMembers(Array.from(membersMap.values()));

      // Build attendance lookup
      const attLookup: Record<string, 'present' | 'absent'> = {};
      attRes.data.forEach((record) => {
        const memId =
          typeof record.memberId === 'string'
            ? record.memberId
            : record.memberId?._id;
        if (memId) {
          attLookup[memId] = record.status;
        }
      });
      setAttendanceMap(attLookup);
    } catch (err: any) {
      toast.error('Failed to load session attendance roster');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAttendance = async (
    memberId: string,
    currentStatus?: 'present' | 'absent',
  ) => {
    const nextStatus = currentStatus === 'present' ? 'absent' : 'present';
    setUpdatingMemberId(memberId);

    // Optimistic update
    setAttendanceMap((prev) => ({ ...prev, [memberId]: nextStatus }));

    try {
      await api.post('/attendance/check-in', {
        activityId,
        memberId,
        status: nextStatus,
      });

      toast.success(
        nextStatus === 'present'
          ? 'Checked in as present'
          : 'Marked as absent',
      );
    } catch (err: any) {
      // Revert optimistic update
      setAttendanceMap((prev) => ({
        ...prev,
        [memberId]: currentStatus || 'absent',
      }));
      toast.error('Failed to update attendance');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleMarkAllPresent = async () => {
    if (!enrolledMembers.length) return;
    setIsLoading(true);
    try {
      await Promise.all(
        enrolledMembers.map((m) =>
          api.post('/attendance/check-in', {
            activityId,
            memberId: m._id,
            status: 'present',
          }),
        ),
      );

      const updated: Record<string, 'present' | 'absent'> = {};
      enrolledMembers.forEach((m) => {
        updated[m._id] = 'present';
      });
      setAttendanceMap(updated);
      toast.success('All members marked present!');
    } catch (err) {
      toast.error('Failed to mark all members');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return enrolledMembers;
    const q = searchQuery.toLowerCase();
    return enrolledMembers.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [enrolledMembers, searchQuery]);

  const presentCount = useMemo(() => {
    return Object.values(attendanceMap).filter((s) => s === 'present').length;
  }, [attendanceMap]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 max-w-xl w-full relative animate-fade-in my-6 max-h-[90vh] flex flex-col rounded">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand text-black font-mono">
                Today's Session
              </span>
              {sessionTime && (
                <span className="text-xs text-white/50 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {sessionTime}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {activityName} — Attendance Roster
            </h3>
            <p className="text-white/40 text-xs mt-0.5">
              One-click check-in for enrolled members
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter & Action Bar */}
        <div className="p-4 bg-slate-950 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white/60">
              Total Enrolled:{' '}
              <strong className="text-white">{enrolledMembers.length}</strong>
            </span>
            <span className="text-white/60">
              Checked In:{' '}
              <strong className="text-emerald-400 font-bold">
                {presentCount}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              disabled={isLoading || enrolledMembers.length === 0}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Mark All Present
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-white/30" />
            <input
              type="text"
              placeholder="Search enrolled members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 pl-9 p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-white/5">
          {isLoading ? (
            <div className="py-12 text-center text-white/40 text-xs">
              Loading session roster...
            </div>
          ) : !enrolledMembers.length ? (
            <div className="py-12 text-center text-white/40 text-xs">
              No members are currently enrolled in this activity.
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-white/40 text-xs">
              No matching members found.
            </div>
          ) : (
            filteredMembers.map((member) => {
              const status = attendanceMap[member._id];
              const isPresent = status === 'present';
              const isUpdating = updatingMemberId === member._id;

              return (
                <div
                  key={member._id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {member.photo ? (
                        <img
                          src={
                            member.photo.startsWith('http')
                              ? member.photo
                              : `http://localhost:3000${member.photo}`
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white/70 uppercase">
                          {member.firstName.charAt(0)}
                          {member.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-[11px] text-white/40">{member.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAttendance(member._id, status)}
                    disabled={isUpdating}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPresent
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-white/5 text-white/50 border border-white/10 hover:bg-brand/10 hover:text-brand hover:border-brand/30'
                    }`}
                  >
                    {isPresent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Present</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Check In</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
