import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../theme';

export interface ModalField {
  key: string;
  label: string;
  placeholder?: string;
  keyboardType?: 'numeric' | 'default';
}

interface Props {
  visible: boolean;
  title: string;
  description?: string;
  fields: ModalField[];
  /** Called with a map of field key -> entered string. */
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
}

/**
 * Generic input modal used by operations that need free-form / multi-value
 * input (nPr, nCr, and the statistical functions which take a list).
 */
function InputModal({
  visible,
  title,
  description,
  fields,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);

  // Reset the fields whenever the modal (re)opens.
  useEffect(() => {
    if (visible) {
      setValues({});
      setFocused(null);
    }
  }, [visible, title]);

  const update = (key: string, text: string) =>
    setValues((prev) => ({ ...prev, [key]: text }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          {/* Stop taps inside the card from dismissing. */}
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}

            {fields.map((f) => (
              <View key={f.key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={[styles.input, focused === f.key && styles.inputFocused]}
                  placeholder={f.placeholder}
                  placeholderTextColor={theme.colors.expressionText}
                  keyboardType={f.keyboardType ?? 'numeric'}
                  value={values[f.key] ?? ''}
                  onChangeText={(t) => update(f.key, t)}
                  onFocus={() => setFocused(f.key)}
                  onBlur={() => setFocused((cur) => (cur === f.key ? null : cur))}
                  autoFocus={fields[0].key === f.key}
                  selectionColor={theme.colors.accent}
                />
              </View>
            ))}

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.cancelBtn,
                  pressed && styles.pressed,
                ]}
                onPress={onCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.okBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() => onSubmit(values)}
              >
                <Text style={styles.okText}>Compute</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  kav: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.card,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },
  title: {
    color: theme.colors.resultText,
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    color: theme.colors.expressionText,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldGroup: {
    marginTop: 18,
  },
  fieldLabel: {
    color: theme.colors.functionText,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.resultText,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  inputFocused: {
    borderColor: theme.colors.accent,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 26,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cancelBtn: {
    backgroundColor: theme.colors.utilityBg,
  },
  okBtn: {
    backgroundColor: theme.colors.equalsBg,
  },
  cancelText: {
    color: theme.colors.resultText,
    fontSize: 16,
    fontWeight: '600',
  },
  okText: {
    color: theme.colors.equalsText,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default InputModal;
