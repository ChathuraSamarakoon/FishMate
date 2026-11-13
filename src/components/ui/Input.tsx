import { useId } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { theme } from '@/constants/theme';

type InputProps = TextInputProps & { label: string };

export function Input({ label, style, nativeID, ...props }: InputProps) {
  const id = useId();
  const inputId = nativeID ?? id;
  return (
    <View style={styles.container}>
      <Text nativeID={`${inputId}-label`} style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        nativeID={inputId}
        accessibilityLabel={label}
        accessibilityLabelledBy={`${inputId}-label`}
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  label: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  input: {
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 16,
  },
});
