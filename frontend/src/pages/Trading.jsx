import { TrendingUp, Construction } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Trading() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="flex-1 flex items-center justify-center p-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 mb-6">
          <TrendingUp className="w-10 h-10 text-emerald-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">{t('tradingTitle')}</h2>

        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-5 py-2.5">
          <Construction className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium">{t('comingSoon')}</span>
        </div>
      </div>
    </div>
  );
}
