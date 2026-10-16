import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Gamepad2, Receipt, Clock, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/stats');
        setStats(data.data);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'کل کاربران', value: stats?.totalUsers, icon: Users, color: 'purple' },
    { label: 'تسک‌های فعال', value: stats?.totalTasks, icon: Gamepad2, color: 'cyan' },
    { label: 'کل تراکنش‌ها', value: stats?.totalTransactions, icon: Receipt, color: 'green' },
    { label: 'برداشت در انتظار', value: stats?.pendingWithdrawals, icon: Clock, color: 'amber' },
  ];

  const colorMap = {
    purple: { bg: 'bg-purple-600/15', text: 'text-purple-400', border: 'hover:border-purple-500/30' },
    cyan: { bg: 'bg-cyan-600/15', text: 'text-cyan-400', border: 'hover:border-cyan-500/30' },
    green: { bg: 'bg-green-600/15', text: 'text-green-400', border: 'hover:border-green-500/30' },
    amber: { bg: 'bg-amber-600/15', text: 'text-amber-400', border: 'hover:border-amber-500/30' },
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        داشبورد ادمین
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 transition-all duration-300 ${colorMap[color].border}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${colorMap[color].bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colorMap[color].text}`} />
              </div>
              <span className="text-gray-400 text-sm">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value?.toLocaleString('fa-IR') || '۰'}</p>
          </div>
        ))}
      </div>

      {/* مبلغ کل پرداختی */}
      <div className="bg-gradient-to-l from-purple-600/20 to-cyan-600/20 border border-purple-500/20 rounded-2xl p-6">
        <p className="text-gray-400 text-sm mb-2">مجموع پرداخت‌ها</p>
        <p className="text-3xl font-bold text-white">
          {stats?.totalPaidOut?.toLocaleString('fa-IR') || '۰'}
          <span className="text-base text-gray-400 mr-2">تومان</span>
        </p>
      </div>
    </div>
  );
}
