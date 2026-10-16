import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Gamepad2, ClipboardList, TrendingUp, User, ArrowDownToLine, Receipt, LogOut, Shield, Briefcase, Settings, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [role, setRole] = useState('user');

  const navItems = [
    { to: '/dashboard', label: t('sideGames'), icon: Gamepad2 },
    { to: '/progress', label: t('progressTitle'), icon: BarChart3 },
    { to: '/survey', label: t('sideSurvey'), icon: ClipboardList },
    { to: '/trading', label: t('sideTrading'), icon: TrendingUp },
    { to: '/profile', label: t('sideProfile'), icon: User },
    { to: '/withdraw', label: t('sideWithdraw'), icon: ArrowDownToLine },
    { to: '/transactions', label: t('sideTransactions'), icon: Receipt },
    { to: '/settings', label: t('sideSettings'), icon: Settings },
  ];

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data } = await api.get('/api/user/profile');
        setRole(data.data.role);
      } catch {}
    };
    checkRole();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-900/70 backdrop-blur-xl border-l border-gray-800/50 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="p-5 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{t('appName')}</h1>
            <p className="text-gray-500 text-xs">{t('appDesc')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-l from-purple-600/20 to-cyan-600/20 text-white border border-purple-500/20 shadow-lg shadow-purple-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`
            }
          >
            <Icon className="w-5 h-5" /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800/50 space-y-1">
        {role === 'admin' && (
          <button onClick={() => navigate('/admin')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-orange-400 hover:bg-orange-500/5 transition-all w-full">
            <Shield className="w-5 h-5" /> {t('sideAdminPanel')}
          </button>
        )}
        {role === 'provider' && (
          <button onClick={() => navigate('/provider')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-amber-400 hover:bg-amber-500/5 transition-all w-full">
            <Briefcase className="w-5 h-5" /> {t('sideProviderPanel')}
          </button>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 w-full">
          <LogOut className="w-5 h-5" /> {t('sideLogout')}
        </button>
      </div>
    </aside>
  );
}
