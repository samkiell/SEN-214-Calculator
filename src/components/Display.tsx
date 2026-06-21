import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  expression: string;
  result: string;
  isError: boolean;
}

/**
 * Top-of-screen display.
 * Result is large at the top; the expression being typed sits below it.
 * Both scroll horizontally so long expressions never clip.
 */
function Display({ expression, result, isError }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.resultRow}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[styles.result, isError && styles.errorResult]}
          numberOfLines={1}
        >
          {result}
        </Text>
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.expressionRow}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.expression} numberOfLines={1}>
          {expression || '0'}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'flex-end',
  },
  resultRow: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minWidth: '100%',
  },
  result: {
    color: theme.colors.resultText,
    fontSize: 56,
    fontWeight: '300',
    textAlign: 'right',
  },
  errorResult: {
    color: theme.colors.errorText,
    fontSize: 44,
  },
  expressionRow: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minWidth: '100%',
  },
  expression: {
    color: theme.colors.expressionText,
    fontSize: 24,
    textAlign: 'right',
    marginTop: 6,
  },
});

export default React.memo(Display);
