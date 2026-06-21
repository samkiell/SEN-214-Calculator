/** Centralised dark-theme color + sizing tokens. */
export const theme = {
  colors: {
    background: '#0d0d0f',
    displayBg: '#0d0d0f',
    resultText: '#ffffff',
    expressionText: '#8a8a90',
    errorText: '#ff5c5c',

    // Number / default keys
    keyBg: '#1c1c1f',
    keyText: '#ffffff',

    // Operator keys
    operatorBg: '#2c2c30',
    operatorText: '#ff9f0a',

    // Accent / function keys (scientific)
    functionBg: '#161618',
    functionText: '#5ac8fa',

    // Top utility keys (AC, DEL)
    utilityBg: '#3a3a3e',
    utilityText: '#ff5c5c',

    // Equals
    equalsBg: '#ff9f0a',
    equalsText: '#ffffff',

    // Toggle
    toggleBg: '#5ac8fa',
    toggleText: '#04121a',

    pressedOverlay: 'rgba(255,255,255,0.12)',
  },
  radius: 16,
} as const;

export type Theme = typeof theme;
