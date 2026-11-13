import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Navbar } from '@/components/Navbar';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <Navbar />
            <View style={styles.screen}>
              <Stack screenOptions={{ headerShown: false, contentStyle: styles.stack }} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, padding: theme.spacing.md },
  content: { width: '100%', maxWidth: theme.contentWidth, alignSelf: 'center', gap: theme.spacing.lg, flex: 1 },
  screen: { flex: 1, minHeight: 280 },
  stack: { backgroundColor: theme.colors.background },
});
