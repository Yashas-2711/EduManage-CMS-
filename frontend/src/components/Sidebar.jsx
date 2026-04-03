import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, BarChart2,
  CreditCard, CalendarCheck, ChevronRight, GraduationCap,
} from 'lucide-react';

const nav = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/students',   label: 'Students',   icon: Users },
  { to: '/courses',    label: 'Courses',    icon: BookOpen },
  { to: '/marks',      label: 'Marks',      icon: BarChart2 },
  { to: '/fees',       label: 'Fees',       icon: CreditCard },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
];

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-gradient-to-b from-slate-900 to-slate-800
          shadow-2xl transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">EduManage</p>
            <p className="text-slate-400 text-xs mt-0.5">CMS Pro</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
            Main Menu
          </p>
          {nav.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'}
                `}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-blue-200" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-700">
          <p className="text-slate-500 text-xs text-center">EduManage CMS v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
