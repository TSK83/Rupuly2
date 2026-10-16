import { useState, useEffect } from 'react';
import { Users, Briefcase, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp, Eye, Clock, Wallet } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';

export default function AdminUsers() {
  const [tab, setTab] = useState('users'); // 'users' | 'providers'
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, providersRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/providers'),
        ]);
        setUsers(usersRes.data.data);
        setProviders(providersRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleProviderAction = async (providerId, status) => {
    setActionLoading(providerId);
    try {
      await api.put(`/api/admin/providers/${providerId}`, { status });
      const { data } = await api.get('/api/admin/providers');
      setProviders(data.data);
    } catch (err) { alert('خطا'); }
    finally { setActionLoading(null); }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;
  }

  const pendingProviders = providers.filter(p => p.status === 'pending');
  const regularUsers = users.filter(u => u.role === 'user' || u.role === 'admin');
  const { isRtl } = useLanguage();

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-400" />
        مخاطبان
      </h2>

      {/* تب‌ها */}
      <div className="flex bg-gray-800/40 rounded-xl p-1 gap-1 mb-6">
        <button onClick={() => setTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'users' ? 'bg-purple-600/20 text-white border border-purple-500/25' : 'text-gray-400 hover:text-white'
          }`}>
          <Users className="w-4 h-4" />
          کاربران ({regularUsers.length})
        </button>
        <button onClick={() => setTab('providers')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'providers' ? 'bg-orange-600/20 text-white border border-orange-500/25' : 'text-gray-400 hover:text-white'
          }`}>
          <Briefcase className="w-4 h-4" />
          ارائه‌دهندگان ({providers.length})
          {pendingProviders.length > 0 && (
            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {pendingProviders.length}
            </span>
          )}
        </button>
      </div>

      {/* تب کاربران */}
      {tab === 'users' && (
        <div className="space-y-3">
          {regularUsers.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-12 text-center">
              <p className="text-gray-500">کاربری ثبت‌نام نکرده</p>
            </div>
          ) : (
            regularUsers.map((user) => (
              <div key={user._id} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl overflow-hidden">
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-800/60 transition-all"
                  onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                      <span className="text-purple-400 text-sm font-bold">
                        {(user.mobile || user.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium" dir="ltr">{user.mobile || user.email || '—'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-500 text-xs">
                          موجودی: <span className="text-cyan-400">{user.balance?.toLocaleString('fa-IR')} تومان</span>
                        </span>
                        {user.role === 'admin' && (
                          <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-500/20">ادمین</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</span>
                    {expandedUser === user._id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>

                {/* جزئیات کاربر */}
                {expandedUser === user._id && (
                  <div className="px-5 pb-5 border-t border-gray-700/30 pt-4 animate-fade-up">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div><span className="text-gray-500">موبایل:</span> <span className="text-white" dir="ltr">{user.mobile || '—'}</span></div>
                      <div><span className="text-gray-500">ایمیل:</span> <span className="text-white" dir="ltr">{user.email || '—'}</span></div>
                      <div><span className="text-gray-500">موجودی:</span> <span className="text-cyan-400">{user.balance?.toLocaleString('fa-IR')} تومان</span></div>
                      <div><span className="text-gray-500">کل درآمد:</span> <span className="text-green-400">{user.totalEarnings?.toLocaleString('fa-IR') || '۰'} تومان</span></div>
                      <div><span className="text-gray-500">در انتظار:</span> <span className="text-yellow-400">{user.pendingBalance?.toLocaleString('fa-IR') || '۰'} تومان</span></div>
                      <div><span className="text-gray-500">نقش:</span> <span className="text-white">{user.role}</span></div>
                      <div><span className="text-gray-500">شبا:</span> <span className="text-white" dir="ltr">{user.shebaNumber || '—'}</span></div>
                      <div><span className="text-gray-500">کیف‌پول:</span> <span className="text-white" dir="ltr">{user.walletAddress || '—'}</span></div>
                      <div><span className="text-gray-500">تاریخ عضویت:</span> <span className="text-white">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* تب ارائه‌دهندگان */}
      {tab === 'providers' && (
        <div className="space-y-3">
          {providers.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-12 text-center">
              <p className="text-gray-500">ارائه‌دهنده‌ای ثبت‌نام نکرده</p>
            </div>
          ) : (
            providers.map((provider) => {
              const statusConfig = {
                pending: { label: 'در انتظار', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25' },
                approved: { label: 'تایید شده', color: 'text-green-400 bg-green-500/10 border-green-500/25' },
                rejected: { label: 'رد شده', color: 'text-red-400 bg-red-500/10 border-red-500/25' },
              };
              const sc = statusConfig[provider.status];

              return (
                <div key={provider._id} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl overflow-hidden">
                  <div
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-800/60 transition-all"
                    onClick={() => setExpandedProvider(expandedProvider === provider._id ? null : provider._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{provider.firstName} {provider.lastName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-500 text-xs" dir="ltr">{provider.userId?.mobile || provider.userId?.email || '—'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedProvider === provider._id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </div>

                  {/* جزئیات ارائه‌دهنده */}
                  {expandedProvider === provider._id && (
                    <div className="px-5 pb-5 border-t border-gray-700/30 pt-4 animate-fade-up">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                        <div><span className="text-gray-500">نام:</span> <span className="text-white">{provider.firstName}</span></div>
                        <div><span className="text-gray-500">نام‌خانوادگی:</span> <span className="text-white">{provider.lastName}</span></div>
                        <div><span className="text-gray-500">کد ملی:</span> <span className="text-white" dir="ltr">{provider.nationalId}</span></div>
                        <div><span className="text-gray-500">سازمان:</span> <span className="text-white">{provider.organizationName || '—'}</span></div>
                        <div><span className="text-gray-500">تاریخ ثبت:</span> <span className="text-white">{new Date(provider.createdAt).toLocaleDateString('fa-IR')}</span></div>
                        <div><span className="text-gray-500">وضعیت:</span> <span className={sc.color.split(' ')[0]}>{sc.label}</span></div>
                      </div>

                      {/* دکمه‌های تایید/رد */}
                      {provider.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleProviderAction(provider._id, 'approved')}
                            disabled={actionLoading === provider._id}
                            className="bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm px-5 py-2 rounded-xl flex items-center gap-2 transition-all"
                          >
                            {actionLoading === provider._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} تایید
                          </button>
                          <button
                            onClick={() => handleProviderAction(provider._id, 'rejected')}
                            disabled={actionLoading === provider._id}
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm px-5 py-2 rounded-xl flex items-center gap-2 transition-all"
                          >
                            <XCircle className="w-4 h-4" /> رد
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
