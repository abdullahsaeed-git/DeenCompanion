import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  settingsService,
  FONT_SIZE_CONFIG,
  getDefaultTranslationSize,
} from '../services/settingsService';

export function useFontSizes() {
  // Use the dynamic default for the initial state
  const [arabic, setArabic] = useState<number>(
    FONT_SIZE_CONFIG.arabic.default,
  );
  const [translation, setTranslation] = useState<number>(
    getDefaultTranslationSize(),
  );
  const ready = useRef(false);

  // reloads on mount AND every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([
        settingsService.getArabicFontSize(),
        settingsService.getTranslationFontSize(),
      ]).then(([ar, tr]) => {
        if (cancelled) return;
        setArabic(ar);
        setTranslation(tr);
        ready.current = true;
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const setArabicSize = useCallback((v: number) => {
    setArabic(v);
    if (ready.current) settingsService.setArabicFontSize(v);
  }, []);

  const setTranslationSize = useCallback((v: number) => {
    setTranslation(v);
    if (ready.current) settingsService.setTranslationFontSize(v);
  }, []);

  const reset = useCallback(() => {
    const defaultAr = FONT_SIZE_CONFIG.arabic.default;
    const defaultTr = getDefaultTranslationSize(); // Gets 17 for Urdu, 14 for English
    
    setArabic(defaultAr);
    setTranslation(defaultTr);
    
    // Explicitly save the correct defaults to AsyncStorage
    settingsService.setArabicFontSize(defaultAr);
    settingsService.setTranslationFontSize(defaultTr);
  }, []);

  return {
    arabic,
    translation,
    setArabicSize,
    setTranslationSize,
    reset,
    config: FONT_SIZE_CONFIG,
  };
}