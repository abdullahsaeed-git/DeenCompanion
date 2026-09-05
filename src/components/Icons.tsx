import { alpha, colors } from "@/constants/theme";
import { ColorValue } from "react-native";
import Svg, { Circle, Defs, G, Mask, Path, Rect } from "react-native-svg";

// ============================================
// LOGO ILLUSTRATION
// ============================================

export function LogoIllustration({
  size = 19,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width="118" height="118" viewBox="0 0 120 120" fill="none">
      {/* <!-- Replaced colors.primary with #3498db (Blue) --> */}
      <Circle cx="60" cy="60" r="55" stroke="#3498db" strokeOpacity="0.08" />
      <Circle cx="60" cy="60" r="45" fill="#3498db" opacity="0.05" />

      <Defs>
        <Mask id="cres">
          <Rect width="120" height="120" fill="black" />
          <Circle cx="60" cy="30" r="14" fill="white" />
          <Circle cx="66" cy="27" r="12" fill="black" />
        </Mask>
      </Defs>

      {/* <!-- Replaced colors.accent with #f1c40f (Yellow) --> */}
      <Circle cx="60" cy="30" r="14" fill="#f1c40f" mask="url(#cres)" />

      <Path
        d="M81 21.5 L82.4 24.6 L85.5 26 L82.4 27.4 L81 30.5 L79.6 27.4 L76.5 26 L79.6 24.6 Z"
        fill="#f1c40f"
      />

      <Path
        d="M60 63 C52 57.5 40 55.5 27 57.5 L27 87 C40 85 52 87 60 93 C68 87 80 85 93 87 L93 57.5 C80 55.5 68 57.5 60 63 Z"
        fill="#3498db"
      />

      {/* <!-- Replaced colors.background with #ffffff (White) --> */}
      <Path
        d="M60 64 L60 92"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />

      <G
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      >
        <Path d="M33.5 66.5 C41 65.5 49 67 54.5 70.5" />
        <Path d="M33.5 73.5 C41 72.5 49 74 54.5 77.5" />
      </G>

      <G
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      >
        <Path d="M86.5 66.5 C79 65.5 71 67 65.5 70.5" />
        <Path d="M86.5 73.5 C79 72.5 71 74 65.5 77.5" />
      </G>
    </Svg>
  );
}

// ============================================
// SETTINGS ICON
// ============================================

export function SettingsIcon({
  size = 19,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Svg>
  );
}

// ============================================
// SHARE ICON
// ============================================

export function ShareIcon({
  size = 19,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={19}
      height={19}
      viewBox="0 0 20 20"
      fill="none"
      stroke={colors.secondary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M10 12V3.5M6.8 6.2 10 3l3.2 3.2" />
      <Path d="M5 9H4.5A1.5 1.5 0 0 0 3 10.5v5A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 15.5 9H15" />
    </Svg>
  );
}

// ============================================
// BOOK COVER ICON
// ============================================

export function BookCoverIcon({
  size = 19,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.6}
      strokeLinejoin="round"
    >
      <Path d="M12 6c-2-1.4-4.5-1.5-7-.6V19c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V5.4c-2.5-.9-5-.8-7 .6Z" />
      <Path d="M12 6v13.6" />
    </Svg>
  );
}

// ============================================
// DUA CATEGORY ICONS
// ============================================

export function SunIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <Circle cx={12} cy={12} r={4} />
      <Path d="M12 3.5V5M12 19v1.5M3.5 12H5M19 12h1.5M6 6l1.1 1.1M16.9 16.9 18 18M18 6l-1.1 1.1M7.1 16.9 6 18" />
    </Svg>
  );
}

export function MoonIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M16.5 5.2a8 8 0 1 0 4.8 13.1A9 9 0 0 1 16.5 5.2Z" />
    </Svg>
  );
}

export function PlaneIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M3.5 11.5 20.5 4.5l-7 16-2.4-7.2Z" />
    </Svg>
  );
}

export function CupIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M5 10h11v4a5.5 5.5 0 0 1-11 0Z" />
      <Path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 7c0-1 .8-1 .8-2M12 7c0-1 .8-1 .8-2" />
    </Svg>
  );
}

export function MatIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Rect x={5.5} y={4} width={13} height={16} rx={2} />
      <Path d="M12 8c-2 1.4-3 2.6-3 4.5V16h6v-3.5c0-1.9-1-3.1-3-4.5Z" />
    </Svg>
  );
}

export function ShieldIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M12 3l7 2.6V11c0 4.6-3 7.9-7 9.4-4-1.5-7-4.8-7-9.4V5.6Z" />
    </Svg>
  );
}

export function HeartIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M12 19s-7-4.6-7-9.5C5 6.6 7 5 9.2 5c1.3 0 2.3.6 2.8 1.6C12.5 5.6 13.5 5 14.8 5 17 5 19 6.6 19 9.5c0 4.9-7 9.5-7 9.5Z" />
    </Svg>
  );
}

export function HomeIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M5 11 12 5l7 6v9H5Z" />
      <Path d="M10 20v-5h4v5" />
    </Svg>
  );
}

export function CloudIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M7 15a4 4 0 0 1 .6-8 5 5 0 0 1 9.6 1.2A3.4 3.4 0 0 1 17 15Z" />
      <Path d="M12 17v4M9.5 18.5 12 21l2.5-2.5" />
    </Svg>
  );
}

// ============================================
// FEATURES ICONS
// ============================================

export function MosqueIcon({
  size = 18,
  color = colors.primary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M6 20v-6c0-3 2.6-4.6 6-7 3.4 2.4 6 4 6 7v6" />
      <Path d="M12 7V4.5" />
      <Path d="M4 20h16" />
      <Path d="M10 20v-3c0-1 .9-1.6 2-2.4 1.1.8 2 1.4 2 2.4v3" />
    </Svg>
  );
}


export function CalendarIcon({
  size = 18,
  color = colors.primary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Rect x={4} y={5.5} width={16} height={14.5} rx={2.5} />
      <Path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5" />
    </Svg>
  );
}

export function QiblaIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Circle cx={12} cy={12} r={8} />
      <Path d="M15.2 8.8l-1.9 4.5-4.5 1.9 1.9-4.5Z" />
    </Svg>
  );
}

export function TasbihIcon({
  size = 18,
  color = colors.primary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={4.5} r={1.6} fill={color}/>
      <Circle cx={17} cy={6.5} r={1.6} fill={color}/>
      <Circle cx={19} cy={11.5} r={1.6} fill={color}/>
      <Circle cx={7} cy={6.5} r={1.6} fill={color}/>
      <Circle cx={5} cy={11.5} r={1.6} fill={color}/>
      <Circle cx={8} cy={15.5} r={1.6} fill={color}/>
      <Circle cx={16} cy={15.5} r={1.6} fill={color}/>
      <Circle cx={12} cy={18.5} r={2} fill={color} />
      <Path
        d="M12 20.5v2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function HijriIcon({
  size = 18,
  color = colors.primary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Path d="M16.5 5.2a8 8 0 1 0 4.8 13.1A9 9 0 0 1 16.5 5.2Z" />
      <Path d="M15 9l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1Z" />
    </Svg>
  );
}

export function DuaIcon({
  size = 18,
  color = colors.primary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M12 19s-7-4.6-7-9.5C5 6.6 7 5 9.2 5c1.3 0 2.3.6 2.8 1.6C12.5 5.6 13.5 5 14.8 5 17 5 19 6.6 19 9.5c0 4.9-7 9.5-7 9.5Z" />
    </Svg>
  );
}

export function ZakatIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <Circle cx={9} cy={9} r={5} />
      <Circle cx={15} cy={15} r={5} />
      <Path d="M7.5 9h3" />
      <Path d="M13.5 15h3" />
    </Svg>
  );
}

export function VideoIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Rect x={3.5} y={6} width={17} height={12} rx={3} />
      <Path d="M10.5 9.5v5l4.5-2.5Z" fill={colors.primary} stroke="none" />
    </Svg>
  );
}

export function NamesIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M12 3.5l2.2 4.9 5.3.6-3.9 3.6 1 5.2-4.6-2.6-4.6 2.6 1-5.2-3.9-3.6 5.3-.6Z" />
    </Svg>
  );
}

// ============================================
// ISLAMIC CALENDAR ICONS
// ============================================

export function BackIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
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

export function PrevIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
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

export function NextIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StarIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"
        fill={colors.accent}
      />
      <Path
        d="M12 8.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z"
        fill={colors.background}
      />
    </Svg>
  );
}

// ============================================
// ISLAMIC LIBRARY CATEGORY ICONS
// ============================================

export function SearchIcon({
  size = 18,
  color = colors.primary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M9 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
        stroke={color}
        strokeWidth={1.8}
        opacity={opacity}
      />
      <Path
        d="M13 13l3.5 3.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={opacity}
      />
    </Svg>
  );
}

export function BookIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    >
      <Path d="M12 6c-2-1.4-4.5-1.5-7-.6V19c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V5.4c-2.5-.9-5-.8-7 .6Z" />
      <Path d="M12 6v13.6" />
    </Svg>
  );
}

export function ChevronRightIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
    >
      <Path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MainHomeIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <Path d="M4 10.2 10 4.4l6 5.8v6.4h-4.4v-4h-3.2v4H4Z" />
    </Svg>
  );
}

export function QuranIcon({
  size = 18,
  color = colors.primary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M10 6C8 4.6 5.5 4.5 3 5.4V15c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V5.4C14.5 4.5 12 4.6 10 6Z" />
      <Path d="M10 6v9.6" />
    </Svg>
  );
}

export function HadithIcon({
  size = 18,
  color = colors.primary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M6 2.8h8.5A2.5 2.5 0 0 1 17 5.3v11.4a2.5 2.5 0 0 1-2.5 2.5H6a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Z" />
      <Path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3" strokeLinecap="round" />
    </Svg>
  );
}

export function LibraryIcon({
  size = 18,
  color = colors.primary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
         <Path d="M5 3.5h3v17H5ZM10.5 3.5h3v17h-3Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
         <Path d="M16 4.5l3-.8 4 16-3 .8Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
       </Svg>
  );
}

export function PrayerIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M5.5 16.5v-4c0-2.7 2-3.8 4.5-5.9 2.5 2.1 4.5 3.2 4.5 5.9v4" />
      <Path d="M3.5 16.5h13" />
    </Svg>
  );
}

// ============================================
// PRAYER CALENDAR ICONS
// ============================================

export function ExportIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#102A43"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 14V4M8.8 7.2 12 4l3.2 3.2" />
      <Path d="M5 11v6.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V11" />
    </Svg>
  );
}

export function PinIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2.5c-3.3 0-5.5 2.4-5.5 5.5 0 4 5.5 9.5 5.5 9.5s5.5-5.5 5.5-9.5c0-3.1-2.2-5.5-5.5-5.5Z"
        stroke="#0F6B50"
        strokeWidth={1.8}
      />
      <Circle cx={10} cy={8} r={2} fill="#0F6B50" />
    </Svg>
  );
}

/** Gear / Settings icon */
export function GearIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Svg>
  );
}

// ============================================
// PRAYER SETTINGS ICONS
// ============================================
export function ChevronDownIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
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

export function ChevronUpIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
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

export function CheckIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
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

export function GlobeIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
    >
      <Circle cx={12} cy={12} r={8} />
      <Path d="M4 12h16M12 4c2.5 2.4 3.8 5.2 3.8 8S14.5 17.6 12 20c-2.5-2.4-3.8-5.2-3.8-8S9.5 6.4 12 4Z" />
    </Svg>
  );
}

export function AudioIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <Path d="M9 18V7l9-2.5V15" />
      <Circle cx={7} cy={18} r={2.4} />
      <Circle cx={16} cy={15} r={2.4} />
    </Svg>
  );
}

export function ArabicFontIcon() {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M5 17 9 7l4 10M6.4 13.8h5.2M14.5 17l3-7.5 3 7.5M15.6 14.6h3.8" />
    </Svg>
  );
}

export function BellIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Path d="M12 4c-3.3 0-5 2.5-5 5.7v3l-1.5 2.3h13L17 12.7v-3c0-3.2-1.7-5.7-5-5.7Z" />
      <Path d="M10.3 17.5a1.8 1.8 0 0 0 3.4 0" />
    </Svg>
  );
}

export function CalcIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <Path d="M6 8h12M6 12h12M6 16h12M9 6v12M15 6v12" />
    </Svg>
  );
}

export function DownloadIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 4v9M8.8 9.8 12 13l3.2-3.2" />
      <Path d="M5 15v2.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15" />
    </Svg>
  );
}

export function OfflineIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M7 15a4 4 0 0 1 .6-8 5 5 0 0 1 9.6 1.2A3.4 3.4 0 0 1 17 15Z" />
      <Path d="M9 18.5h6" />
    </Svg>
  );
}

export function InfoIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <Circle cx={12} cy={12} r={8} />
      <Path d="M12 11v5M12 7.8v.2" />
    </Svg>
  );
}

export function ResetIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={19}
      height={19}
      viewBox="0 0 20 20"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4.5 8a6 6 0 1 1 1 5.2M4.5 3.8V8h4.2" />
    </Svg>
  );
}

export function SwapIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={19}
      height={19}
      viewBox="0 0 20 20"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4 7h10M11.5 4 14.5 7l-3 3M16 13H6M8.5 10 5.5 13l3 3" />
    </Svg>
  );
}

export function VibrationIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={19}
      height={19}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x={7} y={4} width={6} height={12} rx={1.5} />
      <Path d="M4 7.5c-1.2 1.5-1.2 3.5 0 5M16 7.5c1.2 1.5 1.2 3.5 0 5" />
    </Svg>
  );
}

export function HistoryIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={19}
      height={19}
      viewBox="0 0 20 20"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <Circle cx={10} cy={10} r={7.5} />
      <Path d="M10 6v4.2l2.8 1.6" />
    </Svg>
  );
}

export function TargetIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={15}
      height={15}
      viewBox="0 0 20 20"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.7}
    >
      <Circle cx={10} cy={10} r={7.5} />
      <Circle cx={10} cy={10} r={4} />
      <Circle cx={10} cy={10} r={1} fill={color}/>
    </Svg>
  );
}

export function CloseIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke={colors.secondary}
      strokeWidth={2}
      strokeLinecap="round"
    >
      <Path d="M5 5l10 10M15 5L5 15" />
    </Svg>
  );
}
export function BookmarkIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6 3h8v14l-4-3.2L6 17Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function NotificationsIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2.6c-3.3 0-5.1 2.5-5.1 5.8v3.1l-1.5 2.4h13.2l-1.5-2.4V8.4c0-3.3-1.8-5.8-5.1-5.8Z"
        stroke={colors.secondary}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M8.3 16.4a1.8 1.8 0 0 0 3.4 0"
        stroke={colors.secondary}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}


export function DeleteIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (

    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M6 5h8M8 5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5 5l.8 12a1 1 0 0 0 1 .9h6.4a1 1 0 0 0 1-.9L15 5"
                  stroke={color}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
  )
}



export function RemoveIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 5l10 10M15 5L5 15" />
    </Svg>
  );
}


export function ClockIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.6" />
      <Path d="M10 6v4.2l2.8 1.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function MoreIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <Circle cx="4.5" cy="10" r="1.6" />
      <Circle cx="10" cy="10" r="1.6" />
      <Circle cx="15.5" cy="10" r="1.6" />
    </Svg>
  );
}

export function EmptyPositionIcon({
  size = 18,
  color = colors.secondary,
  opacity = 1,
}: {
  size?: number;
  color?: ColorValue;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Rect x="11" y="11" width="22" height="22" rx="5" stroke={color} strokeWidth="1.5" />
      <Rect x="11" y="11" width="22" height="22" rx="5" stroke={color} strokeWidth="1.5" transform="rotate(45 22 22)" />
    </Svg>
  );
}

