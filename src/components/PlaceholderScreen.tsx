import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './Header';
import { Card } from './ui/Card';
import { theme } from '@/constants/theme';
import type { PlaceholderScreen as PlaceholderScreenProps } from '@/types';

/** The original non-splash screens remain placeholders for future frontend work. */
export function PlaceholderScreen(props: PlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.backButton}>
          <Text style={styles.backLabel}>‹  Back</Text>
        </Pressable>
        <Card>
          <Header {...props} />
          <Text style={styles.note}>UI placeholder · Backend not connected</Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBFCF8' },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  backButton: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 4 },
  backLabel: { color: theme.colors.primary, fontSize: 17, fontWeight: '600' },
  note: { fontSize: 13, color: theme.colors.muted },
});
