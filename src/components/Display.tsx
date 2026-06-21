import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  /** The expression currently being typed (e.g. "5+3"). */
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
 * Top-of-screen display.
 *
 * While typing:  expression sits on the small upper line, and its live
 * running value shows large (muted) below.
 * After "=":     the source expression stays small on top and the result
 * is promoted to the large, bright primary line.
 *
 * Both lines scroll horizontally so long input never clips.
 */
function Display({ expression, preview, result, isError, justEvaluated }: Props) {
  const isFresh = expression === '' && !justEvaluated;

  // Small upper line: the expression context.
  const upper = isFresh ? '' : expression;

  // Large lower line: committed result, live preview, or a resting "0".
  let primary: string;
  let primaryMuted = false;
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
    textAlign: 'right',
    minHeight: 32,
  },
  result: {
    color: theme.colors.resultText,
    fontSize: theme.font.result,
    fontWeight: '300',
    letterSpacing: -1,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  resultMuted: {
    color: theme.colors.previewText,
    fontWeight: '400',
  },
  resultError: {
    color: theme.colors.errorText,
    fontSize: theme.font.resultError,
    fontWeight: '500',
  },
});

export default React.memo(Display);
