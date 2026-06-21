import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  /** The expression currently being typed (e.g. "5*3"). */
  expression: string;
  /** Live evaluation of the expression while typing ("" when invalid). */
  preview: string;
  /** The committed result after "=". */
  result: string;
  isError: boolean;
  /** True right after "=" — promotes the result to the bold primary line. */
  justEvaluated: boolean;
}

/**
 * Turn the internal expression tokens into the same glyphs shown on the keys,
 * so the display reads like real maths (5 × 3, √, π, sin⁻¹) instead of the
 * raw machine syntax (5*3, sqrt(, pi, asin().
 */
function prettify(expr: string): string {
  return expr
    .replace(/asin\(/g, 'sin⁻¹(')
    .replace(/acos\(/g, 'cos⁻¹(')
    .replace(/atan\(/g, 'tan⁻¹(')
    .replace(/sqrt\(/g, '√(')
    .replace(/\bpi\b/g, 'π')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−');
}

/**
 * Top-of-screen display.
 *
 * While typing:  the prettified expression sits on the small upper line, and
 * its live running value shows large (muted) below.
 * After "=":     the source expression stays small on top and the result is
 * promoted to the large, bright digital primary line.
 *
 * Both lines scroll horizontally so long input never clips.
 */
function Display({ expression, preview, result, isError, justEvaluated }: Props) {
  const isFresh = expression === '' && !justEvaluated;

  // Small upper line: the expression context, shown with proper maths glyphs.
  const upper = isFresh ? '' : prettify(expression);

  // Large lower line: committed result, live preview, or a resting "0".
  // Result/preview come straight from the math engine (plain digits) so the
  // digital font renders every glyph — only the expression gets prettified.
  let primary: string;
  let primaryMuted = false;
  const committed = justEvaluated && !isError;
  if (isError) {
    primary = 'Error';
  } else if (justEvaluated) {
    primary = result;
  } else if (preview !== '') {
    primary = preview;
    primaryMuted = true; // a live preview, not a committed answer
  } else {
    // A resting "0" reads as a normal display (bright); a blank typing state
    // stays empty. Only the live preview above is muted.
    primary = isFresh ? '0' : '';
    primaryMuted = false;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.line}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.expression} numberOfLines={1}>
          {upper}
        </Text>
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.line}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[
            styles.result,
            primaryMuted && styles.resultMuted,
            committed && styles.resultCommitted,
            isError && styles.resultError,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {primary}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    justifyContent: 'flex-end',
  },
  line: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minWidth: '100%',
  },
  expression: {
    color: theme.colors.expressionText,
    fontSize: theme.font.expression,
    fontWeight: '400',
    letterSpacing: 1,
    textAlign: 'right',
    minHeight: 32,
  },
  result: {
    // Orbitron — a modern digital/techno typeface for that "calculator LED" feel.
    fontFamily: 'Orbitron_500Medium',
    color: theme.colors.resultText,
    fontSize: 52,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    textAlign: 'right',
    marginTop: theme.spacing.sm,
    textShadowColor: 'rgba(255,159,69,0.18)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  resultMuted: {
    color: theme.colors.previewText,
    textShadowColor: 'transparent',
  },
  resultCommitted: {
    fontFamily: 'Orbitron_700Bold',
    color: theme.colors.resultText,
    textShadowColor: 'rgba(255,159,69,0.40)',
    textShadowRadius: 18,
  },
  resultError: {
    fontFamily: 'Orbitron_500Medium',
    color: theme.colors.errorText,
    fontSize: theme.font.resultError,
    textShadowColor: 'rgba(255,107,107,0.35)',
    textShadowRadius: 16,
  },
});

export default React.memo(Display);
