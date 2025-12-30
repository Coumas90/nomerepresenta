import { useState, useEffect } from 'react';
import type { CompressionOptions } from '@/types';

const STORAGE_KEY = 'compression-settings';

export interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  initialQuality: number;
  minSavingsPercent: number;
}

const DEFAULT_SETTINGS: CompressionSettings = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2400,
  initialQuality: 0.85,
  minSavingsPercent: 20,
};

export const getCompressionSettings = (): CompressionSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load compression settings:', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveCompressionSettings = (settings: CompressionSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save compression settings:', e);
  }
};

export const getCompressionOptions = (): CompressionOptions => {
  const settings = getCompressionSettings();
  return {
    maxSizeMB: settings.maxSizeMB,
    maxWidthOrHeight: settings.maxWidthOrHeight,
    initialQuality: settings.initialQuality,
    minSavingsPercent: settings.minSavingsPercent,
    useWebWorker: true,
    fileType: 'image/webp',
  };
};

export const useCompressionSettings = () => {
  const [settings, setSettings] = useState<CompressionSettings>(getCompressionSettings);

  useEffect(() => {
    saveCompressionSettings(settings);
  }, [settings]);

  const updateSetting = <K extends keyof CompressionSettings>(
    key: K,
    value: CompressionSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSetting,
    resetToDefaults,
    DEFAULT_SETTINGS,
  };
};
