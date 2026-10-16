import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();
  const [provider, setProvider] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // بررسی وضعیت ارائه‌دهنده
        const statusRes = await api.get('/api/provider/status');
        const status = statusRes.data.data.status;

        if (status === 'pending') {
          setPendingApproval(true);
          setLoading(false);
          return;
        }

        if (status === 'approved') {
          const [profileRes, gamesRes] = await Promise.all([
            api.get('/api/provider/profile'),
            api.get('/api/provider/games'),
          ]);
          setProvider(profileRes.data.data);
          setGames(gamesRes.data.data);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setNeedsRegistration(true);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-orange-500 animate-spin" /></div>;
  }

  // نیاز به ثبت‌نام
  if (needsRegistration) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-600/20 to-amber-600/20 mb-6">
            <LayoutDashboard className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">ثبت‌نام ارائه‌دهنده</h2>
          <p className="text-gray-400 mb-6">برای شروع ابتدا پروفایل ارائه‌دهنده‌ خود را تکمیل کنید</p>
          <button onClick={() => navigate('/provider/profile')}
            className="bg-gradient-to-l from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20">
            تکمیل پروفایل
          </button>
        </div>
      </div>
    );
  }

  // در انتظار تایید ادمین
  if (pendingApproval) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-600/20 to-amber-600/20 mb-6">
            <Clock className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">در انتظار تایید</h2>
          <p className="text-gray-400">درخواست شما در حال بررسی توسط تیم روپولی است. لطفاً صبور باشید.</p>
        </div>
      </div>
    );
  }

  const draftGames = games.filter(g => g.status === 'draft').length;
  const confirmedGames = games.filter(g => g.status === 'confirmed').length;

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-orange-400" />
        خوش آمدید، {provider?.firstName}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/15 flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-orange-400" /></div>
            <span className="text-gray-400 text-sm">کل بازی‌ها</span>
          </div>
          <p className="text-2xl font-bold text-white">{games.length.toLocaleString('fa-IR')}</p>
        </div>

        <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/15 flex items-center justify-center"><Clock className="w-5 h-5 text-amber-400" /></div>
            <span className="text-gray-400 text-sm">پیش‌نویس</span>
          </div>
          <p className="text-2xl font-bold text-white">{draftGames.toLocaleString('fa-IR')}</p>
        </div>

        <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 hover:border-green-500/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/15 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-400" /></div>
            <span className="text-gray-400 text-sm">تایید شده</span>
          </div>
          <p className="text-2xl font-bold text-white">{confirmedGames.toLocaleString('fa-IR')}</p>
        </div>
      </div>
    </div>
  );
}
