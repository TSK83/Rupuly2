import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Gamepad2, Users, Receipt, LogOut, ArrowRight, Inbox } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const navItems = [
    { to: '/admin', label: isRtl ? 'داشبورد' : 'Dashboard', icon: BarChart3, end: true },
    { to: '/admin/tasks', label: isRtl ? 'مدیریت تسک‌ها' : 'Task Management', icon: Gamepad2 },
    { to: '/admin/users', label: isRtl ? 'مخاطبان' : 'Users', icon: Users },
    { to: '/admin/requests', label: isRtl ? 'درخواست‌ها' : 'Requests', icon: Inbox },
    { to: '/admin/transactions', label: isRtl ? 'تراکنش‌ها' : 'Transactions', icon: Receipt },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-900/70 backdrop-blur-xl border-l border-gray-800/50 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* هدر */}
      <div className="p-5 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{isRtl ? 'پنل ادمین' : 'Admin Panel'}</h1>
            <p className="text-gray-500 text-xs">{t('appName')}</p>
          </div>
        </div>
      </div>

      {/* ناوبری */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-l from-red-600/20 to-orange-600/20 text-white border border-red-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* پایین */}
      <div className="p-3 border-t border-gray-800/50 space-y-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all w-full"
        >
          <ArrowRight className="w-5 h-5" />
          {isRtl ? 'بازگشت به سایت' : 'Back to Site'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          {t('sideLogout')}
        </button>
      </div>
    </aside>
  );
}
