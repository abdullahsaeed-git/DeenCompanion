/**
 * Prayer Settings Screen
 *
 * Configure prayer time calculation preferences.
 * Settings auto-save to AsyncStorage and are read by the Prayer tab.
 *
 * Sections:
 * 1. Location — Searchable city picker (country auto-selected)
 * 2. Calculation Method — Dropdown picker
 * 3. Preferences — Notifications & 24-hour format toggles
 */

import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import { CITIES, CityEntry } from '../constants/cities';
import {
  settingsService,
  PrayerSettings,
  DEFAULT_PRAYER_SETTINGS,
} from '../services/settingsService';

// ============================================
// DATA
// ============================================

const METHODS = [
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 3, name: 'Muslim World League' },
  { id: 4, name: 'Umm al-Qura University, Makkah' },
  { id: 5, name: 'Egyptian General Authority of Survey' },
  { id: 7, name: 'Institute of Geophysics, University of Tehran' },
  { id: 8, name: 'Gulf Region' },
  { id: 9, name: 'Kuwait' },
  { id: 10, name: 'Qatar' },
  { id: 11, name: 'Majlis Ugama Islam Singapura' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
  { id: 15, name: 'Moonsighting Committee Worldwide' },
  { id: 17, name: 'Jabatan Kemajuan Islam Malaysia (JAKIM)' },
  { id: 20, name: 'Kementerian Agama Republik Indonesia' },
  { id: 21, name: 'Morocco' },
  { id: 22, name: 'Ministry of Awqaf, Jordan' },
];

// ============================================
// ICONS
// ============================================

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronDownIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 8l5 5 5-5"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronUpIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 12l5-5 5 5"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4 10.5l4 4 8-8"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
      <Path
        d="M9 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
        stroke={colors.textMuted}
        strokeWidth={1.8}
      />
      <Path
        d="M13 13l3.5 3.5"
        stroke={colors.textMuted}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ============================================
// COMPONENTS
// ============================================

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: alpha(colors.secondary, 0.12), true: alpha(colors.primary, 0.35) }}
        thumbColor={value ? colors.primary : colors.iconGray}
        ios_backgroundColor={alpha(colors.secondary, 0.12)}
      />
    </View>
  );
}

// ============================================
// CITY PICKER
// ============================================

function CityPicker({
  city,
  country,
  onSelect,
}: {
  city: string;
  country: string;
  onSelect: (city: CityEntry) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return CITIES.slice(0, 20);
    const q = query.toLowerCase();
    return CITIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 40);
  }, [query]);

  function handleSelect(c: CityEntry) {
    onSelect(c);
    setExpanded(false);
    setQuery('');
  }

  return (
    <View>
      {/* Collapsed row */}
      {!expanded && (
        <Pressable
          style={({ pressed }) => [styles.pickerRow, pressed && styles.pickerRowPressed]}
          onPress={() => setExpanded(true)}
        >
          <View style={styles.pickerRowLeft}>
            <Text style={styles.pickerRowLabel}>City</Text>
            <Text style={styles.pickerRowValue} numberOfLines={1}>
              {city || 'Select a city'}
            </Text>
            {country ? (
              <Text style={styles.pickerRowSub} numberOfLines={1}>
                {country}
              </Text>
            ) : null}
          </View>
          <ChevronDownIcon />
        </Pressable>
      )}

      {/* Expanded picker */}
      {expanded && (
        <View style={styles.pickerExpanded}>
          {/* Search bar */}
          <View style={styles.pickerSearchBar}>
            <SearchIcon />
            <TextInput
              style={styles.pickerSearchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search city…"
              placeholderTextColor={colors.textDisabled}
              autoFocus
              autoCapitalize="words"
            />
            <Pressable onPress={() => { setExpanded(false); setQuery(''); }}>
              <Text style={styles.pickerSearchCancel}>Cancel</Text>
            </Pressable>
          </View>

          <Divider />

          {/* City list */}
          <ScrollView
            style={styles.pickerList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filtered.map((c) => {
              const selected = c.name === city && c.country === country;
              return (
                <Pressable
                  key={`${c.name}-${c.country}`}
                  style={({ pressed }) => [
                    styles.pickerListItem,
                    selected && styles.pickerListItemSelected,
                    pressed && styles.pickerListItemPressed,
                  ]}
                  onPress={() => handleSelect(c)}
                >
                  <View style={styles.pickerListItemText}>
                    <Text
                      style={[
                        styles.pickerListItemName,
                        selected && styles.pickerListItemNameSelected,
                      ]}
                    >
                      {c.name}
                    </Text>
                    <Text style={styles.pickerListItemCountry}>{c.country}</Text>
                  </View>
                  {selected && <CheckIcon size={16} />}
                </Pressable>
              );
            })}
            {filtered.length === 0 && (
              <Text style={styles.pickerEmpty}>No cities found</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ============================================
// METHOD PICKER
// ============================================

function MethodPicker({
  methodId,
  onSelect,
}: {
  methodId: number;
  onSelect: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const selectedName = METHODS.find((m) => m.id === methodId)?.name || 'Select method';

  function handleSelect(id: number) {
    onSelect(id);
    setExpanded(false);
  }

  return (
    <View>
      {/* Collapsed row */}
      {!expanded && (
        <Pressable
          style={({ pressed }) => [styles.pickerRow, pressed && styles.pickerRowPressed]}
          onPress={() => setExpanded(true)}
        >
          <View style={styles.pickerRowLeft}>
            <Text style={styles.pickerRowLabel}>Method</Text>
            <Text style={styles.pickerRowValue} numberOfLines={1}>
              {selectedName}
            </Text>
          </View>
          <ChevronDownIcon />
        </Pressable>
      )}

      {/* Expanded list */}
      {expanded && (
        <View style={styles.pickerExpanded}>
          <View style={styles.pickerExpandedHeader}>
            <Text style={styles.pickerExpandedTitle}>Calculation Method</Text>
            <Pressable onPress={() => setExpanded(false)}>
              <Text style={styles.pickerSearchCancel}>Done</Text>
            </Pressable>
          </View>
          <Divider />
          <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
            {METHODS.map((method, index) => {
              const selected = method.id === methodId;
              return (
                <View key={method.id}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.pickerListItem,
                      selected && styles.pickerListItemSelected,
                      pressed && styles.pickerListItemPressed,
                    ]}
                    onPress={() => handleSelect(method.id)}
                  >
                    <Text
                      style={[
                        styles.pickerListItemName,
                        selected && styles.pickerListItemNameSelected,
                      ]}
                      numberOfLines={2}
                    >
                      {method.name}
                    </Text>
                    {selected && <CheckIcon size={16} />}
                  </Pressable>
                  {index < METHODS.length - 1 && <Divider />}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function PrayerSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<PrayerSettings>(DEFAULT_PRAYER_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    let cancelled = false;
    settingsService.loadPrayerSettings().then((loaded) => {
      if (!cancelled) {
        setSettings(loaded);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Auto-save whenever settings change
  useEffect(() => {
    if (loading) return;
    settingsService.savePrayerSettings(settings);
  }, [settings, loading]);

  function updateSettings(partial: Partial<PrayerSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.loadingText}>Loading settings…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 8, paddingBottom: insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>Prayer Settings</Text>
          <View style={styles.spacer} />
        </View>

        {/* Location */}
        <SectionLabel text="Location" />
        <Card>
          <CityPicker
            city={settings.city}
            country={settings.country}
            onSelect={(c) => updateSettings({ city: c.name, country: c.country })}
          />
        </Card>

        {/* Calculation Method */}
        <SectionLabel text="Calculation Method" />
        <Card>
          <MethodPicker
            methodId={settings.method}
            onSelect={(id) => updateSettings({ method: id })}
          />
        </Card>

        {/* Preferences */}
        {/* <SectionLabel text="Preferences" />
        <Card>
          <ToggleRow
            label="Adhan Notifications"
            value={settings.notificationsEnabled}
            onChange={(v) => updateSettings({ notificationsEnabled: v })}
          />
          <Divider />
          <ToggleRow
            label="24-Hour Time Format"
            value={settings.use24HourFormat}
            onChange={(v) => updateSettings({ use24HourFormat: v })}
          />
        </Card> */}

        {/* Footer hint */}
        <Text style={styles.hint}>
          Changes are applied automatically when you return to the Prayer screen.
        </Text>
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 10 },

  // Loading
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: colors.textSecondary },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: colors.secondary,
  },
  spacer: { width: 44 },

  // Section label
  sectionLabel: {
    marginTop: 14,
    marginHorizontal: 2,
    marginBottom: 6,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // --- Picker Row (collapsed) ---
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
  },
  pickerRowPressed: {
    backgroundColor: colors.pressedBg,
  },
  pickerRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  pickerRowLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  pickerRowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
  },
  pickerRowSub: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 1,
  },

  // --- Picker Expanded ---
  pickerExpanded: {
    paddingVertical: 8,
  },
  pickerExpandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  pickerExpandedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },

  // --- Search bar inside picker ---
  pickerSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.secondary,
    padding: 0,
    height: 36,
  },
  pickerSearchCancel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },

  // --- Picker List ---
  pickerList: {
    maxHeight: 320,
  },
  pickerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  pickerListItemSelected: {
    backgroundColor: alpha(colors.primary, 0.05),
  },
  pickerListItemPressed: {
    backgroundColor: colors.pressedBg,
  },
  pickerListItemText: {
    flex: 1,
    marginRight: 12,
  },
  pickerListItemName: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  pickerListItemNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  pickerListItemCountry: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  pickerEmpty: {
    paddingVertical: 20,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
  },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondary,
  },

  // Hint
  hint: {
    marginTop: 8,
    marginHorizontal: 4,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
});