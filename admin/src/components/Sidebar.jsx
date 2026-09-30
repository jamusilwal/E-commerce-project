import { NavLink } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineCollection,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCreditCard,
  HiOutlineChartBar,
  HiOutlinePhotograph,
  HiOutlineMail,
  HiOutlineExternalLink,
  HiOutlineLogout,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ pendingSellersCount = 0 }) => {
  const { logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
    { to: '/orders', label: 'Orders', icon: HiOutlineShoppingBag },
    { to: '/products', label: 'Products', icon: HiOutlineTag },
    { to: '/categories', label: 'Categories', icon: HiOutlineCollection },
    {
      to: '/sellers',
      label: 'Artisans / Sellers',
      icon: HiOutlineUserGroup,
      badge: pendingSellersCount > 0 ? pendingSellersCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    { to: '/users', label: 'Users', icon: HiOutlineUsers },
    { to: '/payments', label: 'Payments', icon: HiOutlineCreditCard },
    { to: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
    { to: '/banners', label: 'Banners', icon: HiOutlinePhotograph },
    { to: '/messages', label: 'Contact Inquiries', icon: HiOutlineMail },
  ];

  return (
    <aside className="w-64 bg-[#0B2319] text-white flex flex-col shrink-0 min-h-screen border-r border-[#153A2B]">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#184433]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-emerald-400 text-lg">
            H
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white">HAMROLOK</h1>
            <p className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/50">
          Management
        </div>

        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-emerald-400/80" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-emerald-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#184433] space-y-2">
        <a
          href="https://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-slate-700"
        >
          <span className="flex items-center gap-2">
            <HiOutlineExternalLink className="w-4 h-4 text-emerald-400" />
            View Storefront
          </span>
          <span className="text-[10px] text-slate-400 font-mono">:5173</span>
        </a>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-800/40"
        >
          <HiOutlineLogout className="w-4 h-4 text-rose-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
