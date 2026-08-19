// ============================================
// DEEN COMPANION — DESIGN TOKENS
// ============================================
// Single source of truth for all visual values.
// Every screen and component should import from here.
// Never hardcode colors, spacing, or font sizes.

/**
 * Convert a hex color to an rgba string with the given opacity.
 * Also works with existing rgb/rgba strings.
 */
export function alpha(color: string, opacity: number): string {
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }
  if (color.startsWith('rgb(')) {
    return color.replace(')', `, ${opacity})`).replace('rgb(', 'rgba(');
  }
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const colors = {
  // --- Brand ---
  primary: '#0F6B50',
  secondary: '#102A43',
  accent: '#D4AF37',

  // --- Backgrounds ---
  background: '#F8F6F0',
  backgroundDark: '#101A17',
  surface: '#FFFFFF',
  surfaceDark: '#1A2B24',

  // --- Text ---
  text: '#102A43',
  textDark: '#F8F6F0',
  textSecondary: '#52616F',
  textSecondaryDark: '#9FB3C8',
  textMuted: '#7A828C',
  textDisabled: '#98A2AE',
  textAction: '#33475C',

  // --- Semantic ---
  success: '#2D9F6F',
  error: '#E12D39',
  warning: '#E6A817',
  info: '#137CBD',

  // --- Misc ---
  border: '#E9E4D8',
  borderDark: '#2A3F35',
  divider: '#EFEAE0',
  dividerDark: '#2A3F35',
  overlay: 'rgba(16, 42, 67, 0.4)',
  dotGray: '#C9CFD6',
  iconGray: '#B9C1CA',
  pressedBg: '#FBF9F3',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  heading: 28,
  title: 32,
  display: 40,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const fonts = {
  ui: 'Inter',
  heading: 'Poppins',
  arabic: 'KFGQPC',
};

export const lightTheme = {
  dark: false,
  colors: {
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    textSecondary: colors.textSecondary,
    border: colors.border,
    divider: colors.divider,
    overlay: colors.overlay,
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    text: colors.textDark,
    textSecondary: colors.textSecondaryDark,
    border: colors.borderDark,
    divider: colors.dividerDark,
    overlay: colors.overlay,
  },
};