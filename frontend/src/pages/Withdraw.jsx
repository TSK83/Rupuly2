import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownToLine, Building2, Bitcoin, Loader2, CheckCircle2, DollarSign, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

export default function Withdraw() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const [method, setMethod] = useState('bank_transfer');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [usdtPrice, setUsdtPrice] = useState(null);
  const [usdtLoading, setUsdtLoading] = useState(true);

  const isBank = method === 'bank_transfer';

  // قیمت زنده تتر
  useEffect(() => {
    const fetchPrice = async () => {
      setUsdtLoading(true);
      try {
        const res = await fetch('https://api.nobitex.ir/v2/orderbook/USDTIRT');
        const data = await res.json();
        if (data.lastTradePrice) {
          setUsdtPrice(Number(data.lastTradePrice) / 10); // ریال → تومان
        }
      } catch { /* fallback */ }
      finally { setUsdtLoading(false); }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const usdtEquivalent = (amount && usdtPrice && usdtPrice > 0)
    ? (Number(amount) / usdtPrice).toFixed(4)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const { data } = await api.post('/api/user/withdraw', {
        amount: Number(amount),
        settlementMethod: method,
        destinationAddress: destination,
      });

      setSuccess(data);
      setAmount('');
      setDestination('');
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ثبت درخواست');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <ArrowDownToLine className="w-5 h-5 text-purple-400" />
        برداشت موجودی
      </h2>

      <div className="max-w-lg">
        {/* باکس قیمت تتر */}
        <div className="bg-gradient-to-l from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/15 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <span className="text-gray-400 text-xs block">قیمت لحظه‌ای تتر</span>
              {usdtLoading ? (
                <Loader2 className="w-4 h-4 text-green-400 animate-spin mt-1" />
              ) : usdtPrice ? (
                <p className="text-green-400 font-bold">{usdtPrice.toLocaleString('fa-IR')} <span className="text-xs text-gray-400">تومان</span></p>
              ) : (
                <p className="text-gray-500 text-sm">دریافت نشد</p>
              )}
            </div>
          </div>
          <span className="flex items-center gap-1 text-gray-500 text-xs">
            <RefreshCcw className="w-3 h-3" /> هر ۶۰ ثانیه
          </span>
        </div>

        {/* پیام موفقیت */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-medium">{success.message}</p>
            </div>
            <p className="text-gray-400 text-sm">
              موجودی جدید: {success.data?.newBalance?.toLocaleString('fa-IR')} تومان
            </p>
          </div>
        )}

        {/* خطا */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* انتخاب روش */}
          <div>
            <label className="block text-gray-300 text-sm mb-3">روش تسویه</label>
            <div className="flex bg-gray-900/60 rounded-xl p-1 gap-1">
              <button type="button" onClick={() => { setMethod('bank_transfer'); setDestination(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isBank ? 'bg-gradient-to-l from-purple-600 to-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}>
                <Building2 className="w-4 h-4" /> کارت بانکی / شبا
              </button>
              <button type="button" onClick={() => { setMethod('crypto'); setDestination(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  !isBank ? 'bg-gradient-to-l from-purple-600 to-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}>
                <Bitcoin className="w-4 h-4" /> رمز ارز (USDT)
              </button>
            </div>
          </div>

          {/* مبلغ */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">مبلغ (تومان)</label>
            <input type="number" placeholder="حداقل ۱۰,۰۰۰ تومان" value={amount}
              onChange={(e) => setAmount(e.target.value)} min={10000}
              className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white text-left placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
              dir="ltr"
            />
            {/* نمایش معادل تتر */}
            {!isBank && usdtEquivalent && (
              <div className="mt-2 bg-green-500/5 border border-green-500/15 rounded-xl px-4 py-2 flex items-center justify-between">
                <span className="text-gray-400 text-xs">معادل USDT:</span>
                <span className="text-green-400 font-mono font-bold" dir="ltr">≈ {usdtEquivalent} USDT</span>
              </div>
            )}
          </div>

          {/* آدرس مقصد */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              {isBank ? 'شماره شبا یا کارت' : 'آدرس ولت (TRC20 / ERC20)'}
            </label>
            <input type="text" placeholder={isBank ? 'IR123456789012345678901234' : 'T... یا 0x...'} value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white text-left placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm"
              dir="ltr"
            />
          </div>

          <button type="submit" disabled={loading || !amount || !destination}
            className="w-full bg-gradient-to-l from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ثبت درخواست برداشت'}
          </button>
        </form>
      </div>
    </div>
  );
}
