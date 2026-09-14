import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/store';
import { createPayment } from '../../../store/slices/paymentsSlice';
import type { Subscription } from '../../../types/models';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  amountDue?: number;
  onSuccess?: () => void;
}

export const RecordPaymentModal = ({
  isOpen,
  onClose,
  subscription,
  amountDue,
  onSuccess,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [method, setMethod] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen || !subscription) return null;

  const memberName =
    typeof subscription.member === 'object' && subscription.member !== null
      ? `${subscription.member.firstName} ${subscription.member.lastName}`
      : 'Member';

  const memberEmail =
    typeof subscription.member === 'object' && subscription.member !== null
      ? subscription.member.email
      : '';

  const activityName =
    typeof subscription.activity === 'object' && subscription.activity !== null
      ? subscription.activity.name
      : 'Activity';

  const finalAmount =
    amountDue ||
    (typeof subscription.activity === 'object' && subscription.activity !== null
      ? subscription.activity.monthlyPrice
      : 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (finalAmount <= 0) {
      setFormError('Invalid amount due');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        createPayment({
          subscription: subscription._id,
          amount: finalAmount,
          paidAt: new Date(paymentDate).toISOString(),
        }),
      ).unwrap();

      toast.success(`Payment of ${finalAmount} DH recorded successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to record payment',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-brand/40 shadow-2xl shadow-brand/10 p-6 max-w-md w-full relative animate-fade-in my-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand/10 border border-brand/20 text-brand">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Record Payment</h3>
            <p className="text-white/60 text-xs">
              Collect subscription fee from member
            </p>
          </div>
        </div>

        {formError && (
          <div className="my-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="my-4 p-4 bg-slate-950 border border-white/10 rounded space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Member:</span>
            <span className="text-white font-medium">
              {memberName} {memberEmail && `(${memberEmail})`}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Activity:</span>
            <span className="text-white font-medium">{activityName}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-white/5 pt-2">
            <span className="text-white/40">Amount Due:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {finalAmount} DH
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="w-full bg-slate-950 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
            />
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
              disabled={isSubmitting}
              className="flex-1 bg-brand text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Confirm Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
