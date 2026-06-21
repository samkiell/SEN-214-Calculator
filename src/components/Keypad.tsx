import React from 'react';
import { StyleSheet, View } from 'react-native';
import CalcButton, { ButtonVariant } from './CalcButton';

/**
 * A single key definition. `insert` is the literal text appended to the
 * expression; `action` triggers special handling in App (=, AC, DEL, modals).
 * `spacer` renders an empty grid slot so partial rows stay column-aligned.
 */
export interface KeyDef {
  label: string;
  variant?: ButtonVariant;
  flex?: number;
  insert?: string;
  spacer?: boolean;
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
          {row.map((key, keyIndex) =>
            key.spacer ? (
              <View
                key={`${rowIndex}-${keyIndex}-spacer`}
                style={{ flex: key.flex ?? 1, margin: 5 }}
              />
            ) : (
              <CalcButton
                key={`${rowIndex}-${keyIndex}-${key.label}`}
                label={key.label}
                variant={key.variant ?? 'number'}
                flex={key.flex ?? 1}
                onPress={() => onKey(key)}
              />
            )
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    flex: 1,
    width: '100%',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});

export default React.memo(Keypad);
