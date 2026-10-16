import { useState, useEffect } from 'react';
import { User, Wallet, Clock, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, isRtl } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, rewardsRes] = await Promise.all([
          api.get('/api/user/profile'),
          api.get('/api/games/rewards/me'),
        ]);
        setProfile(profileRes.data.data);
        setRewards(rewardsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-purple-400" />
        {t('profileTitle')}
      </h2>

      {/* اطلاعات کاربر */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-white font-medium text-lg" dir="ltr">{profile?.mobile || profile?.email || '—'}</p>
            <p className="text-gray-500 text-sm">عضویت: {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('fa-IR') : '—'}</p>
          </div>
        </div>
      </div>

      {/* ۳ باکس مالی */}
      <div className="space-y-4 mb-8">
        {/* باکس ۱: مجموع کل درآمد — بالا */}
        <div className="bg-gradient-to-l from-purple-600/15 to-cyan-600/15 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">مجموع کل درآمد</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {profile?.totalEarnings?.toLocaleString('fa-IR') || '۰'}
            <span className="text-base text-gray-400 mr-2">تومان</span>
          </p>
        </div>

        {/* باکس ۲ و ۳: کنار هم — پایین */}
        <div className="grid grid-cols-2 gap-4">
          {/* وجه قابل برداشت */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-green-400" />
              <span className="text-gray-400 text-xs">قابل برداشت</span>
            </div>
            <p className="text-xl font-bold text-green-400">
              {profile?.balance?.toLocaleString('fa-IR') || '۰'}
              <span className="text-xs text-gray-500 mr-1">تومان</span>
            </p>
          </div>

          {/* وجه در انتظار */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400 text-xs">در انتظار تایید</span>
            </div>
            <p className="text-xl font-bold text-yellow-400">
              {profile?.pendingBalance?.toLocaleString('fa-IR') || '۰'}
              <span className="text-xs text-gray-500 mr-1">تومان</span>
            </p>
          </div>
        </div>
      </div>

      {/* لیست پاداش‌ها */}
      <h3 className="text-lg font-semibold text-white mb-4">تاریخچه پاداش‌ها</h3>

      {rewards.length === 0 ? (
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-8 text-center">
          <p className="text-gray-500">هنوز پاداشی دریافت نشده</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rewards.map((reward) => {
            const isReceived = reward.status === 'instant' || reward.status === 'released';
            const isPending = reward.status === 'pending';

            return (
              <div key={reward._id}
                className={`border rounded-2xl p-4 ${
                  isReceived
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-yellow-500/5 border-yellow-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium text-sm ${isReceived ? 'text-green-400' : 'text-yellow-400'}`}>
                      {reward.assignmentId?.title || 'تکلیف'}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {reward.gameId?.title} • {new Date(reward.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${isReceived ? 'text-green-400' : 'text-yellow-400'}`}>
                      +{reward.amount?.toLocaleString('fa-IR')}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {isReceived ? (
                        <><CheckCircle2 className="w-3 h-3 text-green-400" /><span className="text-green-400 text-xs">دریافت شده</span></>
                      ) : (
                        <><Clock className="w-3 h-3 text-yellow-400" /><span className="text-yellow-400 text-xs">
                          آزاد: {reward.releaseDate ? new Date(reward.releaseDate).toLocaleDateString('fa-IR') : '—'}
                        </span></>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
