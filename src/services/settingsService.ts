import AsyncStorage from '@react-native-async-storage/async-storage';

const PRAYER_SETTINGS_KEY = '@deen_companion_prayer_settings_v1';

export interface PrayerSettings {
  city: string;
  country: string;
  method: number;
  school: number;
  notificationsEnabled: boolean;
  use24HourFormat: boolean;
}

export const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
  city: 'Wah',
  country: 'Pakistan',
  method: 1,
  school: 1,
  notificationsEnabled: true,
  use24HourFormat: false,
};

export const settingsService = {
  async loadPrayerSettings(): Promise<PrayerSettings> {
    try {
      const json = await AsyncStorage.getItem(PRAYER_SETTINGS_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        return { ...DEFAULT_PRAYER_SETTINGS, ...parsed };
      }
    } catch {
      // Silently fall back to defaults
    }
    return { ...DEFAULT_PRAYER_SETTINGS };
  },

  async savePrayerSettings(settings: PrayerSettings): Promise<void> {
    await AsyncStorage.setItem(PRAYER_SETTINGS_KEY, JSON.stringify(settings));
  },
};