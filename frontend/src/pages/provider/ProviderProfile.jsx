import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';

export default function ProviderProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', nationalId: '', organizationName: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/api/provider/profile');
        const p = data.data;
        setForm({ firstName: p.firstName, lastName: p.lastName, nationalId: p.nationalId, organizationName: p.organizationName || '' });
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 404) {
          setIsNew(true);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isNew) {
        await api.post('/api/provider/register', form);
        setSuccess('درخواست شما ثبت شد و در انتظار تایید ادمین است');
        setTimeout(() => navigate('/provider'), 2000);
      } else {
        await api.put('/api/provider/profile', form);
        setSuccess('پروفایل بروزرسانی شد');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'خطا');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-orange-500 animate-spin" /></div>;
  }
  const { isRtl } = useLanguage();

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-orange-400" />
        {isNew ? 'ثبت‌نام ارائه‌دهنده' : 'پروفایل ارائه‌دهنده'}
      </h2>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6 text-green-400 text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}

      <form onSubmit={handleSubmit} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-6 max-w-lg space-y-5">
        <div>
          <label className="block text-gray-300 text-sm mb-2">نام *</label>
          <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required
            className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">نام خانوادگی *</label>
          <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required
            className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">کد ملی *</label>
          <input type="text" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} required maxLength={10}
            disabled={!isNew} dir="ltr"
            className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all disabled:opacity-50" />
          {!isNew && <p className="text-gray-500 text-xs mt-1">کد ملی قابل تغییر نیست</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">نام سازمان (اختیاری)</label>
          <input type="text" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
            className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
        </div>
        <button type="submit" disabled={saving}
          className="bg-gradient-to-l from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isNew ? 'ثبت درخواست' : 'ذخیره تغییرات'}
        </button>
      </form>
    </div>
  );
}
