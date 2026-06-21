import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../theme';

export type ButtonVariant =
  | 'number'
  | 'operator'
  | 'function'
  | 'utility'
  | 'equals'
  | 'toggle';

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** flex weight — use 2 for a double-width key (e.g. "0"). */
  flex?: number;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_BG: Record<ButtonVariant, string> = {
  number: theme.colors.keyBg,
  operator: theme.colors.operatorBg,
  function: theme.colors.functionBg,
  utility: theme.colors.utilityBg,
  equals: theme.colors.equalsBg,
  toggle: theme.colors.toggleBg,
};

const VARIANT_FG: Record<ButtonVariant, string> = {
  number: theme.colors.keyText,
  operator: theme.colors.operatorText,
  function: theme.colors.functionText,
  utility: theme.colors.utilityText,
  equals: theme.colors.equalsText,
  toggle: theme.colors.toggleText,
};

function CalcButton({ label, onPress, variant = 'number', flex = 1, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: theme.colors.pressedOverlay, borderless: false }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: VARIANT_BG[variant], flex },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: VARIANT_FG[variant] },
          variant === 'function' && styles.functionLabel,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 4,
    height: 60,
    borderRadius: theme.radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },
  label: {
    fontSize: 24,
    fontWeight: '500',
  },
  functionLabel: {
    fontSize: 17,
  },
});

export default React.memo(CalcButton);
