import { useState, useEffect } from 'react';
import { Receipt, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';

const statusMap = {
  pending: { label: 'در انتظار', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25' },
  processing: { label: 'در حال پردازش', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  completed: { label: 'تکمیل‌شده', color: 'text-green-400 bg-green-500/10 border-green-500/25' },
  failed: { label: 'رد شده', color: 'text-red-400 bg-red-500/10 border-red-500/25' },
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTransactions = async () => {
    try {
      const url = filter ? `/api/admin/transactions?status=${filter}` : '/api/admin/transactions';
      const { data } = await api.get(url);
      setTransactions(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [filter]);

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await api.put(`/api/admin/transactions/${id}`, { status });
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'خطا');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }
  const { isRtl } = useLanguage();

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-purple-400" />
          مدیریت تراکنش‌ها
        </h2>
        <button onClick={fetchTransactions} className="p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* فیلتر */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: '', label: 'همه' },
          { value: 'pending', label: 'در انتظار' },
          { value: 'processing', label: 'در حال پردازش' },
          { value: 'completed', label: 'تکمیل‌شده' },
          { value: 'failed', label: 'رد شده' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setLoading(true); setFilter(value); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {transactions.length === 0 ? (
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-12 text-center">
          <p className="text-gray-500">تراکنشی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const status = statusMap[tx.status] || statusMap.pending;

            return (
              <div key={tx._id} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-bold text-lg">
                      {tx.amount?.toLocaleString('fa-IR')}
                      <span className="text-sm text-gray-500 mr-1">تومان</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1" dir="ltr">
                      {tx.userId?.mobile || tx.userId?.email || '—'}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  <span>روش: {tx.settlementMethod === 'bank_transfer' ? 'بانکی' : 'کریپتو'}</span>
                  <span className="mx-2">|</span>
                  <span dir="ltr" className="text-gray-400 font-mono text-xs">{tx.destinationAddress}</span>
                </div>

                {/* دکمه‌های عمل */}
                {tx.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-700/30">
                    <button
                      onClick={() => updateStatus(tx._id, 'completed')}
                      disabled={actionLoading === tx._id}
                      className="bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                    >
                      {actionLoading === tx._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      تایید
                    </button>
                    <button
                      onClick={() => updateStatus(tx._id, 'failed')}
                      disabled={actionLoading === tx._id}
                      className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <X className="w-4 h-4" />
                      رد
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
