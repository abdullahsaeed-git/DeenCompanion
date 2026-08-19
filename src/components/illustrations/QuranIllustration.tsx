/**
 * Quran Illustration — Onboarding Slide 1
 *
 * Visual elements:
 * - Faint circular backdrop (shared across all 3 slides for continuity)
 * - Dome/arch outline at top with gold star
 * - Open book (center) with text lines and spine
 * - Gold bookmark ribbon
 * - Sound wave arcs (right side) suggesting audio/recitation
 * - Crossed lines at bottom (decorative)
 */

import Svg, { Circle, G, Path } from 'react-native-svg';

export function QuranIllustration() {
  return (
    <Svg width={280} height={280} viewBox="0 0 300 300" fill="none">
      {/* Circular backdrop — faint green circle */}
      <Circle cx={150} cy={152} r={128} fill="#0F6B50" opacity={0.05} />
      <Circle cx={150} cy={152} r={128} stroke="#0F6B50" strokeOpacity={0.08} />

      {/* Dome/arch outline — mosque-like shape at top */}
      <Path
        d="M78 218 L78 142 C78 102 112 80 150 68 C188 80 222 102 222 142 L222 218"
        stroke="#0F6B50"
        strokeOpacity={0.16}
        strokeWidth={1.5}
      />

      {/* Gold dot at dome peak */}
      <Circle cx={150} cy={68} r={3} fill="#D4AF37" />

      {/* Gold star — upper left area */}
      <Path
        d="M96 92 L98.2 97.8 L104 100 L98.2 102.2 L96 108 L93.8 102.2 L88 100 L93.8 97.8 Z"
        fill="#D4AF37"
        opacity={0.9}
      />

      {/* Sound wave arcs — right side, 3 arcs with decreasing opacity */}
      <Path
        d="M236 158 a18 18 0 0 1 0 28"
        stroke="#0F6B50"
        strokeOpacity={0.45}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M245 150 a28 28 0 0 1 0 44"
        stroke="#0F6B50"
        strokeOpacity={0.3}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M254 142 a38 38 0 0 1 0 60"
        stroke="#0F6B50"
        strokeOpacity={0.16}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Crossed decorative lines — bottom */}
      <Path
        d="M112 240 L188 216 M112 216 L188 240"
        stroke="#0F6B50"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.85}
      />

      {/* Open book — main focal element */}
      <Path
        d="M150 158 C136 147 110 143 84 147 L84 204 C110 200 136 204 150 214 C164 204 190 200 216 204 L216 147 C190 143 164 147 150 158 Z"
        fill="#0F6B50"
      />

      {/* Book spine — center vertical line */}
      <Path
        d="M150 159 L150 213"
        stroke="#F8F6F0"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.9}
      />

      {/* Text lines — left page */}
      <G
        stroke="#F8F6F0"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
        fill="none"
      >
        <Path d="M92 156 C104 154 118 156 128 161" />
        <Path d="M92 165 C104 163 118 165 128 170" />
        <Path d="M92 174 C104 172 118 174 128 179" />
      </G>

      {/* Text lines — right page */}
      <G
        stroke="#F8F6F0"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
        fill="none"
      >
        <Path d="M208 156 C196 154 182 156 172 161" />
        <Path d="M208 165 C196 163 182 165 172 170" />
      </G>

      {/* Gold bookmark ribbon — right side of book */}
      <Path
        d="M196 149 L196 176 L190 170 L184 176 L184 149 Z"
        fill="#D4AF37"
      />
    </Svg>
  );
}