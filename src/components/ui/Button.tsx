import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { theme } from '@/constants/theme';

type ButtonProps = Omit<PressableProps, 'children'> & { title: string };

export function Button({ title, disabled, style, ...props }: ButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [
        styles.button,
        (disabled || state.pressed) && styles.dimmed,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
  },
  dimmed: { opacity: 0.6 },
  label: { color: theme.colors.onPrimary, fontSize: 16, fontWeight: '600' },
});
