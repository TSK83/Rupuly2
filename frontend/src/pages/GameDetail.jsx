import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gamepad2, Clock, CheckCircle2, XCircle, Lock, Download, Loader2, ArrowLeft, Sparkles, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

const typeLabels = { main: 'اصلی', bonus: 'تشویقی', daily: 'روزمره' };
const typeColors = { main: 'text-purple-400 bg-purple-500/10 border-purple-500/25', bonus: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25', daily: 'text-green-400 bg-green-500/10 border-green-500/25' };

export default function GameDetail() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [completing, setCompleting] = useState(null);
  const { t, isRtl } = useLanguage();

  const fetchGame = async () => {
    try {
      const res = await api.get(`/api/games/${gameId}`);
      setData(res.data.data);
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGame(); }, [gameId]);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await api.post(`/api/games/${gameId}/install`);
      fetchGame();
    } catch (err) {
      alert(err.response?.data?.message || 'خطا');
    } finally {
      setInstalling(false);
    }
  };

  const handleComplete = async (assignmentId) => {
    setCompleting(assignmentId);
    try {
      const res = await api.post(`/api/games/assignments/${assignmentId}/complete`);
      alert(res.data.message);
      fetchGame();
    } catch (err) {
      alert(err.response?.data?.message || 'خطا');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;
  if (!data) return null;

  const { game, installed, assignments } = data;

  const getStatusIcon = (a) => {
    if (a.userStatus === 'completed') return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (a.userStatus === 'failed') return <XCircle className="w-5 h-5 text-red-400" />;
    if (a.userStatus === 'started') return <Clock className="w-5 h-5 text-amber-400" />;
    return <Lock className="w-5 h-5 text-gray-600" />;
  };

  const getTimeRemaining = (deadline) => {
    if (!deadline) return '';
    const remaining = new Date(deadline) - new Date();
    if (remaining <= 0) return 'منقضی';
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} روز و ${hours} ساعت`;
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* هدر */}
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> بازگشت
      </button>

      <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
              </div>
              {game.title}
            </h2>
            {game.description && <p className="text-gray-400 text-sm mt-2">{game.description}</p>}
            <p className="text-gray-500 text-xs mt-2">ارائه‌دهنده: {game.providerId?.firstName} {game.providerId?.lastName}</p>
          </div>
        </div>

        {/* دکمه نصب */}
        {!installed && (
          <button onClick={handleInstall} disabled={installing}
            className="mt-5 bg-gradient-to-l from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20">
            {installing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> نصب کردم — شروع تکالیف</>}
          </button>
        )}

        {installed && (
          <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" /> نصب شده — تکالیف فعال
          </div>
        )}
      </div>

      {/* لیست تکالیف */}
      <h3 className="text-lg font-semibold text-white mb-4">تکالیف</h3>
      <div className="space-y-3">
        {assignments.map((a, i) => {
          const isActive = a.userStatus === 'started';
          const isDone = a.userStatus === 'completed';
          const isFailed = a.userStatus === 'failed';
          const isLocked = a.userStatus === 'locked';

          return (
            <div key={a._id} className={`border rounded-2xl p-5 transition-all ${
              isDone ? 'bg-green-500/5 border-green-500/20'
                : isFailed ? 'bg-red-500/5 border-red-500/20'
                : isActive ? 'bg-gray-800/50 border-purple-500/20'
                : 'bg-gray-800/20 border-gray-700/20 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(a)}
                  <div>
                    <p className={`font-medium ${isDone ? 'text-green-400' : isFailed ? 'text-red-400' : 'text-white'}`}>
                      {i + 1}. {a.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className={`px-2 py-0.5 rounded-full border ${typeColors[a.type]}`}>{typeLabels[a.type]}</span>
                      <span className="text-cyan-400">{a.reward?.toLocaleString('fa-IR')} تومان</span>
                      <span className="text-gray-500">{a.timeLimitDays} روز</span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  {isActive && a.deadline && (
                    <div className="text-xs text-amber-400 mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeRemaining(a.deadline)}
                    </div>
                  )}
                  {isActive && (
                    <button onClick={() => handleComplete(a._id)} disabled={completing === a._id}
                      className="bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                      {completing === a._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> تکمیل</>}
                    </button>
                  )}
                  {isDone && <span className="text-green-400 text-xs">✅ انجام شد</span>}
                  {isFailed && <span className="text-red-400 text-xs">❌ منقضی</span>}
                  {isLocked && <span className="text-gray-600 text-xs">🔒 قفل</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
