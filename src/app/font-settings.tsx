import { alpha, colors } from "@/constants/theme";
import { useFontSizes } from "@/hooks/useFontSizes";
import { getLanguage } from "@/services/languageService";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

/* ───────── constants ───────── */



const THUMB = 24;
const THUMB_R = THUMB / 2;

const C = {
  bg: "#F8F6F0",
  card: "#FFFFFF",
  border: "#E9E4D8",
  pri: "#0F6B50",
  pri08: "rgba(15,107,80,0.08)",
  dark: "#102A43",
  body: "#52616F",
  muted: "#7A828C",
  faint: "#98A2AE",
  sep: "#EFEAE0",
  white: "#FFFFFF",
  trackBg: "rgba(16,42,67,0.1)",
} as const;

/* ───────── types ───────── */

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  tick: number;
}

/* ───────── icons ───────── */

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5L7 10l5.5 5.5"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ResetIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 10a7.5 7.5 0 1 1 1.6 4.7"
        stroke={colors.secondary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 6v4.5h4.5"
        stroke={colors.secondary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArabicIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 8c-4-1.5-8-1-11 1v6c3-1.5 7-1.5 11 0M12 9v6"
        stroke={colors.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={18.5} cy={7} r={1.4} fill={colors.primary} />
    </Svg>
  );
}

function TransIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 18L8.5 7l4.5 11M5.6 14.6h5.8M14 18l3.2-8 3.2 8M15.2 15.4h4"
        stroke={colors.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ───────── FontSlider ───────── */

function FontSlider({ min, max, step, value, onChange, tick }: SliderProps) {
  const trackWSV = useSharedValue(0);
  const valueSV = useSharedValue(value);
  const startValSV = useSharedValue(value);
  const startXSV = useSharedValue(0);
  const [trackW, setTrackW] = useState(0);

  useEffect(() => {
    valueSV.value = value;
  }, [value, valueSV]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const fire = useCallback((nv: number) => onChangeRef.current(nv), []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          "worklet";
          startValSV.value = valueSV.value;
          startXSV.value = e.x;
        })
        .onUpdate((e) => {
          "worklet";
          const tw = trackWSV.value;
          if (tw === 0) return;
          const d = (e.translationX / tw) * (max - min);
          let nv = startValSV.value + d;
          nv = Math.round(nv / step) * step;
          nv = Math.max(min, Math.min(max, nv));
          runOnJS(fire)(nv);
        })
        .onEnd((e) => {
          "worklet";
          const tw = trackWSV.value;
          if (tw === 0) return;
          if (Math.abs(e.translationX) < 5) {
            const r = Math.max(0, Math.min(1, startXSV.value / tw));
            let nv = min + r * (max - min);
            nv = Math.round(nv / step) * step;
            nv = Math.max(min, Math.min(max, nv));
            runOnJS(fire)(nv);
          }
        }),
    [min, max, step, trackWSV, valueSV, startValSV, startXSV, fire],
  );

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      trackWSV.value = w;
      setTrackW(w);
    },
    [trackWSV],
  );

  const norm = (value - min) / (max - min);

  const ticks = useMemo(() => {
    const arr: { v: number; n: number; active: boolean }[] = [];
    for (let v = min; v <= max; v += tick)
      arr.push({ v, n: (v - min) / (max - min), active: v === value });
    return arr;
  }, [min, max, tick, value]);

  return (
    <View style={{ marginTop: 16 }}>
      <GestureDetector gesture={gesture}>
        <View onLayout={onLayout} style={s.trackWrap}>
          <View style={[s.track, { backgroundColor: C.trackBg }]}>
            <View
              style={[
                s.trackFill,
                { width: `${norm * 100}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          {trackW > 0 && (
            <View
              style={[
                s.thumb,
                {
                  left: norm * trackW - THUMB_R,
                  backgroundColor: C.white,
                  borderColor: colors.primary,
                },
              ]}
            />
          )}
        </View>
      </GestureDetector>
      <View style={s.numLine} pointerEvents="none">
        {ticks.map((t) => (
          <View key={t.v} style={[s.tickWrap, { left: `${t.n * 100}%` }]}>
            <View
              style={[
                s.tickMark,
                t.active && { height: 8, backgroundColor: colors.primary },
              ]}
            />
            <Text
              style={[
                s.tickNum,
                t.active && { color: colors.primary, fontWeight: "700" },
              ]}
            >
              {t.v}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ───────── screen ───────── */

export default function FontSettingsScreen() {
  const {
    arabic,
    translation,
    setArabicSize,
    setTranslationSize,
    reset,
    config,
  } = useFontSizes();

  const arSlider = useMemo(
    () => ({ ...config.arabic, step: 1, tick: 3 }),
    [config],
  );
  const trSlider = useMemo(
    () => ({ ...config.translation, step: 1, tick: 2 }),
    [config],
  );

  const ARABIC_PREVIEW = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const TRANSLATION_PREVIEW = "In the name of Allah, the Most Merciful, the Most Compassionate.";

    const [translationPreview, setTranslationPreview] = useState(TRANSLATION_PREVIEW);
  
    useFocusEffect(
    useCallback(() => {
    getLanguage() === "ur" ? setTranslationPreview("اللہ کے نام سے جو نہایت مہربان اور بہت رحم کرنے والا ہے۔"): setTranslationPreview("In the name of Allah, the Most Merciful, the Most Compassionate.");
    }, []),
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={s.safe}>
        <View style={s.root}>
          <View style={s.header}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                s.headerBtn,
                pressed && { backgroundColor: "rgba(15,107,80,0.05)" },
              ]}
            >
              <BackIcon />
            </Pressable>
            <Text style={s.title}>Font Size</Text>
            <Pressable
              onPress={reset}
              style={({ pressed }) => [
                s.headerBtn,
                pressed && { backgroundColor: "rgba(15,107,80,0.05)" },
              ]}
            >
              <ResetIcon />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={s.prevCard}>
              <Text style={s.prevLbl}>PREVIEW</Text>
              <Text style={[s.prevAr, { fontSize: arabic , padding: arabic * 0.3}]}>
                {ARABIC_PREVIEW}
              </Text>
              <View style={s.prevSep} />
              <Text style={[s.prevTr, { fontSize: translation, padding: translation * 0.3, lineHeight: translation * 1.3 }]}>
                {translationPreview}
              </Text>
            </View>

            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={s.cardIco}>
                  <ArabicIcon />
                </View>
                <View style={s.cardLbl}>
                  <Text style={s.cardTtl}>Arabic (Quran)</Text>
                  <Text style={s.cardSub}>Uthmani / Amiri script</Text>
                </View>
                <View style={s.badge}>
                  <Text style={s.badgeTxt}>{arabic}px</Text>
                </View>
              </View>
              <FontSlider
                {...arSlider}
                value={arabic}
                onChange={setArabicSize}
              />
            </View>

            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={s.cardIco}>
                  <TransIcon />
                </View>
                <View style={s.cardLbl}>
                  <Text style={s.cardTtl}>Translation</Text>
                  <Text style={s.cardSub}>Urdu/English Text</Text>
                </View>
                <View style={s.badge}>
                  <Text style={s.badgeTxt}>{translation}px</Text>
                </View>
              </View>
              <FontSlider
                {...trSlider}
                value={translation}
                onChange={setTranslationSize}
              />
            </View>

            <Text style={s.footer}>
              Applies to Quran reader, Hadith &amp; Duas
            </Text>
          </ScrollView>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

/* ───────── styles ───────── */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 20,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 48, gap: 14 },
  prevCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    shadowColor: "#102A43",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  prevLbl: {
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 10,
  },
  prevAr: {
    color: colors.secondary,
    textAlign: "center",
    lineHeight: 50,
    fontFamily: "Amiri",
    padding: 20,
  },
  prevSep: {
    width: "60%",
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  prevTr: {
    color: C.body,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Inter",
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#102A43",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIco: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardLbl: { flex: 1, marginRight: 4 },
  cardTtl: { fontSize: 15, fontWeight: "600", color: colors.secondary },
  cardSub: { fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  badge: {
    backgroundColor: alpha(colors.primary, 0.08),
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 9,
  },
  badgeTxt: { fontSize: 14, fontWeight: "600", color: colors.primary },
  trackWrap: { height: THUMB, justifyContent: "center", overflow: "visible" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  trackFill: { height: "100%", borderRadius: 3 },
  thumb: {
    position: "absolute",
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB_R,
    borderWidth: 2,
    top: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  numLine: { marginTop: 8, height: 32, position: "relative" },
  tickWrap: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -0.5 }],
  },
  tickMark: {
    width: 1,
    height: 5,
    backgroundColor: colors.textMuted,
    borderRadius: 0.5,
  },
  tickNum: { fontSize: 10, color: C.faint, marginTop: 4, fontWeight: "500" },
  footer: {
    textAlign: "center" as const,
    fontSize: 11.5,
    color: C.faint,
    marginTop: 2,
  },
});
