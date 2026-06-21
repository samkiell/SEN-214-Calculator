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

  // Reset the fields whenever the modal (re)opens.
  useEffect(() => {
    if (visible) setValues({});
  }, [visible, title]);

  const update = (key: string, text: string) =>
    setValues((prev) => ({ ...prev, [key]: text }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Stop taps inside the card from dismissing. */}
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.title}>{title}</Text>
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}

            {fields.map((f) => (
              <View key={f.key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={theme.colors.expressionText}
                  keyboardType={f.keyboardType ?? 'numeric'}
                  value={values[f.key] ?? ''}
                  onChangeText={(t) => update(f.key, t)}
                  autoFocus={fields[0].key === f.key}
                />
              </View>
            ))}

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={onCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.okBtn]}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1c1c1f',
    borderRadius: 20,
    padding: 22,
  },
  title: {
    color: theme.colors.resultText,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: theme.colors.expressionText,
    fontSize: 14,
    marginBottom: 12,
  },
  fieldGroup: {
    marginTop: 12,
  },
  fieldLabel: {
    color: theme.colors.functionText,
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0d0d0f',
    color: theme.colors.resultText,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 22,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
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
