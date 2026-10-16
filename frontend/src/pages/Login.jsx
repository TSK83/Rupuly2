import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Smartphone, Mail, KeyRound, Loader2, Gamepad2, Briefcase } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const [loginType, setLoginType] = useState('user'); // 'user' or 'provider'
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('mobile');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const isMobile = method === 'mobile';

  const isIdentifierValid = isMobile
    ? /^09\d{9}$/.test(identifier)
    : /^[\w.-]+@[\w.-]+\.\w{2,}$/.test(identifier);

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        // دریافت اطلاعات کاربر از گوگل و ارسال access_token
        const { data } = await api.post('/api/auth/google', { credential: tokenResponse.access_token });
        localStorage.setItem('token', data.data.token);
        handlePostLogin(data.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'خطا در ورود با گوگل');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('ورود با گوگل لغو شد'),
  });

  const handlePostLogin = (user) => {
    if (loginType === 'provider') {
      navigate('/provider');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/send-otp', { identifier });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ارسال کد تایید');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/verify-otp', { identifier, otp });
      localStorage.setItem('token', data.data.token);
      handlePostLogin(data.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در تایید کد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* بک‌گراند */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* لوگو */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 mb-4 shadow-lg shadow-purple-500/25">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">روپولی</h1>
          <p className="text-gray-400 text-sm">بازی کن، تست کن، پول بگیر 🎮</p>
        </div>

        {/* تب‌های لاگین — چسبیده به بالای باکس */}
        <div className="flex rounded-t-2xl overflow-hidden">
          <button
            onClick={() => { setLoginType('user'); setStep(1); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-300 ${
              loginType === 'user'
                ? 'bg-gray-800/60 text-white border-b-2 border-purple-500'
                : 'bg-gray-900/60 text-gray-500 hover:text-gray-300'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            کاربران
          </button>
          <button
            onClick={() => { setLoginType('provider'); setStep(1); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-300 ${
              loginType === 'provider'
                ? 'bg-gray-800/60 text-white border-b-2 border-orange-500'
                : 'bg-gray-900/60 text-gray-500 hover:text-gray-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            ارائه‌دهندگان
          </button>
        </div>

        {/* کارت فرم — چسبیده به تب‌ها */}
        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-b-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {step === 1
              ? loginType === 'provider' ? 'ورود ارائه‌دهنده' : 'ورود به حساب'
              : 'کد تایید'
            }
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              {/* گوگل */}
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-800 font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 mb-6 shadow-lg"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    ورود با گوگل
                  </>
                )}
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-700/50" />
                <span className="text-gray-500 text-xs">یا</span>
                <div className="flex-1 h-px bg-gray-700/50" />
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="flex bg-gray-900/60 rounded-xl p-1 gap-1">
                  <button type="button" onClick={() => { setMethod('mobile'); setIdentifier(''); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isMobile
                        ? `bg-gradient-to-l ${loginType === 'provider' ? 'from-orange-600 to-amber-600' : 'from-purple-600 to-cyan-600'} text-white shadow-lg`
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> موبایل
                  </button>
                  <button type="button" onClick={() => { setMethod('email'); setIdentifier(''); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      !isMobile
                        ? `bg-gradient-to-l ${loginType === 'provider' ? 'from-orange-600 to-amber-600' : 'from-purple-600 to-cyan-600'} text-white shadow-lg`
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-4 h-4" /> ایمیل
                  </button>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">{isMobile ? 'شماره موبایل' : 'آدرس ایمیل'}</label>
                  <div className="relative">
                    {isMobile
                      ? <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      : <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    }
                    <input
                      type={isMobile ? 'tel' : 'email'}
                      placeholder={isMobile ? '09123456789' : 'you@example.com'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      maxLength={isMobile ? 11 : 100}
                      className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 pr-11 pl-4 text-white text-left placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isIdentifierValid}
                  className={`w-full bg-gradient-to-l ${
                    loginType === 'provider' ? 'from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-500/20' : 'from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-purple-500/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ارسال کد تایید'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <p className="text-gray-400 text-sm text-center mb-4">
                کد ۵ رقمی ارسال‌شده به <span className="text-cyan-400 font-mono" dir="ltr">{identifier}</span> را وارد کنید
              </p>
              <div>
                <label className="block text-gray-300 text-sm mb-2">کد تایید</label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text" placeholder="12345" value={otp}
                    onChange={(e) => setOtp(e.target.value)} maxLength={5}
                    className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 pr-11 pl-4 text-white text-center text-lg tracking-[0.5em] placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
              <button
                type="submit" disabled={loading || otp.length !== 5}
                className={`w-full bg-gradient-to-l ${
                  loginType === 'provider' ? 'from-amber-600 to-orange-600 shadow-orange-500/20' : 'from-cyan-600 to-purple-600 shadow-cyan-500/20'
                } disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تایید و ورود'}
              </button>
              <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
              >
                {isMobile ? 'تغییر شماره موبایل' : 'تغییر ایمیل'}
              </button>
            </form>
          )}
        </div>

        <p className="text-gray-600 text-xs text-center mt-6">© ۲۰۲۶ روپولی — تمامی حقوق محفوظ است</p>
      </div>
    </div>
  );
}
