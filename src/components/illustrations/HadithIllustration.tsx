/**
 * Hadith Illustration — Onboarding Slide 2
 *
 * Visual elements:
 * - Same circular backdrop and dome outline (continuity with slide 1)
 * - Three stacked books at bottom (bottom: solid green, middle: outlined,
 *   top: white card with gold bookmark and text lines)
 * - Floating search pill (upper right) with search icon and text lines
 */

import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export function HadithIllustration() {
  return (
    <Svg width={280} height={280} viewBox="0 0 300 300" fill="none">
      {/* Circular backdrop — same as slide 1 for visual continuity */}
      <Circle cx={150} cy={152} r={128} fill="#0F6B50" opacity={0.05} />
      <Circle cx={150} cy={152} r={128} stroke="#0F6B50" strokeOpacity={0.08} />

      {/* Dome outline — lighter than slide 1 to push it further back */}
      <Path
        d="M78 218 L78 142 C78 102 112 80 150 68 C188 80 222 102 222 142 L222 218"
        stroke="#0F6B50"
        strokeOpacity={0.12}
        strokeWidth={1.5}
      />

      {/* Gold dot at dome peak */}
      <Circle cx={150} cy={68} r={3} fill="#D4AF37" />

      {/* Gold star */}
      <Path
        d="M96 92 L98.2 97.8 L104 100 L98.2 102.2 L96 108 L93.8 102.2 L88 100 L93.8 97.8 Z"
        fill="#D4AF37"
        opacity={0.9}
      />

      {/* Shadow ellipse — ground shadow under books */}
      <Ellipse cx={150} cy={250} rx={88} ry={10} fill="#102A43" opacity={0.06} />

      {/* Bottom book — solid green, slightly rotated */}
      <G transform="rotate(-3 150 221)">
        <Rect x={78} y={204} width={144} height={34} rx={9} fill="#0F6B50" />
        <Path
          d="M90 221 H210"
          stroke="#F8F6F0"
          strokeWidth={1.5}
          opacity={0.25}
          strokeLinecap="round"
        />
      </G>

      {/* Middle book — transparent fill with green outline, slightly rotated other way */}
      <G transform="rotate(2.5 150 192)">
        <Rect
          x={84} y={176} width={132} height={32} rx={9}
          fill="#0F6B50" opacity={0.14}
        />
        <Rect
          x={84} y={176} width={132} height={32} rx={9}
          stroke="#0F6B50" strokeOpacity={0.45} strokeWidth={1.5}
        />
      </G>

      {/* Top manuscript card — white with green border */}
      <Rect
        x={90} y={140} width={120} height={42} rx={9}
        fill="#FFFFFF" stroke="#0F6B50" strokeWidth={2}
      />

      {/* Gold bookmark on manuscript card */}
      <Path d="M104 140 v26 l6 -6 l6 6 v-26 Z" fill="#D4AF37" />

      {/* Text lines on manuscript card */}
      <G stroke="#0F6B50" strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round">
        <Path d="M126 154 H196" />
        <Path d="M126 162 H196" />
        <Path d="M126 170 H176" />
      </G>

      {/* Floating search pill — upper right area */}
      <G>
        <Rect
          x={170} y={112} width={92} height={36} rx={18}
          fill="#FFFFFF" stroke="#0F6B50" strokeOpacity={0.35} strokeWidth={1.5}
        />
        {/* Search circle icon */}
        <Circle cx={190} cy={129} r={7.5} stroke="#0F6B50" strokeWidth={2} />
        <Path
          d="M195.5 134.5 L201 140"
          stroke="#0F6B50" strokeWidth={2} strokeLinecap="round"
        />
        {/* Placeholder text lines */}
        <Path
          d="M210 125 H246 M210 133 H232"
          stroke="#0F6B50" strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round"
        />
        {/* Gold dot at end of text */}
        <Circle cx={252} cy={129} r={3} fill="#D4AF37" />
      </G>
    </Svg>
  );
}