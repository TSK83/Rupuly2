import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Wallet, Loader2, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [games, setGames] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, profileRes] = await Promise.all([
          api.get('/api/games'),
          api.get('/api/user/profile'),
        ]);
        setGames(gamesRes.data.data);
        setProfile(profileRes.data.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;
  }

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* باکس موجودی بالای صفحه */}
      <div className="bg-gradient-to-l from-purple-600/20 to-cyan-600/20 border border-purple-500/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-gray-400 text-xs">{t('dashBalance')}</span>
            <p className="text-white font-bold text-lg">{profile?.balance?.toLocaleString(isRtl ? 'fa-IR' : 'en-US') || '0'} <span className="text-sm text-gray-400">{t('toman')}</span></p>
          </div>
        </div>
        {profile?.pendingBalance > 0 && (
          <div className="text-left">
            <span className="text-yellow-400 text-xs">{t('dashPending')}</span>
            <p className="text-yellow-400 font-medium text-sm">{profile.pendingBalance?.toLocaleString(isRtl ? 'fa-IR' : 'en-US')} {t('toman')}</p>
          </div>
        )}
      </div>

      {/* لیست بازی‌ها */}
      <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <Gamepad2 className="w-5 h-5 text-purple-400" />
        {t('dashActiveGames')}
      </h2>

      {games.length === 0 ? (
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-12 text-center">
          <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">{t('dashNoGames')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {games.map((game) => (
            <div key={game._id}
              onClick={() => navigate(`/game/${game._id}`)}
              className="group bg-gray-800/40 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center group-hover:from-purple-600/30 group-hover:to-cyan-600/30 transition-all">
                  <Gamepad2 className="w-6 h-6 text-purple-400" />
                </div>
                <span className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20">{t('dashActive')}</span>
              </div>

              <h3 className="text-white font-semibold text-lg mb-1">{game.title}</h3>
              {game.description && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{game.description}</p>}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/30">
                <span className="text-gray-500 text-xs">
                  {game.providerId?.firstName} {game.providerId?.lastName}
                </span>
                <div className="bg-gradient-to-l from-purple-600 to-cyan-600 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/15">
                  <Play className="w-4 h-4" /> {t('dashView')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
