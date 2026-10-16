import { createContext, useContext, useState, useEffect } from 'react';

// ─── ترجمه‌ها ─────────────────────────────────────────────
const translations = {
  fa: {
    // عمومی
    appName: 'روپولی',
    appDesc: 'پلتفرم تست بازی',
    loading: 'در حال بارگذاری...',
    error: 'خطا',
    save: 'ذخیره',
    cancel: 'لغو',
    delete: 'حذف',
    edit: 'ویرایش',
    confirm: 'تایید',
    back: 'بازگشت',
    close: 'بستن',
    search: 'جستجو',
    noData: 'داده‌ای یافت نشد',
    toman: 'تومان',
    day: 'روز',
    hour: 'ساعت',

    // سایدبار
    sideGames: 'بازی‌ها',
    sideSurvey: 'پژوهش',
    sideTrading: 'معاملات',
    sideProfile: 'پروفایل',
    sideWithdraw: 'برداشت',
    sideTransactions: 'تراکنش‌ها',
    sideSettings: 'تنظیمات',
    sideAdminPanel: 'پنل ادمین',
    sideProviderPanel: 'پنل ارائه‌دهنده',
    sideLogout: 'خروج از حساب',

    // داشبورد
    dashBalance: 'موجودی شما',
    dashPending: 'در انتظار',
    dashActiveGames: 'بازی‌های فعال',
    dashNoGames: 'هنوز بازی‌ای ارائه نشده است',
    dashView: 'مشاهده',
    dashActive: 'فعال',

    // پروفایل
    profileTitle: 'پروفایل',
    profileMember: 'عضویت',
    profileTotalEarnings: 'مجموع کل درآمد',
    profileWithdrawable: 'قابل برداشت',
    profilePendingApproval: 'در انتظار تایید',
    profileRewardHistory: 'تاریخچه پاداش‌ها',
    profileNoRewards: 'هنوز پاداشی دریافت نشده',
    profileReceived: 'دریافت شده',
    profileRelease: 'آزاد',

    // جزئیات بازی
    gameBack: 'بازگشت',
    gameProvider: 'ارائه‌دهنده',
    gameInstalled: 'نصب شده — تکالیف فعال',
    gameInstall: 'نصب کردم — شروع تکالیف',
    gameAssignments: 'تکالیف',
    gameComplete: 'تکمیل',
    gameDone: 'انجام شد',
    gameExpired: 'منقضی',
    gameLocked: 'قفل',
    gameTimeExpired: 'منقضی',
    gameTypeMain: 'اصلی',
    gameTypeBonus: 'تشویقی',
    gameTypeDaily: 'روزمره',
    gameDayAnd: 'روز و',
    gameHour: 'ساعت',

    // برداشت
    withdrawTitle: 'برداشت موجودی',
    withdrawUsdtPrice: 'قیمت لحظه‌ای تتر',
    withdrawNotReceived: 'دریافت نشد',
    withdrawEvery60: 'هر ۶۰ ثانیه',
    withdrawMethod: 'روش تسویه',
    withdrawBank: 'کارت بانکی / شبا',
    withdrawCrypto: 'رمز ارز (USDT)',
    withdrawAmount: 'مبلغ (تومان)',
    withdrawMinAmount: 'حداقل ۱۰,۰۰۰ تومان',
    withdrawDestLabel: 'شماره شبا یا کارت',
    withdrawCryptoLabel: 'آدرس ولت (TRC20 / ERC20)',
    withdrawSubmit: 'ثبت درخواست برداشت',
    withdrawNewBalance: 'موجودی جدید',
    withdrawUsdtEquiv: 'معادل USDT',

    // تراکنش‌ها
    txTitle: 'تاریخچه تراکنش‌ها',
    txNoTx: 'هنوز تراکنشی ثبت نشده است',
    txMethod: 'روش',
    txBank: 'بانکی',
    txCrypto: 'کریپتو',
    txDest: 'مقصد',
    txPending: 'در انتظار',
    txProcessing: 'در حال پردازش',
    txCompleted: 'تکمیل‌شده',
    txFailed: 'ناموفق',

    // تنظیمات
    settingsTitle: 'تنظیمات',
    settingsSaved: 'تنظیمات ذخیره شد',
    settingsAppearance: 'ظاهر سایت',
    settingsAppearanceDesc: 'رنگ‌بندی دلخواه خود را انتخاب کنید',
    settingsThemeDark: 'تاریک',
    settingsThemeDarkDesc: 'تم پیش‌فرض — مناسب برای شب',
    settingsThemeLight: 'روشن',
    settingsThemeLightDesc: 'تم روشن — مناسب برای روز',
    settingsActive: 'فعال',
    settingsNotif: 'اعلان‌ها',
    settingsNotifDesc: 'مدیریت نحوه دریافت اطلاع‌رسانی‌ها',
    settingsNotifPush: 'اعلان‌های پوش',
    settingsNotifPushDesc: 'دریافت اعلان برای تکالیف و پاداش‌ها',
    settingsLang: 'زبان',
    settingsLangDesc: 'زبان رابط کاربری',
    settingsAbout: 'درباره سیستم',
    settingsVersion: 'نسخه',
    settingsPlatform: 'پلتفرم',
    settingsFramework: 'فریمورک',
    settingsDb: 'دیتابیس',
    settingsSaveBtn: 'ذخیره تنظیمات',
    settingsColorPalette: 'رنگ‌بندی',
    settingsColorPaletteDesc: 'رنگ اصلی رابط کاربری را انتخاب کنید',

    // ورود
    loginTitle: 'ورود به حساب',
    loginSubTitle: 'با شماره موبایل یا ایمیل وارد شوید',
    loginIdentifier: 'شماره موبایل یا ایمیل',
    loginSendOtp: 'دریافت کد تایید',
    loginVerifyTitle: 'کد تایید را وارد کنید',
    loginOtpSentTo: 'کد تایید ارسال شده به',
    loginOtpCode: 'کد تایید ۵ رقمی',
    loginVerify: 'تایید و ورود',
    loginChangeNumber: 'تغییر شماره',
    loginOrWith: 'یا',
    loginGoogle: 'ورود با گوگل',
    loginAsUser: 'ورود کاربر',
    loginAsProvider: 'ورود ارائه‌دهنده',

    // پژوهش و معاملات
    surveyTitle: 'پژوهش',
    tradingTitle: 'معاملات',
    comingSoon: 'بزودی',

    // پیشرفت بازی
    progressTitle: 'پیشرفت بازی‌ها',
    progressNoGames: 'هنوز بازی‌ای نصب نکرده‌اید',
    progressCompleted: 'تکمیل شده',
    progressActive: 'فعال',
    progressLocked: 'قفل',
    progressFailed: 'منقضی',
    progressOverall: 'پیشرفت کلی',
  },

  en: {
    // General
    appName: 'Rupuly',
    appDesc: 'Game Testing Platform',
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    back: 'Back',
    close: 'Close',
    search: 'Search',
    noData: 'No data found',
    toman: 'Toman',
    day: 'day(s)',
    hour: 'hour(s)',

    // Sidebar
    sideGames: 'Games',
    sideSurvey: 'Survey',
    sideTrading: 'Trading',
    sideProfile: 'Profile',
    sideWithdraw: 'Withdraw',
    sideTransactions: 'Transactions',
    sideSettings: 'Settings',
    sideAdminPanel: 'Admin Panel',
    sideProviderPanel: 'Provider Panel',
    sideLogout: 'Logout',

    // Dashboard
    dashBalance: 'Your Balance',
    dashPending: 'Pending',
    dashActiveGames: 'Active Games',
    dashNoGames: 'No games available yet',
    dashView: 'View',
    dashActive: 'Active',

    // Profile
    profileTitle: 'Profile',
    profileMember: 'Member since',
    profileTotalEarnings: 'Total Earnings',
    profileWithdrawable: 'Withdrawable',
    profilePendingApproval: 'Pending Approval',
    profileRewardHistory: 'Reward History',
    profileNoRewards: 'No rewards received yet',
    profileReceived: 'Received',
    profileRelease: 'Release',

    // Game detail
    gameBack: 'Back',
    gameProvider: 'Provider',
    gameInstalled: 'Installed — Tasks Active',
    gameInstall: 'I Installed — Start Tasks',
    gameAssignments: 'Assignments',
    gameComplete: 'Complete',
    gameDone: 'Done',
    gameExpired: 'Expired',
    gameLocked: 'Locked',
    gameTimeExpired: 'Expired',
    gameTypeMain: 'Main',
    gameTypeBonus: 'Bonus',
    gameTypeDaily: 'Daily',
    gameDayAnd: 'days and',
    gameHour: 'hours',

    // Withdraw
    withdrawTitle: 'Withdraw Balance',
    withdrawUsdtPrice: 'Live USDT Price',
    withdrawNotReceived: 'Not received',
    withdrawEvery60: 'Every 60s',
    withdrawMethod: 'Settlement Method',
    withdrawBank: 'Bank Transfer / IBAN',
    withdrawCrypto: 'Crypto (USDT)',
    withdrawAmount: 'Amount (Toman)',
    withdrawMinAmount: 'Min 10,000 Toman',
    withdrawDestLabel: 'IBAN or Card Number',
    withdrawCryptoLabel: 'Wallet Address (TRC20 / ERC20)',
    withdrawSubmit: 'Submit Withdrawal',
    withdrawNewBalance: 'New Balance',
    withdrawUsdtEquiv: 'USDT Equivalent',

    // Transactions
    txTitle: 'Transaction History',
    txNoTx: 'No transactions yet',
    txMethod: 'Method',
    txBank: 'Bank',
    txCrypto: 'Crypto',
    txDest: 'Destination',
    txPending: 'Pending',
    txProcessing: 'Processing',
    txCompleted: 'Completed',
    txFailed: 'Failed',

    // Settings
    settingsTitle: 'Settings',
    settingsSaved: 'Settings saved',
    settingsAppearance: 'Appearance',
    settingsAppearanceDesc: 'Choose your preferred color scheme',
    settingsThemeDark: 'Dark',
    settingsThemeDarkDesc: 'Default — best for night',
    settingsThemeLight: 'Light',
    settingsThemeLightDesc: 'Light theme — best for day',
    settingsActive: 'Active',
    settingsNotif: 'Notifications',
    settingsNotifDesc: 'Manage how you receive notifications',
    settingsNotifPush: 'Push Notifications',
    settingsNotifPushDesc: 'Get notified about tasks and rewards',
    settingsLang: 'Language',
    settingsLangDesc: 'Interface language',
    settingsAbout: 'About System',
    settingsVersion: 'Version',
    settingsPlatform: 'Platform',
    settingsFramework: 'Framework',
    settingsDb: 'Database',
    settingsSaveBtn: 'Save Settings',
    settingsColorPalette: 'Color Palette',
    settingsColorPaletteDesc: 'Choose your primary UI color',

    // Login
    loginTitle: 'Sign In',
    loginSubTitle: 'Sign in with your phone number or email',
    loginIdentifier: 'Phone number or Email',
    loginSendOtp: 'Send OTP',
    loginVerifyTitle: 'Enter verification code',
    loginOtpSentTo: 'Code sent to',
    loginOtpCode: '5-digit code',
    loginVerify: 'Verify & Sign In',
    loginChangeNumber: 'Change number',
    loginOrWith: 'or',
    loginGoogle: 'Sign in with Google',
    loginAsUser: 'User Login',
    loginAsProvider: 'Provider Login',

    // Survey & Trading
    surveyTitle: 'Survey',
    tradingTitle: 'Trading',
    comingSoon: 'Coming Soon',

    // Game Progress
    progressTitle: 'Game Progress',
    progressNoGames: "You haven't installed any games yet",
    progressCompleted: 'Completed',
    progressActive: 'Active',
    progressLocked: 'Locked',
    progressFailed: 'Expired',
    progressOverall: 'Overall Progress',
  },
};

// ─── کانتکست ──────────────────────────────────────────────
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('rupuly-lang') || 'fa';
  });

  useEffect(() => {
    localStorage.setItem('rupuly-lang', language);
    // تغییر جهت صفحه
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['fa']?.[key] || key;
  };

  const isRtl = language === 'fa';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
