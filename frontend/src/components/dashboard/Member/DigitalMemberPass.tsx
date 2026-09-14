import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';
import type { User as UserType } from '../../../types/auth';
import type { Subscription } from '../../../types/models';

interface Props {
  user: UserType | null;
  activeSubscriptions: Subscription[];
}

export const DigitalMemberPass = ({ user, activeSubscriptions }: Props) => {
  const isActive = activeSubscriptions.length > 0;
  const latestEndDate = activeSubscriptions.reduce((latest, sub) => {
    if (!sub.endDate) return latest;
    const end = new Date(sub.endDate).getTime();
    return end > latest ? end : latest;
  }, 0);

  const expiryFormatted = latestEndDate
    ? new Date(latestEndDate).toLocaleDateString()
    : 'No active pass';

  const memberPassPayload = JSON.stringify({
    memberId: user?._id,
    email: user?.email,
    name: `${user?.firstName} ${user?.lastName}`,
    status: isActive ? 'ACTIVE' : 'EXPIRED',
    gymId: user?.gymId,
  });

  const memberNumber = user?._id
    ? `FM-${user._id.slice(-6).toUpperCase()}`
    : 'FM-000000';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-brand/40 shadow-xl shadow-brand/5 p-6 rounded-lg relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 bg-brand text-black flex items-center justify-center font-bold text-xs">
            FM
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-white">
              FitManager Digital Pass
            </h4>
            <p className="text-[10px] text-white/40 font-mono">Official Gym Pass</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
            }`}
          />
          {isActive ? 'Active Member' : 'Inactive'}
        </div>
      </div>

      {/* Body: Card info & QR code */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-3 w-full sm:w-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-0.5">
              Member
            </span>
            <p className="text-base font-bold text-white tracking-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/60 font-mono">{user?.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-0.5">
                Pass ID
              </span>
              <p className="text-xs font-mono font-bold text-brand">
                {memberNumber}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-0.5">
                Valid Until
              </span>
              <p className="text-xs font-mono text-white/80">
                {expiryFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center shrink-0">
          <div className="p-3 bg-white rounded-lg shadow-md border border-white/20">
            <QRCodeSVG
              value={memberPassPayload}
              size={118}
              level="M"
              bgColor="#ffffff"
              fgColor="#090d16"
            />
          </div>
          <span className="text-[10px] text-white/40 font-mono tracking-wider mt-2 flex items-center gap-1">
            <QrCode className="w-3 h-3 text-brand" /> Scan at Reception
          </span>
        </div>
      </div>
    </div>
  );
};
