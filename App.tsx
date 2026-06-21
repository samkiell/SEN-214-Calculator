import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Display from './src/components/Display';
import Keypad, { KeyDef } from './src/components/Keypad';
import InputModal, { ModalField } from './src/components/InputModal';
import { BASIC_ROWS, SCIENTIFIC_ROWS } from './src/keyLayouts';
import { theme } from './src/theme';
import {
  evaluate,
  formatResult,
  nPr,
  nCr,
  parseNumberList,
  mean,
  variance,
  stdDev,
} from './src/mathEngine';

type ModalKind = null | 'nPr' | 'nCr' | 'stats-mean' | 'stats-var' | 'stats-std';

interface ModalConfig {
  title: string;
  description: string;
  fields: ModalField[];
  compute: (values: Record<string, string>) => number;
}

const MODAL_CONFIGS: Record<Exclude<ModalKind, null>, ModalConfig> = {
  nPr: {
    title: 'Permutations (nPr)',
    description: 'Number of ordered arrangements of r items from n.',
    fields: [
      { key: 'n', label: 'n (total)', placeholder: 'e.g. 5' },
      { key: 'r', label: 'r (chosen)', placeholder: 'e.g. 2' },
    ],
    compute: (v) => nPr(Number(v.n), Number(v.r)),
  },
  nCr: {
    title: 'Combinations (nCr)',
    description: 'Number of ways to choose r items from n (order ignored).',
    fields: [
      { key: 'n', label: 'n (total)', placeholder: 'e.g. 5' },
      { key: 'r', label: 'r (chosen)', placeholder: 'e.g. 2' },
    ],
    compute: (v) => nCr(Number(v.n), Number(v.r)),
  },
  'stats-mean': {
    title: 'Mean (x̄)',
    description: 'Enter numbers separated by commas.',
    fields: [
      {
        key: 'data',
        label: 'Data set',
        placeholder: 'e.g. 4, 8, 15, 16, 23, 42',
        keyboardType: 'default',
      },
    ],
    compute: (v) => mean(parseNumberList(v.data ?? '')),
  },
  'stats-var': {
    title: 'Variance (σ²)',
    description: 'Population variance. Enter comma-separated numbers.',
    fields: [
      {
        key: 'data',
        label: 'Data set',
        placeholder: 'e.g. 4, 8, 15, 16, 23, 42',
        keyboardType: 'default',
      },
    ],
    compute: (v) => variance(parseNumberList(v.data ?? '')),
  },
  'stats-std': {
    title: 'Standard Deviation (σ)',
    description: 'Population std. dev. Enter comma-separated numbers.',
    fields: [
      {
        key: 'data',
        label: 'Data set',
        placeholder: 'e.g. 4, 8, 15, 16, 23, 42',
        keyboardType: 'default',
      },
    ],
    compute: (v) => stdDev(parseNumberList(v.data ?? '')),
  },
};

export default function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [isError, setIsError] = useState(false);
  // After "=", the next number keypress starts a fresh expression.
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [scientific, setScientific] = useState(false);
  const [modalKind, setModalKind] = useState<ModalKind>(null);

  /** Live preview: try to evaluate the current expression silently. */
  const livePreview = useMemo(() => {
    if (expression.trim() === '') return '';
    try {
      return formatResult(evaluate(expression));
    } catch {
      return '';
    }
  }, [expression]);

  const clearError = () => {
    if (isError) {
      setIsError(false);
      setResult('0');
    }
  };

  const handleInsert = (text: string) => {
    clearError();

    setExpression((prev) => {
      // Starting fresh after an evaluation:
      if (justEvaluated) {
        setJustEvaluated(false);
        // If the inserted token is an operator/postfix, continue from result.
        const continuesResult = /^[+\-*/^!)]/.test(text) || text === '^2';
        if (continuesResult && result !== 'Error') {
          return result + text;
        }
        return text;
      }
      return prev + text;
    });
  };

  const handleEquals = () => {
    if (expression.trim() === '') return;
    try {
      const value = evaluate(expression);
      const formatted = formatResult(value);
      setResult(formatted);
      setIsError(false);
      setJustEvaluated(true);
    } catch {
      setResult('Error');
      setIsError(true);
      setJustEvaluated(false);
    }
  };

  const handleClear = () => {
    setExpression('');
    setResult('0');
    setIsError(false);
    setJustEvaluated(false);
  };

  const handleDelete = () => {
    clearError();
    setJustEvaluated(false);
    setExpression((prev) => {
      // Remove a known multi-char function token if it sits at the end.
      const FUNC_TOKENS = [
        'asin(',
        'acos(',
        'atan(',
        'sinh(',
        'cosh(',
        'tanh(',
        'sqrt(',
        'sin(',
        'cos(',
        'tan(',
        'log(',
        'ln(',
        'pi',
      ];
      for (const tok of FUNC_TOKENS) {
        if (prev.endsWith(tok)) return prev.slice(0, -tok.length);
      }
      return prev.slice(0, -1);
    });
  };

  const openModal = (kind: Exclude<ModalKind, null>) => {
    clearError();
    setModalKind(kind);
  };

  const handleModalSubmit = (values: Record<string, string>) => {
    if (!modalKind) return;
    const config = MODAL_CONFIGS[modalKind];
    try {
      const value = config.compute(values);
      const formatted = formatResult(value);
      // Reflect what was computed in the expression line for context.
      setExpression(`${config.title}`);
      setResult(formatted);
      setIsError(false);
      setJustEvaluated(true);
    } catch {
      setResult('Error');
      setIsError(true);
      setJustEvaluated(false);
    }
    setModalKind(null);
  };

  const handleKey = (key: KeyDef) => {
    if (key.action) {
      switch (key.action) {
        case 'equals':
          return handleEquals();
        case 'clear':
          return handleClear();
        case 'delete':
          return handleDelete();
        case 'toggleMode':
          return setScientific((s) => !s);
        case 'nPr':
          return openModal('nPr');
        case 'nCr':
          return openModal('nCr');
        case 'stats-mean':
          return openModal('stats-mean');
        case 'stats-var':
          return openModal('stats-var');
        case 'stats-std':
          return openModal('stats-std');
      }
    }
    if (key.insert !== undefined) {
      handleInsert(key.insert);
    }
  };

  const activeModalConfig = modalKind ? MODAL_CONFIGS[modalKind] : null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar style="light" />
        <View style={styles.container}>
        {/* Header: angle-unit indicator + Basic/Scientific segmented control */}
        <View style={styles.header}>
          <View style={styles.degPill}>
            <Text style={styles.degText}>DEG</Text>
          </View>

          <View style={styles.segment}>
            {(['Basic', 'Sci'] as const).map((mode) => {
              const active =
                (mode === 'Sci' && scientific) ||
                (mode === 'Basic' && !scientific);
              return (
                <Pressable
                  key={mode}
                  onPress={() => setScientific(mode === 'Sci')}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {mode}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Display — flex-grows so the value bottom-aligns just above the keys */}
        <View
          style={[
            styles.displayArea,
            scientific ? styles.displayAreaSci : styles.displayAreaBasic,
          ]}
        >
          <Display
            expression={expression}
            preview={livePreview}
            result={result}
            isError={isError}
            justEvaluated={justEvaluated}
          />
        </View>

        {/* Keys — fill the rest of the screen; no scroll, no gaps */}
        {scientific ? (
          <View style={styles.keypadAreaSci}>
            <View style={styles.sciKeypad}>
              <Keypad rows={SCIENTIFIC_ROWS} onKey={handleKey} />
            </View>
            <View style={styles.basicKeypadSci}>
              <Keypad rows={BASIC_ROWS} onKey={handleKey} />
            </View>
          </View>
        ) : (
          <View style={styles.keypadAreaBasic}>
            <Keypad rows={BASIC_ROWS} onKey={handleKey} />
          </View>
        )}
      </View>

        {/* Multi-input operations modal */}
        <InputModal
          visible={modalKind !== null}
          title={activeModalConfig?.title ?? ''}
          description={activeModalConfig?.description}
          fields={activeModalConfig?.fields ?? []}
          onSubmit={handleModalSubmit}
          onCancel={() => setModalKind(null)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  degPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
  },
  degText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: theme.colors.toggleTrack,
    borderRadius: theme.radius.pill,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  segmentBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    minWidth: 64,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.toggleActiveBg,
  },
  segmentText: {
    color: theme.colors.toggleInactiveText,
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: theme.colors.toggleActiveText,
    fontWeight: '700',
  },
  displayArea: {
    justifyContent: 'flex-end',
    minHeight: 110,
  },
  displayAreaBasic: {
    flex: 3,
  },
  displayAreaSci: {
    flex: 2,
  },
  keypadAreaBasic: {
    flex: 5,
  },
  keypadAreaSci: {
    flex: 9,
  },
  sciKeypad: {
    flex: 5,
  },
  basicKeypadSci: {
    flex: 6,
  },
});
