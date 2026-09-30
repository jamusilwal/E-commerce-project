import { useAuth } from '../context/AuthContext';
import { HiOutlineBell } from 'react-icons/hi';

export const Navbar = () => {
  const { admin } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Admin Portal Active (Port 5174)
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Admin profile pill */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-xs border border-emerald-900">
            {admin?.firstName?.[0] || 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {admin?.firstName} {admin?.lastName}
            </p>
            <p className="text-[11px] text-slate-500 font-mono truncate max-w-[160px]">{admin?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
