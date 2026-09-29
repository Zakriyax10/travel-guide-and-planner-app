import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const LIGHT = {
  mode: 'light',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  primaryMid: '#BFDBFE',
  secondary: '#F97316',
  secondaryLight: '#FFF7ED',
  accent: '#8B5CF6',
  accentLight: '#F5F3FF',
  success: '#10B981',
  successLight: '#ECFDF5',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  dark: '#0F172A',
  darkMid: '#1E293B',
  gray: '#64748B',
  grayLight: '#F1F5F9',
  grayMid: '#CBD5E1',
  border: '#E2E8F0',
  white: '#FFFFFF',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  inputBg: '#F1F5F9',
  shadow: 'rgba(37,99,235,0.15)',
  shadowDark: 'rgba(0,0,0,0.12)',
  tabBar: '#FFFFFF',
  headerBg: '#EFF6FF',
  text: '#0F172A',
  textSub: '#64748B',
  mapStyle: [],
};

export const DARK = {
  mode: 'dark',
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#1E3A5F',
  primaryMid: '#1E3A5F',
  secondary: '#FB923C',
  secondaryLight: '#431407',
  accent: '#A78BFA',
  accentLight: '#2E1065',
  success: '#34D399',
  successLight: '#064E3B',
  danger: '#F87171',
  dangerLight: '#450A0A',
  warning: '#FBBF24',
  warningLight: '#451A03',
  dark: '#F1F5F9',
  darkMid: '#E2E8F0',
  gray: '#94A3B8',
  grayLight: '#1E293B',
  grayMid: '#334155',
  border: '#334155',
  white: '#1E293B',
  background: '#0F172A',
  cardBg: '#1E293B',
  inputBg: '#0F172A',
  shadow: 'rgba(0,0,0,0.4)',
  shadowDark: 'rgba(0,0,0,0.5)',
  tabBar: '#1E293B',
  headerBg: '#1E293B',
  text: '#F1F5F9',
  textSub: '#94A3B8',
  mapStyle: [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#16213e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#0f3460' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1628' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#16213e' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2f1a' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2d3561' }] },
  ],
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? DARK : LIGHT;

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then((val) => {
      if (val === 'true') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('darkMode', next.toString());
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}