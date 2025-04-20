"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';

// Define theme properties for all available themes
const themeProperties = {
  basic: {
    // Default theme
    primary: '#00DCFF',
    secondary: '#3B82F6',
    accent: '#9333EA',
    background: '#000000',
    cardBg: 'rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#FFFFFF',
    textMuted: '#9CA3AF',
  },
  darkMinimal: {
    primary: '#6B7280',
    secondary: '#4B5563',
    accent: '#D1D5DB',
    background: '#111111',
    cardBg: 'rgba(20, 20, 20, 0.8)',
    borderColor: 'rgba(75, 85, 99, 0.2)',
    textColor: '#F3F4F6',
    textMuted: '#9CA3AF',
  },
  neonSynthwave: {
    primary: '#FF00FF',
    secondary: '#00FFFF',
    accent: '#FE5BFF',
    background: '#150024',
    cardBg: 'rgba(32, 0, 48, 0.7)',
    borderColor: 'rgba(255, 0, 255, 0.2)',
    textColor: '#FFFFFF',
    textMuted: '#D1B3FF',
  },
  calmPastel: {
    primary: '#A7D2CB',
    secondary: '#F2D388',
    accent: '#C98474',
    background: '#111827',
    cardBg: 'rgba(17, 24, 39, 0.7)',
    borderColor: 'rgba(167, 210, 203, 0.2)',
    textColor: '#F9FAFB',
    textMuted: '#D1D5DB',
  },
  nature: {
    primary: '#4ADE80',
    secondary: '#22C55E',
    accent: '#86EFAC',
    background: '#0F172A',
    cardBg: 'rgba(15, 23, 42, 0.7)',
    borderColor: 'rgba(74, 222, 128, 0.2)',
    textColor: '#F8FAFC',
    textMuted: '#94A3B8',
  },
  ocean: {
    primary: '#38BDF8',
    secondary: '#0EA5E9',
    accent: '#7DD3FC',
    background: '#0C4A6E',
    cardBg: 'rgba(12, 74, 110, 0.7)',
    borderColor: 'rgba(56, 189, 248, 0.2)',
    textColor: '#F0F9FF',
    textMuted: '#BAE6FD',
  },
  midnightGalaxy: {
    primary: '#8B5CF6',
    secondary: '#6D28D9',
    accent: '#A78BFA',
    background: '#020617',
    cardBg: 'rgba(2, 6, 23, 0.8)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    textColor: '#F5F3FF',
    textMuted: '#C4B5FD',
  },
  // Add properties for new themes
  cyberpunk: {
    primary: '#F9A8D4',
    secondary: '#EC4899',
    accent: '#FBCFE8',
    background: '#18181B',
    cardBg: 'rgba(24, 24, 27, 0.7)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    textColor: '#FAFAFA',
    textMuted: '#A1A1AA',
  },
  minimalistLight: {
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    accent: '#93C5FD',
    background: '#F9FAFB',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(209, 213, 219, 0.5)',
    textColor: '#111827',
    textMuted: '#4B5563',
  },
  sunsetGradient: {
    primary: '#F97316',
    secondary: '#EA580C',
    accent: '#FDBA74',
    background: '#27272A',
    cardBg: 'rgba(39, 39, 42, 0.7)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    textColor: '#FAFAFA',
    textMuted: '#A1A1AA',
  },
  forestMist: {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#6EE7B7',
    background: '#1F2937',
    cardBg: 'rgba(31, 41, 55, 0.7)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    textColor: '#F9FAFB',
    textMuted: '#9CA3AF',
  },
  desertSands: {
    primary: '#D97706',
    secondary: '#B45309',
    accent: '#FBBF24',
    background: '#292524',
    cardBg: 'rgba(41, 37, 36, 0.7)',
    borderColor: 'rgba(217, 119, 6, 0.2)',
    textColor: '#FAFAF9',
    textMuted: '#A8A29E',
  },
  cherryBlossom: {
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#F9A8D4',
    background: '#1F2937',
    cardBg: 'rgba(31, 41, 55, 0.7)',
    borderColor: 'rgba(236, 72, 153, 0.2)',
    textColor: '#F9FAFB',
    textMuted: '#9CA3AF',
  },
  monochrome: {
    primary: '#FFFFFF',
    secondary: '#A3A3A3',
    accent: '#D4D4D4',
    background: '#000000',
    cardBg: 'rgba(23, 23, 23, 0.7)',
    borderColor: 'rgba(163, 163, 163, 0.2)',
    textColor: '#FFFFFF',
    textMuted: '#A3A3A3',
  },
  northernLights: {
    primary: '#06B6D4',
    secondary: '#0891B2',
    accent: '#67E8F9',
    background: '#0F172A',
    cardBg: 'rgba(15, 23, 42, 0.7)',
    borderColor: 'rgba(6, 182, 212, 0.2)',
    textColor: '#F8FAFC',
    textMuted: '#94A3B8',
  },
  vintagePaper: {
    primary: '#B45309',
    secondary: '#92400E',
    accent: '#F59E0B',
    background: '#292524',
    cardBg: 'rgba(41, 37, 36, 0.8)',
    borderColor: 'rgba(180, 83, 9, 0.2)',
    textColor: '#F5F5F4',
    textMuted: '#A8A29E',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('basic');

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('momentum-theme');
    if (savedTheme && themeProperties[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme CSS variables when the theme changes
    if (themeProperties[currentTheme]) {
      const root = document.documentElement;
      const theme = themeProperties[currentTheme];
      
      // Set CSS variables for theme properties
      Object.entries(theme).forEach(([property, value]) => {
        root.style.setProperty(`--theme-${property}`, value);
      });

      // Save current theme to localStorage
      localStorage.setItem('momentum-theme', currentTheme);
    }
  }, [currentTheme]);

  const applyTheme = (themeId) => {
    if (themeProperties[themeId]) {
      setCurrentTheme(themeId);
      return true;
    }
    return false;
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, applyTheme, themes: themeProperties }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;