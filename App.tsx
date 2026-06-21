import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Display from './src/components/Display';
import Keypad, { KeyDef } from './src/components/Keypad';
import CalcButton from './src/components/CalcButton';
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
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header with mode toggle */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Calculator</Text>
          <CalcButton
            label={scientific ? 'BASIC' : 'SCI'}
            variant="toggle"
            onPress={() => setScientific((s) => !s)}
            style={styles.toggle}
            flex={0}
          />
        </View>

        {/* Display */}
        <View style={styles.displayArea}>
          <Display
            expression={
              isError
                ? expression
                : justEvaluated
                ? expression
                : expression + (livePreview ? `\n= ${livePreview}` : '')
            }
            result={result}
            isError={isError}
          />
        </View>

        {/* Keys */}
        <ScrollView
          style={styles.keysScroll}
          contentContainerStyle={styles.keysContent}
          showsVerticalScrollIndicator={false}
        >
          {scientific && (
            <View style={styles.sciSection}>
              <Keypad rows={SCIENTIFIC_ROWS} onKey={handleKey} />
            </View>
          )}
          <Keypad rows={BASIC_ROWS} onKey={handleKey} />
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  appTitle: {
    color: theme.colors.resultText,
    fontSize: 20,
    fontWeight: '600',
  },
  toggle: {
    paddingHorizontal: 18,
    minWidth: 86,
    height: 44,
    margin: 0,
  },
  displayArea: {
    minHeight: 150,
    justifyContent: 'flex-end',
  },
  keysScroll: {
    flex: 1,
  },
  keysContent: {
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  sciSection: {
    marginBottom: 4,
  },
});
