import { StyleSheet, Text } from 'react-native';
import { Header } from './Header';
import { Card } from './ui/Card';
import { theme } from '@/constants/theme';
import type { PlaceholderScreen as PlaceholderScreenProps } from '@/types';

export function PlaceholderScreen(props: PlaceholderScreenProps) {
  return (
    <Card>
      <Header {...props} />
      <Text style={styles.note}>UI placeholder · Local preview only</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 13, color: theme.colors.muted },
});
