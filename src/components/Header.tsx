import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { PlaceholderScreen } from '@/types';

export function Header({ title, description }: PlaceholderScreen) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  description: { fontSize: 16, lineHeight: 24, color: theme.colors.muted },
});
