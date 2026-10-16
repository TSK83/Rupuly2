import { useState, useEffect } from 'react';
import { Inbox, Wallet, Briefcase, CheckCircle2, XCircle, Loader2, Clock, DollarSign } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';

export default function AdminRequests() {
  const [tab, setTab] = useState('withdrawals'); // 'withdrawals' | 'providers'
  const [transactions, setTransactions] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [usdtPrice, setUsdtPrice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, provRes] = await Promise.all([
          api.get('/api/admin/transactions'),
          api.get('/api/admin/providers?status=pending'),
        ]);
        setTransactions(txRes.data.data);
        setProviders(provRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();

    // قیمت تتر
    const fetchUsdtPrice = async () => {
      try {
        const res = await fetch('https://api.nobitex.ir/v2/orderbook/USDTIRT');
        const data = await res.json();
        if (data.lastTradePrice) {
          setUsdtPrice(Number(data.lastTradePrice) / 10); // ریال → تومان
        }
      } catch { /* fallback */ }
    };
    fetchUsdtPrice();
    const interval = setInterval(fetchUsdtPrice, 60000); // هر ۶۰ ثانیه
    return () => clearInterval(interval);
  }, []);

  const handleWithdrawalAction = async (txId, status) => {
    setActionLoading(txId);
    try {
      await api.put(`/api/admin/transactions/${txId}`, { status });
      const { data } = await api.get('/api/admin/transactions');
      setTransactions(data.data);
    } catch (err) { alert('خطا'); }
    finally { setActionLoading(null); }
  };

  const handleProviderAction = async (providerId, status) => {
    setActionLoading(providerId);
    try {
      await api.put(`/api/admin/providers/${providerId}`, { status });
      const { data } = await api.get('/api/admin/providers?status=pending');
      setProviders(data.data);
    } catch (err) { alert('خطا'); }
    finally { setActionLoading(null); }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;
  }

  const pendingWithdrawals = transactions.filter(t => t.status === 'pending');

  const toUsdt = (toman) => {
    if (!usdtPrice || usdtPrice <= 0) return '—';
    return (toman / usdtPrice).toFixed(2);
  };
  const { isRtl } = useLanguage();

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Inbox className="w-5 h-5 text-purple-400" />
          درخواست‌ها
        </h2>

        {/* قیمت زنده تتر */}
        {usdtPrice && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">USDT: {usdtPrice?.toLocaleString('fa-IR')} تومان</span>
            <span className="text-gray-500 text-xs">(زنده)</span>
          </div>
        )}
      </div>

      {/* تب‌ها */}
      <div className="flex bg-gray-800/40 rounded-xl p-1 gap-1 mb-6">
        <button onClick={() => setTab('withdrawals')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'withdrawals' ? 'bg-purple-600/20 text-white border border-purple-500/25' : 'text-gray-400 hover:text-white'
          }`}>
          <Wallet className="w-4 h-4" />
          برداشت وجه
          {pendingWithdrawals.length > 0 && (
            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{pendingWithdrawals.length}</span>
          )}
        </button>
        <button onClick={() => setTab('providers')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'providers' ? 'bg-orange-600/20 text-white border border-orange-500/25' : 'text-gray-400 hover:text-white'
          }`}>
          <Briefcase className="w-4 h-4" />
          ارائه‌دهندگان
          {providers.length > 0 && (
            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{providers.length}</span>
          )}
        </button>
      </div>

      {/* تب برداشت وجه */}
      {tab === 'withdrawals' && (
        <div className="space-y-3">
          {pendingWithdrawals.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-12 text-center">
              <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">درخواست برداشتی وجود ندارد</p>
            </div>
          ) : (
            pendingWithdrawals.map((tx) => (
              <div key={tx._id} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-600/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium" dir="ltr">{tx.userId?.mobile || tx.userId?.email || '—'}</p>
                      <p className="text-gray-500 text-xs mt-1">{new Date(tx.createdAt).toLocaleDateString('fa-IR')}</p>
                    </div>
                  </div>
                </div>

                {/* مبلغ تومانی + معادل تتر */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-900/50 rounded-xl p-3">
                    <span className="text-gray-500 text-xs block mb-1">مبلغ (تومان)</span>
                    <p className="text-cyan-400 font-bold text-lg">{tx.amount?.toLocaleString('fa-IR')}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-3">
                    <span className="text-gray-500 text-xs block mb-1">معادل تتر (USDT)</span>
                    <p className="text-green-400 font-bold text-lg" dir="ltr">≈ {toUsdt(tx.amount)} $</p>
                  </div>
                </div>

                {/* اطلاعات حساب */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div><span className="text-gray-500">مقصد:</span> <span className="text-white font-mono text-xs" dir="ltr">{tx.destinationAddress}</span></div>
                  <div><span className="text-gray-500">نوع:</span> <span className="text-white">{tx.settlementMethod === 'crypto' ? 'رمز ارز' : 'بانکی'}</span></div>
                </div>

                {/* دکمه‌ها */}
                <div className="flex gap-2">
                  <button onClick={() => handleWithdrawalAction(tx._id, 'completed')} disabled={actionLoading === tx._id}
                    className="bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm px-5 py-2 rounded-xl flex items-center gap-2 transition-all">
                    {actionLoading === tx._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} تایید و واریز
                  </button>
                  <button onClick={() => handleWithdrawalAction(tx._id, 'failed')} disabled={actionLoading === tx._id}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm px-5 py-2 rounded-xl flex items-center gap-2 transition-all">
                    <XCircle className="w-4 h-4" /> رد
                  </button>
                </div>
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
              <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">درخواست ارائه‌دهنده‌ای وجود ندارد</p>
            </div>
          ) : (
            providers.map((provider) => (
              <div key={provider._id} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{provider.firstName} {provider.lastName}</p>
                      <p className="text-gray-500 text-xs mt-1" dir="ltr">{provider.userId?.mobile || provider.userId?.email}</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 bg-yellow-500/10 text-xs px-3 py-1 rounded-full border border-yellow-500/25">در انتظار</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                  <div><span className="text-gray-500">کد ملی:</span> <span className="text-white" dir="ltr">{provider.nationalId}</span></div>
                  <div><span className="text-gray-500">سازمان:</span> <span className="text-white">{provider.organizationName || '—'}</span></div>
                  <div><span className="text-gray-500">تاریخ:</span> <span className="text-white">{new Date(provider.createdAt).toLocaleDateString('fa-IR')}</span></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleProviderAction(provider._id, 'approved')} disabled={actionLoading === provider._id}
                    className="bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm px-5 py-2 rounded-xl flex items-center gap-2 transition-all">
                    {actionLoading === provider._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} تایید
                  </button>
                  <button onClick={() => handleProviderAction(provider._id, 'rejected')} disabled={actionLoading === provider._id}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm px-5 py-2 rounded-xl flex items-center gap-2 transition-all">
                    <XCircle className="w-4 h-4" /> رد
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
