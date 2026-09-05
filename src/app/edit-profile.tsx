import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, alpha } from '../constants/theme';
import Svg, { Path, Circle } from 'react-native-svg';

/* ───────── keys ───────── */

const PROFILE_KEY = '@deen_companion_profile';

interface Profile {
  name: string;
  email: string;
  phone: string;
}

const DEFAULT_PROFILE: Profile = {
  name: 'Abdullah Saeed',
  email: '',
  phone: '',
};

/* ───────── icons ───────── */

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 4.5L7 10l5.5 5.5" stroke={colors.secondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CameraIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8h3l1.5-2.5h7L17 8h3v11H4Z" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={12} cy={13} r={3.4} stroke="#fff" strokeWidth={1.8} />
    </Svg>
  );
}

/* ───────── screen ───────── */

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [initial, setInitial] = useState<Profile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<TextInput>(null);

  // load on mount
  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as Profile;
        const p = { ...DEFAULT_PROFILE, ...parsed };
        setProfile(p);
        setInitial(p);
      } catch { /* keep defaults */ }
    });
  }, []);

  const initialLetter = (profile.name.trim()[0] || 'A').toUpperCase();

  const dirty =
    profile.name !== initial.name ||
    profile.email !== initial.email ||
    profile.phone !== initial.phone;

  const updateField = useCallback((field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!dirty || saving) return;
    setSaving(true);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setInitial(profile);
    setSaved(true);
    setSaving(false);
  }, [dirty, saving, profile]);

  return (
    <View style={s.safe} >
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.root}>
          {/* header */}
          <View style={s.hdr}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [s.hdrBtn, pressed && s.hdrBtnPressed]}
            >
              <BackIcon />
            </Pressable>
            <Text style={s.hdrTitle}>Edit Profile</Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            style={s.scroll}
            contentContainerStyle={[s.scrollContent, { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* avatar */}
            <View style={s.avatarWrap}>
              <View style={s.avatarBox}>
                <View style={s.avatar}>
                  <Text style={s.avatarLetter}>{initialLetter}</Text>
                </View>
                <Pressable style={s.camBtn} onPress={() => {/* TODO: image picker */}}>
                  <CameraIcon />
                </Pressable>
              </View>
              <Pressable onPress={() => {/* TODO: image picker */}}>
                <Text style={s.changePhotoText}>Change photo</Text>
              </Pressable>
            </View>

            {/* account section */}
            <Text style={s.sectionLabel}>Account</Text>

            <View style={s.card}>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Full Name</Text>
                <TextInput
                  ref={nameRef}
                  style={s.input}
                  value={profile.name}
                  onChangeText={(v) => updateField('name', v)}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textDisabled}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    // focus next input if needed
                  }}
                />
              </View>

              <View style={s.field}>
                <Text style={s.fieldLabel}>Email</Text>
                <TextInput
                  style={s.input}
                  value={profile.email}
                  onChangeText={(v) => updateField('email', v)}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={s.fieldLast}>
                <Text style={s.fieldLabel}>
                  Phone <Text style={s.optional}>(optional)</Text>
                </Text>
                <TextInput
                  style={s.input}
                  value={profile.phone}
                  onChangeText={(v) => updateField('phone', v)}
                  placeholder="+92 300 1234567"
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
              </View>
            </View>
          </ScrollView>

          {/* sticky save button */}
          <View style={[s.footer, { paddingBottom: insets.bottom + 18 }]}>
            <Pressable
              style={({ pressed }) => [
                s.saveBtn,
                !dirty && s.saveBtnOff,
                pressed && dirty && s.saveBtnPressed,
                saving && s.saveBtnOff,
              ]}
              onPress={handleSave}
              disabled={!dirty || saving}
            >
              <Text style={[s.saveBtnText, !dirty && s.saveBtnTextOff]}>
                {saved ? '✓ Saved' : 'Save Changes'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ───────── styles ───────── */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F6F0' },
  kav: { flex: 1 },
  root: { flex: 1 },

  /* header */
  hdr: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingTop: 8 },
  hdrBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  hdrBtnPressed: { backgroundColor: 'rgba(15,107,80,0.05)' },
  hdrTitle: { flex: 1, fontSize: 20, fontWeight: '600', letterSpacing: -0.3, color: '#102A43' },

  /* scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 14 },

  /* avatar */
  avatarWrap: { alignItems: 'center', gap: 10, marginTop: 4 },
  avatarBox: { position: 'relative' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(15,107,80,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(15,107,80,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#0F6B50', fontWeight: '600', fontSize: 34 },
  camBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F6B50',
    borderWidth: 3,
    borderColor: '#F8F6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: { color: '#0F6B50', fontWeight: '600', fontSize: 13 },

  /* section */
  sectionLabel: {
    marginHorizontal: 2,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#7A828C',
    fontWeight: '600',
  },

  /* card */
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: '#102A43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  /* field */
  field: {},
  fieldLast: {},
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#52616F', marginBottom: 6 },
  optional: { color: '#98A2AE', fontWeight: '400' },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#102A43',
  },

  /* footer */
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },

  /* save button */
  saveBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0F6B50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15,107,80,0.28)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  saveBtnOff: {
    backgroundColor: '#D5DBE1',
    shadowColor: 'transparent',
    shadowRadius: 0,
    elevation: 0,
  },
  saveBtnPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  saveBtnTextOff: { color: '#7A828C' },
});