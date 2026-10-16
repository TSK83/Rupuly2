import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Gamepad2, CheckCircle2, Clock, Lock, XCircle, Loader2, ChevronDown, ChevronUp, Trophy, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

export default function GameProgress() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGame, setExpandedGame] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await api.get('/api/games');
        const allGames = data.data;

        // برای هر بازی، جزئیات و پیشرفت را دریافت کن
        const gamesWithProgress = await Promise.all(
          allGames.map(async (game) => {
            try {
              const detailRes = await api.get(`/api/games/${game._id}`);
              return detailRes.data.data;
            } catch {
              return null;
            }
          })
        );

        setGames(gamesWithProgress.filter(Boolean));
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: t('progressCompleted') };
      case 'started':
        return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: t('progressActive') };
      case 'failed':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: t('progressFailed') };
      default:
        return { icon: Lock, color: 'text-gray-600', bg: 'bg-gray-500/5', border: 'border-gray-700/20', label: t('progressLocked') };
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        {t('progressTitle')}
      </h2>

      {games.length === 0 ? (
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-12 text-center">
          <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">{t('progressNoGames')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map(({ game, installed, assignments }) => {
            if (!installed) return null;

            const total = assignments.length;
            const completed = assignments.filter(a => a.userStatus === 'completed').length;
            const active = assignments.filter(a => a.userStatus === 'started').length;
            const failed = assignments.filter(a => a.userStatus === 'failed').length;
            const locked = assignments.filter(a => a.userStatus === 'locked').length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isExpanded = expandedGame === game._id;

            return (
              <div key={game._id} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl overflow-hidden transition-all">
                {/* هدر بازی */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-800/60 transition-all"
                  onClick={() => setExpandedGame(isExpanded ? null : game._id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{game.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-green-400">{completed} {t('progressCompleted')}</span>
                          {active > 0 && <span className="text-amber-400">{active} {t('progressActive')}</span>}
                          {failed > 0 && <span className="text-red-400">{failed} {t('progressFailed')}</span>}
                          {locked > 0 && <span className="text-gray-500">{locked} {t('progressLocked')}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* درصد پیشرفت */}
                      <div className="text-center">
                        <div className="relative w-14 h-14">
                          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-700/30" />
                            <circle
                              cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4"
                              className={percentage === 100 ? 'text-green-400' : 'text-purple-400'}
                              strokeDasharray={`${2 * Math.PI * 24}`}
                              strokeDashoffset={`${2 * Math.PI * 24 * (1 - percentage / 100)}`}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xs font-bold ${percentage === 100 ? 'text-green-400' : 'text-white'}`}>
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-5 h-5 text-gray-500" />
                        : <ChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </div>
                  </div>

                  {/* نوار پیشرفت */}
                  <div className="w-full bg-gray-700/30 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ease-out ${
                        percentage === 100
                          ? 'bg-gradient-to-l from-green-500 to-emerald-500'
                          : 'bg-gradient-to-l from-purple-500 to-cyan-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* لیست تکالیف (باز شده) */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-700/30 pt-4 space-y-2 animate-fade-up">
                    {assignments.map((a, i) => {
                      const config = getStatusConfig(a.userStatus);
                      const StatusIcon = config.icon;

                      return (
                        <div
                          key={a._id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${config.bg} ${config.border}`}
                        >
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`w-4 h-4 ${config.color}`} />
                            <div>
                              <p className={`text-sm font-medium ${a.userStatus === 'locked' ? 'text-gray-500' : 'text-white'}`}>
                                {i + 1}. {a.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs">
                                <span className="text-cyan-400">{a.reward?.toLocaleString(isRtl ? 'fa-IR' : 'en-US')} {t('toman')}</span>
                                <span className="text-gray-500">{a.timeLimitDays} {t('day')}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                        </div>
                      );
                    })}

                    {/* دکمه مشاهده بازی */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/game/${game._id}`); }}
                      className="w-full mt-3 bg-gradient-to-l from-purple-600/20 to-cyan-600/20 border border-purple-500/20 text-purple-400 text-sm font-medium py-2.5 rounded-xl hover:from-purple-600/30 hover:to-cyan-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Target className="w-4 h-4" />
                      {t('dashView')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
