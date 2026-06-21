import React from 'react';
import { StyleSheet, View } from 'react-native';
import CalcButton, { ButtonVariant } from './CalcButton';

/**
 * A single key definition. `insert` is the literal text appended to the
 * expression; `action` triggers special handling in App (=, AC, DEL, modals).
 */
export interface KeyDef {
  label: string;
  variant?: ButtonVariant;
  flex?: number;
  insert?: string;
  action?:
    | 'equals'
    | 'clear'
    | 'delete'
    | 'toggleMode'
    | 'nPr'
    | 'nCr'
    | 'stats-mean'
    | 'stats-var'
    | 'stats-std';
}

interface Props {
  rows: KeyDef[][];
  onKey: (key: KeyDef) => void;
}

function Keypad({ rows, onKey }: Props) {
  return (
    <View style={styles.pad}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => (
            <CalcButton
              key={`${rowIndex}-${keyIndex}-${key.label}`}
              label={key.label}
              variant={key.variant ?? 'number'}
              flex={key.flex ?? 1}
              onPress={() => onKey(key)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    width: '100%',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
});

export default React.memo(Keypad);
