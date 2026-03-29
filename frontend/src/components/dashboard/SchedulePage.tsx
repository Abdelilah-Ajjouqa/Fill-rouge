import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { SuperAdminSchedulePage } from './SuperAdminDashboard/SuperAdminSchedulePage';
import { MemberSchedulePage } from './MemberSchedulePage';

export const SchedulePage = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role) || 'MEMBER';

  if (userRole === 'SUPER_ADMIN') {
    return <SuperAdminSchedulePage />;
  }

  if (userRole === 'MEMBER') {
    return <MemberSchedulePage />;
  }

  return (
    <div className="p-8">
      <div className="bg-slate-900 border border-white/10 p-6">
        <h2 className="text-lg font-bold">Schedule</h2>
        <p className="text-white/40 text-sm mt-2">
          This view is not available for your role.
        </p>
      </div>
    </div>
  );
};
