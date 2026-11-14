import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import { AnimatedFishermanTabs } from '@/components/fisherman/AnimatedFishermanTabs';
import { FishermanProvider } from '@/components/fisherman/FishermanContext';

export default function FishermanLayout() {
  const pathname = usePathname();
  const segment = pathname.split('/').filter(Boolean)[1] ?? 'dashboard';
  const showTabs = [
    'dashboard',
    'orders',
    'listings',
    'trips',
    'profile',
    's22',
    's06',
    's12',
    's09',
    's21',
  ].includes(segment);

  return (
    <FishermanProvider>
      <View style={{ flex: 1, backgroundColor: '#F4F8FA' }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F4F8FA' },
          }}
        >
          <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
          <Stack.Screen name="orders" options={{ animation: 'fade' }} />
          <Stack.Screen name="listings" options={{ animation: 'fade' }} />
          <Stack.Screen name="trips" options={{ animation: 'fade' }} />
          <Stack.Screen name="profile" options={{ animation: 'fade' }} />
          <Stack.Screen name="s06" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s12" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s22" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s09" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="s21" options={{ animation: 'slide_from_right' }} />
        </Stack>
        {showTabs ? <AnimatedFishermanTabs current={segment} /> : null}
      </View>
    </FishermanProvider>
  );
}
