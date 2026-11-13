import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OceanBackdrop } from '@/components/splash/OceanBackdrop';
import { BrandMark } from '@/components/splash/BrandMark';
import { WelcomeActions } from '@/components/splash/WelcomeActions';

/** Static destination of the splash transition; the background still gently moves. */
export default function WelcomeScreen() {
  const { height } = useWindowDimensions();
  return (
    <View style={styles.page}>
      <OceanBackdrop />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={[styles.brand, { top: height * 0.165 }]}>
            <BrandMark />
          </View>
          <View style={[styles.actions, { bottom: Math.max(32, height * 0.075) }]}>
            <WelcomeActions onGetStarted={() => router.push('/role-select')} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FBFCF8' },
  safeArea: { flex: 1 },
  content: { flex: 1, overflow: 'hidden' },
  brand: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  actions: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
});
