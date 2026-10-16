import { createContext, useContext, useState, useEffect } from 'react';

// ─── پالت‌های رنگی ────────────────────────────────────────
export const colorPalettes = {
  purple: {
    name: 'بنفش',
    nameEn: 'Purple',
    primary: '#9333ea',
    secondary: '#06b6d4',
    gradient: 'from-purple-600 to-cyan-600',
    gradientHover: 'from-purple-500 to-cyan-500',
    gradientBg: 'from-purple-600/20 to-cyan-600/20',
    accent: 'purple',
    accentLight: 'text-purple-400',
    accentBg: 'bg-purple-600/20',
    accentBorder: 'border-purple-500/20',
    shadow: 'shadow-purple-500/20',
    ring: 'ring-purple-500/20',
    sidebarActive: 'from-purple-600/20 to-cyan-600/20',
    sidebarActiveBorder: 'border-purple-500/20',
    sidebarActiveShadow: 'shadow-purple-500/5',
    css: {
      '--color-primary': '#9333ea',
      '--color-secondary': '#06b6d4',
      '--color-primary-light': 'rgba(147, 51, 234, 0.2)',
      '--color-gradient': 'linear-gradient(to left, #9333ea, #06b6d4)',
      '--color-shadow': 'rgba(147, 51, 234, 0.2)',
    },
  },
  blue: {
    name: 'آبی',
    nameEn: 'Blue',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    gradient: 'from-blue-600 to-violet-600',
    gradientHover: 'from-blue-500 to-violet-500',
    gradientBg: 'from-blue-600/20 to-violet-600/20',
    accent: 'blue',
    accentLight: 'text-blue-400',
    accentBg: 'bg-blue-600/20',
    accentBorder: 'border-blue-500/20',
    shadow: 'shadow-blue-500/20',
    ring: 'ring-blue-500/20',
    sidebarActive: 'from-blue-600/20 to-violet-600/20',
    sidebarActiveBorder: 'border-blue-500/20',
    sidebarActiveShadow: 'shadow-blue-500/5',
    css: {
      '--color-primary': '#3b82f6',
      '--color-secondary': '#8b5cf6',
      '--color-primary-light': 'rgba(59, 130, 246, 0.2)',
      '--color-gradient': 'linear-gradient(to left, #3b82f6, #8b5cf6)',
      '--color-shadow': 'rgba(59, 130, 246, 0.2)',
    },
  },
  emerald: {
    name: 'زمردی',
    nameEn: 'Emerald',
    primary: '#10b981',
    secondary: '#14b8a6',
    gradient: 'from-emerald-600 to-teal-600',
    gradientHover: 'from-emerald-500 to-teal-500',
    gradientBg: 'from-emerald-600/20 to-teal-600/20',
    accent: 'emerald',
    accentLight: 'text-emerald-400',
    accentBg: 'bg-emerald-600/20',
    accentBorder: 'border-emerald-500/20',
    shadow: 'shadow-emerald-500/20',
    ring: 'ring-emerald-500/20',
    sidebarActive: 'from-emerald-600/20 to-teal-600/20',
    sidebarActiveBorder: 'border-emerald-500/20',
    sidebarActiveShadow: 'shadow-emerald-500/5',
    css: {
      '--color-primary': '#10b981',
      '--color-secondary': '#14b8a6',
      '--color-primary-light': 'rgba(16, 185, 129, 0.2)',
      '--color-gradient': 'linear-gradient(to left, #10b981, #14b8a6)',
      '--color-shadow': 'rgba(16, 185, 129, 0.2)',
    },
  },
  rose: {
    name: 'گلی',
    nameEn: 'Rose',
    primary: '#f43f5e',
    secondary: '#f97316',
    gradient: 'from-rose-600 to-orange-600',
    gradientHover: 'from-rose-500 to-orange-500',
    gradientBg: 'from-rose-600/20 to-orange-600/20',
    accent: 'rose',
    accentLight: 'text-rose-400',
    accentBg: 'bg-rose-600/20',
    accentBorder: 'border-rose-500/20',
    shadow: 'shadow-rose-500/20',
    ring: 'ring-rose-500/20',
    sidebarActive: 'from-rose-600/20 to-orange-600/20',
    sidebarActiveBorder: 'border-rose-500/20',
    sidebarActiveShadow: 'shadow-rose-500/5',
    css: {
      '--color-primary': '#f43f5e',
      '--color-secondary': '#f97316',
      '--color-primary-light': 'rgba(244, 63, 94, 0.2)',
      '--color-gradient': 'linear-gradient(to left, #f43f5e, #f97316)',
      '--color-shadow': 'rgba(244, 63, 94, 0.2)',
    },
  },
  amber: {
    name: 'طلایی',
    nameEn: 'Amber',
    primary: '#f59e0b',
    secondary: '#eab308',
    gradient: 'from-amber-600 to-yellow-600',
    gradientHover: 'from-amber-500 to-yellow-500',
    gradientBg: 'from-amber-600/20 to-yellow-600/20',
    accent: 'amber',
    accentLight: 'text-amber-400',
    accentBg: 'bg-amber-600/20',
    accentBorder: 'border-amber-500/20',
    shadow: 'shadow-amber-500/20',
    ring: 'ring-amber-500/20',
    sidebarActive: 'from-amber-600/20 to-yellow-600/20',
    sidebarActiveBorder: 'border-amber-500/20',
    sidebarActiveShadow: 'shadow-amber-500/5',
    css: {
      '--color-primary': '#f59e0b',
      '--color-secondary': '#eab308',
      '--color-primary-light': 'rgba(245, 158, 11, 0.2)',
      '--color-gradient': 'linear-gradient(to left, #f59e0b, #eab308)',
      '--color-shadow': 'rgba(245, 158, 11, 0.2)',
    },
  },
};

// ─── کانتکست ──────────────────────────────────────────────
const ColorPaletteContext = createContext();

export function ColorPaletteProvider({ children }) {
  const [palette, setPalette] = useState(() => {
    return localStorage.getItem('rupuly-palette') || 'purple';
  });

  const currentPalette = colorPalettes[palette] || colorPalettes.purple;

  useEffect(() => {
    localStorage.setItem('rupuly-palette', palette);
    // اعمال CSS variables
    const root = document.documentElement;
    Object.entries(currentPalette.css).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [palette, currentPalette]);

  return (
    <ColorPaletteContext.Provider value={{ palette, setPalette, currentPalette, palettes: colorPalettes }}>
      {children}
    </ColorPaletteContext.Provider>
  );
}

export function useColorPalette() {
  const context = useContext(ColorPaletteContext);
  if (!context) throw new Error('useColorPalette must be used within ColorPaletteProvider');
  return context;
}
