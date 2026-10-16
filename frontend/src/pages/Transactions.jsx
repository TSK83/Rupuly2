import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Loader2, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

const statusMap = {
  pending: { label: 'در انتظار', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25', icon: Clock },
  processing: { label: 'در حال پردازش', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25', icon: RefreshCw },
  completed: { label: 'تکمیل‌شده', color: 'text-green-400 bg-green-500/10 border-green-500/25', icon: CheckCircle2 },
  failed: { label: 'ناموفق', color: 'text-red-400 bg-red-500/10 border-red-500/25', icon: XCircle },
};

const methodLabels = {
  bank_transfer: 'بانکی',
  crypto: 'کریپتو',
};

export default function Transactions() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await api.get('/api/user/transactions');
        setTransactions(data.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Receipt className="w-5 h-5 text-purple-400" />
        {t('txTitle')}
      </h2>

      {transactions.length === 0 ? (
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-12 text-center">
          <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">{t('txNoTx')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const status = statusMap[tx.status] || statusMap.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={tx._id}
                className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 hover:border-gray-600/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <p className="text-white font-bold text-lg">
                      {tx.amount?.toLocaleString('fa-IR')}
                      <span className="text-sm text-gray-500 mr-1">تومان</span>
                    </p>
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      روش: <span className="text-gray-300">{methodLabels[tx.settlementMethod] || tx.settlementMethod}</span>
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(tx.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-700/30">
                  <p className="text-gray-500 text-xs">
                    مقصد: <span className="text-gray-400 font-mono" dir="ltr">{tx.destinationAddress}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
