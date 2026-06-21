/**
 * Centralised dark-theme design tokens: color, spacing, radius, typography.
 * One source of truth so every component stays visually consistent.
 */
export const theme = {
  colors: {
    // Surfaces
    background: '#0A0A0D',
    surface: '#141419',
    surfaceElevated: '#1B1B22',

    // Display text
    resultText: '#FFFFFF',
    expressionText: '#6E6E7A',
    previewText: '#A7A7B4',
    errorText: '#FF6B6B',

    // Number / default keys
    keyBg: '#1C1C23',
    keyBgPressed: '#2A2A34',
    keyText: '#F4F4F7',

    // Operator keys (+ − × ÷ ( ))
    operatorBg: '#241F1A',
    operatorBgPressed: '#33291F',
    operatorText: '#FF9F45',

    // Scientific / function keys
    functionBg: '#15151B',
    functionBgPressed: '#21212B',
    functionText: '#7FB2FF',

    // Utility keys (AC, DEL)
    utilityBg: '#2A2A34',
    utilityBgPressed: '#373743',
    utilityText: '#FF8A8A',

    // Equals
    equalsBg: '#FF9F45',
    equalsBgPressed: '#FFB066',
    equalsText: '#1A1206',

    // Accent + interactive chrome
    accent: '#FF9F45',
    accentSoft: 'rgba(255,159,69,0.14)',
    toggleTrack: '#16161C',
    toggleActiveBg: '#FF9F45',
    toggleActiveText: '#1A1206',
    toggleInactiveText: '#8B8B98',

    border: 'rgba(255,255,255,0.06)',
    borderStrong: 'rgba(255,255,255,0.10)',
    pressedOverlay: 'rgba(255,255,255,0.10)',
  },
  radius: {
    key: 20,
    card: 26,
    pill: 999,
    tray: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  font: {
    key: 25,
    keyFunction: 16,
    result: 60,
    resultError: 46,
    expression: 26,
    preview: 24,
  },
} as const;

export type Theme = typeof theme;
