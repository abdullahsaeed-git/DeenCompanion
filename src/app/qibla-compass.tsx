/**
 * Qibla Compass Screen
 *
 * Shows Qibla direction with a rotating compass dial.
 * - Fetches Qibla angle from Aladhan API
 * - Calculates distance to Makkah using Haversine formula
 * - Uses expo-location for device heading (optional — graceful fallback)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { prayerService, haversineDistance } from '../services/prayerService';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

// Try to import expo-location; fallback if not installed
let Location: typeof import('expo-location') | null = null;
try {
  Location = require('expo-location');
} catch {
  Location = null;
}

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 4.5 7 10l5.5 5.5" stroke="#102A43" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PinIcon({ size = 12, color = '#0F6B50' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10 2.5c-3.3 0-5.5 2.4-5.5 5.5 0 4 5.5 9.5 5.5 9.5s5.5-5.5 5.5-9.5c0-3.1-2.2-5.5-5.5-5.5Z" stroke={color} strokeWidth={1.8} />
      <Circle cx={10} cy={8} r={2} fill={color} />
    </Svg>
  );
}

function MapIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 20 20" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M3 5.5 8 3.5l4 2 5-2v11l-5 2-4-2-5 2Z" />
      <Path d="M8 3.5v11M12 5.5v11" />
    </Svg>
  );
}

function CalibrateIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 8c-2.2-2.6-6.5-1.4-6.5 2S9.8 15.6 12 13c2.2 2.6 6.5 1.6 6.5-1.8S14.2 5.4 12 8Z" stroke="#6B5A1E" strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

function CompassDial({ qiblaAngle, rotation }: { qiblaAngle: number; rotation: Animated.Value }) {
  const spin = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Svg width={320} height={320} viewBox="0 0 340 340">
        <Circle cx={170} cy={170} r={160} fill="#FFFFFF" stroke="#E9E4D8" strokeWidth={1} />
        <Circle cx={170} cy={170} r={150} stroke="#102A43" strokeOpacity={0.16} strokeWidth={9} strokeDasharray="1.6 14.11" />
        <G>
          <SvgText x={170} y={58} textAnchor="middle" fontFamily="Poppins" fontWeight="600" fontSize={17} fill="#0F6B50">N</SvgText>
          <SvgText x={288} y={176} textAnchor="middle" fontFamily="Poppins" fontWeight="600" fontSize={17} fill="#52616F">E</SvgText>
          <SvgText x={170} y={294} textAnchor="middle" fontFamily="Poppins" fontWeight="600" fontSize={17} fill="#52616F">S</SvgText>
          <SvgText x={52} y={176} textAnchor="middle" fontFamily="Poppins" fontWeight="600" fontSize={17} fill="#52616F">W</SvgText>
        </G>
        <G transform={`rotate(${qiblaAngle} 170 170)`}>
          <Path d="M170 170 L170 92" stroke="#0F6B50" strokeWidth={3} strokeLinecap="round" />
          <Path d="M170 74 l-9 18 h18 Z" fill="#0F6B50" />
          <G transform="translate(170 46)">
            <Rect x={-12} y={-10} width={24} height={21} rx={2.5} fill="#102A43" />
            <Rect x={-12} y={-4} width={24} height={4} fill="#D4AF37" />
            <Rect x={3} y={3} width={4.5} height={7} rx={1} fill="#D4AF37" opacity={0.9} />
          </G>
        </G>
      </Svg>
    </Animated.View>
  );
}

export default function QiblaCompassScreen() {
  const insets = useSafeAreaInsets();
  const { lat, long, locationName } = useLocalSearchParams();

  const latitude = parseFloat((lat as string) || '0');
  const longitude = parseFloat((long as string) || '0');
  const location = (locationName as string) || 'Unknown Location';

  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headingAvailable, setHeadingAvailable] = useState(false);
  const [headingDeg, setHeadingDeg] = useState(0);

  const rotation = useRef(new Animated.Value(0)).current;
  const headingSubscription = useRef<any>(null);
  const currentHeadingRef = useRef(0);

  const loadQibla = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const angle = await prayerService.getQiblaDirection(latitude, longitude);
      setQiblaAngle(angle);
      const dist = haversineDistance(latitude, longitude, KAABA_LAT, KAABA_LON);
      setDistance(dist);
    } catch (err: any) {
      setError(err.message || 'Failed to load Qibla direction');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    loadQibla();
  }, [loadQibla]);

  useEffect(() => {
    if (!Location) return;

    async function startHeading() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const heading = await Location.getHeadingAsync();
        const initialDeg = heading.trueHeading ?? heading.magHeading ?? 0;
        currentHeadingRef.current = initialDeg;
        setHeadingDeg(Math.round(initialDeg));
        rotation.setValue(-initialDeg);
        setHeadingAvailable(true);

        headingSubscription.current = await Location.watchHeadingAsync((h) => {
          const deg = h.trueHeading ?? h.magHeading ?? 0;
          currentHeadingRef.current = deg;
          setHeadingDeg(Math.round(deg));

          Animated.spring(rotation, {
            toValue: -deg,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();
        });
      } catch {
        // Heading not available
      }
    }

    startHeading();

    return () => {
      if (headingSubscription.current) {
        headingSubscription.current.remove?.();
      }
    };
  }, [rotation]);

  function getCardinal(deg: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(deg / 45) % 8;
    return dirs[idx];
  }

  function formatDistance(km: number): string {
    if (km >= 1000) return `${(km / 1000).toFixed(1)}k km`;
    return `${Math.round(km)} km`;
  }

  return (
    <View style={styles.screen}>
      <Pressable style={[styles.backBtn, { top: insets.top + 12 }]} onPress={() => router.back()}>
        <BackIcon />
      </Pressable>

      <View style={[styles.content, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 34 }]}>
        <View style={styles.qhead}>
          <Text style={styles.qtitle}>Qibla</Text>
          <View style={styles.qloc}>
            <PinIcon size={12} />
            <Text style={styles.qlocText}>{location}</Text>
          </View>
        </View>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0F6B50" />
            <Text style={styles.loadingText}>Loading Qibla direction…</Text>
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadQibla}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && (
          <>
            <View style={styles.dialWrap}>
              <View style={styles.hchip}>
                <Text style={styles.hchipText}>{headingDeg}° {getCardinal(headingDeg)}</Text>
              </View>
              <CompassDial qiblaAngle={qiblaAngle} rotation={rotation} />
              <View style={styles.topMarker}>
                <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                  <Path d="M10 2 l7 13 h-14 Z" fill="#D4AF37" />
                </Svg>
              </View>
              <View style={styles.hub} />
            </View>

            <View style={styles.info}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{Math.round(qiblaAngle)}°</Text>
                <Text style={styles.statLabel}>Qibla Direction</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatDistance(distance)}</Text>
                <Text style={styles.statLabel}>Distance to Makkah</Text>
              </View>
            </View>

            {!headingAvailable && (
              <View style={styles.calib}>
                <CalibrateIcon />
                <Text style={styles.calibText}>
                  {Location
                    ? 'Move your phone in a figure-eight motion to calibrate the compass.'
                    : 'Install expo-location for live compass heading. Showing static Qibla direction.'}
                </Text>
              </View>
            )}

            <Pressable style={({ pressed }) => [styles.mapBtn, pressed && styles.mapBtnPressed]}>
              <MapIcon />
              <Text style={styles.mapBtnText}>View on Map</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F6F0' },
  backBtn: {
    position: 'absolute',
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qhead: { alignItems: 'center', marginTop: 0 },
  qtitle: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 24, color: '#102A43' },
  qloc: { marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 5 },
  qlocText: { fontSize: 12.5, color: '#52616F' },

  dialWrap: {
    position: 'relative',
    marginTop: 14,
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hchip: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    backgroundColor: '#102A43',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9,
    zIndex: 2,
    shadowColor: 'rgba(16, 42, 67, 0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 4,
  },
  hchipText: { color: '#fff', fontSize: 11.5, fontWeight: '600', letterSpacing: 0.06 },
  topMarker: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    zIndex: 3,
  },
  hub: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F6B50',
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 3,
  },

  info: {
    marginTop: 22,
    width: 350,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 16,
    flexDirection: 'row',
    shadowColor: 'rgba(16, 42, 67, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  stat: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#F4F0E7' },
  statValue: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 20, color: '#102A43' },
  statLabel: { marginTop: 2, fontSize: 11, color: '#7A828C', fontWeight: '500' },

  calib: {
    marginTop: 14,
    width: 350,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  calibText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#6B5A1E', fontWeight: '500' },

  mapBtn: {
    marginTop: 'auto',
    marginBottom: 0,
    width: 350,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0F6B50',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapBtnPressed: { backgroundColor: '#FBF9F3', transform: [{ scale: 0.98 }] },
  mapBtnText: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 14.5, color: '#0F6B50' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 40 },
  loadingText: { marginTop: 8, fontSize: 14, color: '#52616F' },
  errorText: { fontSize: 14, color: '#E12D39', textAlign: 'center', paddingHorizontal: 24 },
  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(15, 107, 80, 0.09)',
    borderRadius: 10,
  },
  retryText: { color: '#0F6B50', fontWeight: '600', fontSize: 14 },
});