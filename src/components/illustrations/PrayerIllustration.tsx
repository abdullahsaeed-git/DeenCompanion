/**
 * Prayer Illustration — Onboarding Slide 3
 *
 * Visual elements:
 * - Same circular backdrop (continuity)
 * - Mosque silhouette outline (domes, minarets, base line)
 * - Prayer clock — large white circle with tick marks and two hands
 * - Qibla compass badge — small circle with gold arrow
 * - Adhan notification pill — bell icon with text lines
 */

import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export function PrayerIllustration() {
  return (
    <Svg width={280} height={280} viewBox="0 0 300 300" fill="none">
      {/* Circular backdrop */}
      <Circle cx={150} cy={152} r={128} fill="#0F6B50" opacity={0.05} />
      <Circle cx={150} cy={152} r={128} stroke="#0F6B50" strokeOpacity={0.08} />

      {/* Mosque silhouette — dome, minarets, base */}
      <G
        stroke="#0F6B50"
        strokeOpacity={0.14}
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <Path d="M104 150 C104 120 124 106 150 94 C176 106 196 120 196 150" />
        <Path d="M150 94 V82" />
        <Path d="M86 152 V94" />
        <Path d="M214 152 V94" />
        <Path d="M80 152 H220" />
      </G>

      {/* Gold dot at dome peak */}
      <Circle cx={150} cy={79} r={3} fill="#D4AF37" />

      {/* Gold star — right side */}
      <Path
        d="M212 88 L214.2 93.8 L220 96 L214.2 98.2 L212 104 L209.8 98.2 L204 96 L209.8 93.8 Z"
        fill="#D4AF37"
        opacity={0.9}
      />

      {/* Shadow ellipse */}
      <Ellipse cx={150} cy={252} rx={88} ry={10} fill="#102A43" opacity={0.06} />

      {/* Prayer clock — main focal element */}
      <Circle
        cx={150} cy={170} r={64}
        fill="#FFFFFF" stroke="#0F6B50" strokeWidth={2.5}
      />

      {/* Clock tick marks — 12, 6, 9, 3 o'clock positions */}
      <G
        stroke="#0F6B50" strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round"
      >
        <Path d="M150 114 V122" />
        <Path d="M150 218 V226" />
        <Path d="M94 170 H102" />
        <Path d="M198 170 H206" />
      </G>

      {/* Clock hands */}
      <Path
        d="M150 170 L130 154"
        stroke="#0F6B50" strokeWidth={3.5} strokeLinecap="round"
      />
      <Path
        d="M150 170 L174 136"
        stroke="#0F6B50" strokeWidth={3.5} strokeLinecap="round"
      />

      {/* Clock center dot — gold */}
      <Circle cx={150} cy={170} r={4.5} fill="#D4AF37" />

      {/* Qibla compass badge — lower right */}
      <Circle
        cx={212} cy={216} r={26}
        fill="#FFFFFF" stroke="#0F6B50" strokeOpacity={0.35} strokeWidth={1.5}
      />
      <G>
        {/* Compass needle line */}
        <Path
          d="M204 224 L220 208"
          stroke="#0F6B50" strokeWidth={2.5} strokeLinecap="round"
        />
        {/* Gold arrow tip pointing to Qibla */}
        <Path d="M220 208 l-7.5 1.8 l5.7 5.7 Z" fill="#D4AF37" />
        {/* Compass center dot */}
        <Circle cx={212} cy={216} r={2.5} fill="#0F6B50" />
      </G>

      {/* Adhan notification pill — upper left area */}
      <G>
        <Rect
          x={36} y={118} width={92} height={36} rx={18}
          fill="#FFFFFF" stroke="#0F6B50" strokeOpacity={0.35} strokeWidth={1.5}
        />
        {/* Bell icon */}
        <Path
          d="M56 127 c-5.5 0 -8.5 4 -8.5 9.5 v4.5 l-3 4 h23 l-3 -4 v-4.5 c0 -5.5 -3 -9.5 -8.5 -9.5 Z"
          stroke="#0F6B50" strokeWidth={2} strokeLinejoin="round"
        />
        <Path
          d="M53 146.5 a3 3 0 0 0 6 0"
          stroke="#0F6B50" strokeWidth={2} strokeLinecap="round"
        />
        {/* Gold notification dot */}
        <Circle cx={64} cy={126} r={3.5} fill="#D4AF37" />
        {/* Placeholder text lines */}
        <Path
          d="M76 131 H112 M76 139 H100"
          stroke="#0F6B50" strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}