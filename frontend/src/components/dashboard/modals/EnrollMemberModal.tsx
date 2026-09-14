import { useState, useMemo, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store/store';
import { createSubscription } from '../../../store/slices/subscriptionsSlice';
import type { Member, Activity, Subscription } from '../../../types/models';
import { toast } from 'sonner';
import { Users, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedMemberId?: string;
  onSuccess?: () => void;
}

export const EnrollMemberModal = ({
  isOpen,
  onClose,
  preselectedMemberId,
  onSuccess,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { members } = useSelector((state: RootState) => state.members);
  const { activities } = useSelector((state: RootState) => state.activities);
  const { subscriptions } = useSelector((state: RootState) => state.subscriptions);

  const [memberId, setMemberId] = useState(preselectedMemberId || '');
  const [activityId, setActivityId] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedMemberId) {
      setMemberId(preselectedMemberId);
    } else if (members.length > 0 && !memberId) {
      setMemberId(members[0]._id);
    }
  }, [preselectedMemberId, members, isOpen]);

  useEffect(() => {
    if (activities.length > 0 && !activityId) {
      setActivityId(activities[0]._id);
    }
  }, [activities, isOpen]);

  const selectedActivity: Activity | undefined = useMemo(() => {
    return activities.find((a: Activity) => a._id === activityId);
  }, [activities, activityId]);

  const activeCount = useMemo(() => {
    if (!activityId) return 0;
    return subscriptions.filter((sub: Subscription) => {
      const actId =
        typeof sub.activity === 'string'
          ? sub.activity
          : sub.activity?._id;
      return actId === activityId && sub.status === 'active';
    }).length;
  }, [subscriptions, activityId]);

  const maxCap = selectedActivity?.maxCapacity || 0;
  const isFull = maxCap > 0 && activeCount >= maxCap;

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!memberId) {
      setFormError('Please select a member');
      return;
    }
    if (!activityId) {
      setFormError('Please select an activity');
      return;
    }
    if (isFull) {
      setFormError('This activity is at maximum capacity');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        createSubscription({
          member: memberId,
          activity: activityId,
          startDate,
        }),
      ).unwrap();

      toast.success('Member enrolled successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to enroll member',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-lg w-full relative animate-fade-in my-6">
        <h3 className="text-xl font-bold mb-1 text-white">Enroll in Activity</h3>
        <p className="text-white/60 text-xs mb-5">
          Assign a member to a gym activity and generate their active subscription.
        </p>

        {formError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
              Select Member *
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
            >
              <option value="" disabled>
                -- Choose Member --
              </option>
              {members.map((m: Member) => (
                <option key={m._id} value={m._id}>
                  {m.firstName} {m.lastName} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
              Select Activity *
            </label>
            <select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
            >
              <option value="" disabled>
                -- Choose Activity --
              </option>
              {activities.map((a: Activity) => (
                <option key={a._id} value={a._id}>
                  {a.name} — {a.monthlyPrice} DH/month
                </option>
              ))}
            </select>
          </div>

          {selectedActivity && (
            <div className="p-3 bg-slate-950 border border-white/10 rounded space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-brand" /> Monthly Price:
                </span>
                <span className="font-bold text-white">
                  {selectedActivity.monthlyPrice} DH
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand" /> Capacity:
                </span>
                <span
                  className={`font-semibold ${
                    isFull ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {activeCount} / {maxCap} enrolled {isFull ? '(FULL)' : ''}
                </span>
              </div>

              {isFull && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  This activity is currently at full capacity. Enrollment is locked.
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
              Start Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-white/5 text-white/60 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isFull}
              className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Enrolling...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Enroll Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
