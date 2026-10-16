import { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Bell, BellOff, Globe, Palette, Monitor, Save, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useColorPalette, colorPalettes } from '../contexts/ColorPaletteContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { palette, setPalette } = useColorPalette();
  const [notifications, setNotifications] = useState(() => localStorage.getItem('rupuly-notif') !== 'off');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('rupuly-notif', notifications ? 'on' : 'off');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeOptions = [
    { value: 'dark', label: t('settingsThemeDark'), icon: Moon, desc: t('settingsThemeDarkDesc'), gradient: 'from-gray-800 to-gray-900', border: 'border-purple-500/40', ring: 'ring-purple-500/20' },
    { value: 'light', label: t('settingsThemeLight'), icon: Sun, desc: t('settingsThemeLightDesc'), gradient: 'from-amber-50 to-orange-50', border: 'border-amber-500/40', ring: 'ring-amber-500/20' },
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold theme-text mb-8 flex items-center gap-2">
        <SettingsIcon className="w-5 h-5 text-purple-400" />
        {t('settingsTitle')}
      </h2>

      {/* پیام ذخیره */}
      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6 text-green-400 text-sm flex items-center gap-2 animate-fade-up">
          <CheckCircle2 className="w-4 h-4" /> {t('settingsSaved')}
        </div>
      )}

      <div className="space-y-8 max-w-2xl">
        {/* ═══════════ تم سایت ═══════════ */}
        <div>
          <h3 className="theme-text font-semibold mb-1 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            {t('settingsAppearance')}
          </h3>
          <p className="theme-text-secondary text-sm mb-4">{t('settingsAppearanceDesc')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themeOptions.map(opt => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button key={opt.value} onClick={() => setTheme(opt.value)}
                  className={`group relative text-right p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    isActive
                      ? `${opt.border} ${opt.ring} ring-2 theme-card-active`
                      : 'border-gray-700/30 hover:border-gray-600/50 theme-card'
                  }`}>
                  <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} w-full h-1.5 bg-gradient-to-l ${opt.gradient} ${isActive ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'} transition-opacity`} />
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-purple-600/20' : 'bg-gray-700/30'}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'theme-text-secondary'}`} />
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${isActive ? 'text-purple-400' : 'theme-text'}`}>{opt.label}</span>
                      {isActive && <span className="text-xs text-green-400 mx-2">✓ {t('settingsActive')}</span>}
                    </div>
                  </div>
                  <p className="theme-text-muted text-xs">{opt.desc}</p>

                  <div className={`mt-3 rounded-lg p-2.5 flex gap-2 ${opt.value === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                    <div className={`w-8 h-full rounded ${opt.value === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className={`w-full h-1.5 rounded-t ${opt.value === 'dark' ? 'bg-purple-600/40' : 'bg-purple-400/40'}`} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className={`h-2 rounded w-3/4 ${opt.value === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      <div className={`h-2 rounded w-1/2 ${opt.value === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
                      <div className="flex gap-1">
                        <div className={`h-4 rounded flex-1 ${opt.value === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
                        <div className={`h-4 rounded flex-1 ${opt.value === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════ رنگ‌بندی ═══════════ */}
        <div>
          <h3 className="theme-text font-semibold mb-1 flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            {t('settingsColorPalette')}
          </h3>
          <p className="theme-text-secondary text-sm mb-4">{t('settingsColorPaletteDesc')}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(colorPalettes).map(([key, pal]) => {
              const isActive = palette === key;
              return (
                <button
                  key={key}
                  onClick={() => setPalette(key)}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isActive
                      ? 'border-white/30 ring-2 ring-white/10 theme-card-active'
                      : 'border-gray-700/30 hover:border-gray-600/50 theme-card'
                  }`}
                >
                  {/* نمونه رنگ */}
                  <div className="flex items-center justify-center mb-3">
                    <div
                      className="w-12 h-12 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${pal.primary}, ${pal.secondary})` }}
                    />
                  </div>
                  <p className={`text-center text-sm font-medium ${isActive ? 'theme-text' : 'theme-text-secondary'}`}>
                    {language === 'fa' ? pal.name : pal.nameEn}
                  </p>
                  {isActive && (
                    <div className="absolute top-2 left-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════ اعلان‌ها ═══════════ */}
        <div>
          <h3 className="theme-text font-semibold mb-1 flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            {t('settingsNotif')}
          </h3>
          <p className="theme-text-secondary text-sm mb-4">{t('settingsNotifDesc')}</p>

          <div className="theme-card rounded-2xl border theme-border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notifications ? <Bell className="w-5 h-5 text-cyan-400" /> : <BellOff className="w-5 h-5 text-gray-500" />}
                <div>
                  <span className="theme-text text-sm font-medium">{t('settingsNotifPush')}</span>
                  <p className="theme-text-muted text-xs mt-0.5">{t('settingsNotifPushDesc')}</p>
                </div>
              </div>
              <button onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-7 rounded-full transition-all duration-300 ${notifications ? 'bg-cyan-600' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${
                  notifications
                    ? (isRtl ? 'right-0.5' : 'left-[calc(100%-1.625rem)]')
                    : (isRtl ? 'right-[calc(100%-1.625rem)]' : 'left-0.5')
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════ زبان ═══════════ */}
        <div>
          <h3 className="theme-text font-semibold mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-400" />
            {t('settingsLang')}
          </h3>
          <p className="theme-text-secondary text-sm mb-4">{t('settingsLangDesc')}</p>

          <div className="flex gap-3">
            {[
              { value: 'fa', label: 'فارسی 🇮🇷' },
              { value: 'en', label: 'English 🇺🇸' },
            ].map(lang => (
              <button key={lang.value} onClick={() => setLanguage(lang.value)}
                className={`px-5 py-3 rounded-xl text-sm font-medium border transition-all ${
                  language === lang.value
                    ? 'bg-green-600/15 border-green-500/40 text-green-400 ring-1 ring-green-500/20'
                    : 'theme-card theme-border theme-text-secondary hover:theme-text'
                }`}>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════ درباره ═══════════ */}
        <div>
          <h3 className="theme-text font-semibold mb-1 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-amber-400" />
            {t('settingsAbout')}
          </h3>
          <div className="theme-card rounded-2xl border theme-border p-5 mt-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="theme-text-secondary">{t('settingsVersion')}:</span> <span className="theme-text">۱.۰.۰ بتا</span></div>
              <div><span className="theme-text-secondary">{t('settingsPlatform')}:</span> <span className="theme-text">Web</span></div>
              <div><span className="theme-text-secondary">{t('settingsFramework')}:</span> <span className="theme-text">React + Node.js</span></div>
              <div><span className="theme-text-secondary">{t('settingsDb')}:</span> <span className="theme-text">MongoDB</span></div>
            </div>
          </div>
        </div>

        {/* دکمه ذخیره */}
        <button onClick={handleSave}
          className="bg-gradient-to-l from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium px-8 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20">
          <Save className="w-5 h-5" /> {t('settingsSaveBtn')}
        </button>
      </div>
    </div>
  );
}
