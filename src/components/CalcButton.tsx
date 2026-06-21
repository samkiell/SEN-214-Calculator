import React, { useRef } from 'react';
import {
  Animated,
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

interface VariantStyle {
  bg: string;
  bgPressed: string;
  fg: string;
  bordered: boolean;
}

const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  number: {
    bg: theme.colors.keyBg,
    bgPressed: theme.colors.keyBgPressed,
    fg: theme.colors.keyText,
    bordered: true,
  },
  operator: {
    bg: theme.colors.operatorBg,
    bgPressed: theme.colors.operatorBgPressed,
    fg: theme.colors.operatorText,
    bordered: true,
  },
  function: {
    bg: theme.colors.functionBg,
    bgPressed: theme.colors.functionBgPressed,
    fg: theme.colors.functionText,
    bordered: true,
  },
  utility: {
    bg: theme.colors.utilityBg,
    bgPressed: theme.colors.utilityBgPressed,
    fg: theme.colors.utilityText,
    bordered: false,
  },
  equals: {
    bg: theme.colors.equalsBg,
    bgPressed: theme.colors.equalsBgPressed,
    fg: theme.colors.equalsText,
    bordered: false,
  },
  toggle: {
    bg: theme.colors.toggleActiveBg,
    bgPressed: theme.colors.equalsBgPressed,
    fg: theme.colors.toggleActiveText,
    bordered: false,
  },
};

function CalcButton({ label, onPress, variant = 'number', flex = 1, style }: Props) {
  const v = VARIANTS[variant];
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 6,
    }).start();

  return (
    <Animated.View style={[styles.wrap, { flex, transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.93)}
        onPressOut={() => animateTo(1)}
        android_ripple={{ color: theme.colors.pressedOverlay, borderless: false }}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? v.bgPressed : v.bg },
          v.bordered && styles.bordered,
          variant === 'equals' && styles.elevated,
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: v.fg },
            variant === 'function' && styles.functionLabel,
            variant === 'equals' && styles.equalsLabel,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    margin: 5,
  },
  button: {
    flex: 1,
    minHeight: 46,
    borderRadius: theme.radius.key,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bordered: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  elevated: {
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    fontSize: theme.font.key,
    fontWeight: '500',
  },
  functionLabel: {
    fontSize: theme.font.keyFunction,
    fontWeight: '600',
  },
  equalsLabel: {
    fontSize: 28,
    fontWeight: '700',
  },
});

export default React.memo(CalcButton);
